// script.js

// CONFIGURACIÓN DE HORARIOS Y TURNOS
const TIME_INTERVALS = {
  "lunes": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
  "martes": ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
  "miércoles": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
  "jueves": ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
  "viernes": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]
};
const MAX_TURNS_PER_DAY = 12;

// URL del Web App de Apps Script
const scriptURL = 'https://script.google.com/macros/s/AKfycbyVQvnmKwVK5gNdCGWC0vMl3wYdXCJGkMouGwFjhBb-_6CBl6Vm4SoSnVJk7UK9UiVT/exec';

// Variables globales
let bookedTurns = [];

// EVENTOS PRINCIPALES
window.addEventListener("load", () => {
  document.getElementById("user-form").addEventListener("submit", startBookingFlow);
});

function startBookingFlow(e) {
  e.preventDefault();
  document.getElementById("user-section").style.display = "none";
  document.getElementById("calendar-section").style.display = "block";
  setupDateInput();
  loadBookedTurns();
}

function setupDateInput() {
  const dateInput = document.getElementById("date");
  const today = new Date();
  dateInput.min = formatDate(today);
  dateInput.max = formatDate(addDays(today, 30));
  dateInput.addEventListener("change", () => renderTimes(dateInput.value));
}

function renderTimes(dateStr) {
  const selectedDate = new Date(dateStr);
  const dayName = selectedDate.toLocaleDateString("es-ES", { weekday: "long" });
  const optionsContainer = document.getElementById("time-options");
  optionsContainer.innerHTML = "";

  const times = TIME_INTERVALS[dayName];
  if (!times) {
    optionsContainer.innerHTML = `<p>No hay turnos disponibles este día.</p>`;
    return;
  }

  const bookedForDay = bookedTurns.filter(t => t.date === dateStr);
  if (bookedForDay.length >= MAX_TURNS_PER_DAY) {
    optionsContainer.innerHTML = `<p>Día completo. Elegí otra fecha.</p>`;
    return;
  }

  times.forEach(time => {
    const disabled = bookedForDay.some(t => t.time === time);
    const button = document.createElement("button");
    button.textContent = time;
    button.className = "time-btn";
    button.disabled = disabled;
    button.onclick = () => reserveTurn(dateStr, time);
    optionsContainer.appendChild(button);
  });
}

function reserveTurn(date, time) {
  const name = document.getElementById("full-name").value;
  const dni = document.getElementById("dni").value;
  const birth = document.getElementById("birthdate").value;

  const data = {
    action: "reserve",
    nombre: name,
    dni: dni,
    nacimiento: birth,
    fecha: date,
    hora: time
  };

  fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.result === "success") {
        alert(`✅ Turno reservado para el ${date} a las ${time}`);
        bookedTurns.push({ date, time });
        renderTimes(date);
      } else {
        alert(`❌ ${resp.message}`);
      }
    })
    .catch(() => alert("Hubo un error al reservar el turno."));
}

function loadBookedTurns() {
  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      bookedTurns = data;
    })
    .catch(() => alert("No se pudieron cargar los turnos existentes."));
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
