// script.js

const TIME_INTERVALS = {
  lunes: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
  martes: ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
  miércoles: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
  jueves: ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
  viernes: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
};
const MAX_TURNS_PER_DAY = 12;

const scriptURL = 'https://script.google.com/macros/s/AKfycbyVQvnmKwVK5gNdCGWC0vMl3wYdXCJGkMouGwFjhBb-_6CBl6Vm4SoSnVJk7UK9UiVT/exec';

let bookedTurns = [];
let selectedDate = null;
let selectedTime = null;

window.addEventListener('load', () => {
  // Limitar fecha max en el input nacimiento a hoy
  const birthDateInput = document.getElementById('birthDate');
  birthDateInput.max = new Date().toISOString().split('T')[0];

  document.getElementById('personal-data-form').addEventListener('submit', e => {
    e.preventDefault();
    startBooking();
  });

  document.getElementById('confirm-booking-btn').addEventListener('click', () => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor seleccioná un día y horario.');
      return;
    }
    sendBooking();
  });

  loadBookedTurns();
});

function startBooking() {
  // Validar datos simples
  const fullName = document.getElementById('fullName').value.trim();
  const dni = document.getElementById('dni').value.trim();
  const birthDate = document.getElementById('birthDate').value;

  if (!fullName || !dni || !birthDate) {
    alert('Completá todos los campos para continuar.');
    return;
  }

  // Ocultar formulario inicial y mostrar calendario
  document.getElementById('start-form').classList.add('hidden');
  document.getElementById('booking-section').classList.remove('hidden');

  generateCalendar();
}

function generateCalendar() {
  const calendarDiv = document.getElementById('calendar');
  calendarDiv.innerHTML = ''; // limpiar

  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayNumber = date.getDay(); // 0=dom, 1=lun... 5=vie, 6=sáb

    // Solo lunes a viernes (1 a 5)
    if (dayNumber < 1 || dayNumber > 5) continue;

    const isoDate = date.toISOString().split('T')[0];

    // Crear botón día
    const dayBtn = document.createElement('button');
    dayBtn.textContent = isoDate;
    dayBtn.className = 'calendar-day';
    dayBtn.dataset.date = isoDate;
    dayBtn.dataset.dayname = date.toLocaleDateString('es-ES', { weekday: 'long' });

    dayBtn.addEventListener('click', () => {
      selectedDate = isoDate;
      showTimesForDay(dayBtn.dataset.dayname, isoDate);
      highlightSelectedDate(dayBtn);
    });

    calendarDiv.appendChild(dayBtn);
  }
}

function highlightSelectedDate(button) {
  document.querySelectorAll('.calendar-day').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  document.getElementById('selected-date').textContent = selectedDate;
  document.getElementById('confirm-booking-btn').disabled = true;
  selectedTime = null;
}

function showTimesForDay(dayName, date) {
  const times = TIME_INTERVALS[dayName];
  const timeOptionsDiv = document.getElementById('time-options');
  timeOptionsDiv.innerHTML = '';

  if (!times || times.length === 0) {
    timeOptionsDiv.textContent = 'No hay horarios disponibles para este día.';
    document.getElementById('time-slots').classList.remove('hidden');
    return;
  }

  // Filtrar turnos ya tomados ese día
  const bookedForDay = bookedTurns.filter(t => t.date === date);

  if (bookedForDay.length >= MAX_TURNS_PER_DAY) {
    timeOptionsDiv.textContent = 'Día completo. Por favor elegí otro día.';
    document.getElementById('time-slots').classList.remove('hidden');
    return;
  }

  times.forEach(time => {
    const isBooked = bookedForDay.some(t => t.time === time);
    const btn = document.createElement('button');
    btn.textContent = time;
    btn.disabled = isBooked;
    btn.className = 'time-btn';
    btn.addEventListener('click', () => {
      selectedTime = time;
      document.getElementById('confirm-booking-btn').disabled = false;
      highlightSelectedTime(btn);
    });
    timeOptionsDiv.appendChild(btn);
  });

  document.getElementById('time-slots').classList.remove('hidden');
}

function highlightSelectedTime(button) {
  document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
}

function sendBooking() {
  const data = {
    action: 'reserve',
    nombre: document.getElementById('fullName').value.trim(),
    dni: document.getElementById('dni').value.trim(),
    nacimiento: document.getElementById('birthDate').value,
    fecha: selectedDate,
    hora: selectedTime
  };

  fetch(scriptURL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.result === 'success') {
        alert('✅ Turno reservado con éxito
