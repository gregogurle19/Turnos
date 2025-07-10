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
document.addEventListener('DOMContentLoaded', () => {
  const startForm = document.getElementById('start-form');
  const introForm = document.getElementById('intro-form');
  const mainContent = document.getElementById('main-content');

  startForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('full-name').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const dob = document.getElementById('dob').value.trim();

    if (name && dni && dob) {
      // Ocultamos el formulario inicial
      introForm.style.display = 'none';

      // Mostramos el calendario con efecto suave
      mainContent.style.display = 'block';
      mainContent.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('Por favor completá todos los campos.');
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("personal-data-form");
  const startForm = document.getElementById("start-form");
  const bookingSection = document.getElementById("booking-section");
  const calendarDiv = document.getElementById("calendar");
  const slotsContainer = document.getElementById("slots-container");
  const slotsSection = document.getElementById("time-slots");

  // Mostrar sección al completar datos
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const dni = document.getElementById("dni").value.trim();
    const dob = document.getElementById("birthDate").value.trim();

    if (name && dni && dob) {
      startForm.classList.add("hidden");
      bookingSection.classList.remove("hidden");
      generateCalendar();
    } else {
      alert("Completá todos los campos");
    }
  });

  // Generar calendario
  function generateCalendar() {
    const today = new Date();
    const calendarDays = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const day = date.getDay();

      // Solo días permitidos
      if ([1, 2, 3, 4, 5].includes(day)) {
        const isoDate = date.toISOString().split("T")[0];
        const div = document.createElement("div");
        div.className = "calendar-day";
        div.textContent = isoDate;
        div.dataset.date = isoDate;
        div.addEventListener("click", () => showSlots(isoDate, day));
        calendarDiv.appendChild(div);
      }
    }
  }

  // Mostrar horarios según el día de la semana
  function showSlots(date, day) {
    const morning = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];
    const evening = ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

    let availableSlots = [];

    if ([1, 3, 5].includes(day)) {
      availableSlots = morning;
    } else if ([2, 4].includes(day)) {
      availableSlots = evening;
    }

    slotsContainer.innerHTML = "";
    slotsSection.classList.remove("hidden");

    availableSlots.forEach((slot) => {
      const slotDiv = document.createElement("div");
      slotDiv.className = "slot";
      slotDiv.textContent = slot;
      slotDiv.addEventListener("click", () => {
        alert(`Reservaste el ${date} a las ${slot}`);
        // acá iría submitToSheet si conectás con Google Sheets
      });
      slotsContainer.appendChild(slotDiv);
    });

    slotsSection.scrollIntoView({ behavior: "smooth" });
  }
});
