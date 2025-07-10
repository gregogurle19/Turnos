document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("personal-data-form");
  const startForm = document.getElementById("start-form");
  const bookingSection = document.getElementById("booking-section");
  const calendarDiv = document.getElementById("calendar");
  const timeSlotsDiv = document.getElementById("time-slots");
  const timeOptionsDiv = document.getElementById("time-options");
  const selectedDateSpan = document.getElementById("selected-date");
  const confirmButton = document.getElementById("confirm-booking-btn");
  const messageDiv = document.getElementById("booking-message");

  let selectedDate = "";
  let selectedTime = "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value.trim();
    const dni = document.getElementById("dni").value.trim();
    const birthDate = document.getElementById("birthDate").value;

    if (fullName && dni && birthDate) {
      startForm.classList.add("hidden");
      bookingSection.classList.remove("hidden");
      generateCalendar();
    }
  });

  // Rellenar input date max hoy
  const birthInput = document.getElementById("birthDate");
  if (birthInput) {
    const today = new Date().toISOString().split("T")[0];
    birthInput.max = today;
  }

  function generateCalendar() {
    const today = new Date();
    calendarDiv.innerHTML = "";

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const day = date.getDay(); // 0=Dom, 1=Lun...

      if (day >= 1 && day <= 5) {
        const iso = date.toISOString().split("T")[0];
        const div = document.createElement("div");
        div.className = "calendar-day";
        div.textContent = iso;
        div.dataset.date = iso;

        div.addEventListener("click", () => {
          selectedDate = iso;
          selectedDateSpan.textContent = iso;
          showTimeOptions(day);
          scrollToElement(timeSlotsDiv);
        });

        calendarDiv.appendChild(div);
      }
    }
  }

  function showTimeOptions(day) {
    timeOptionsDiv.innerHTML = "";
    selectedTime = "";
    confirmButton.disabled = true;

    const morning = [
      "09:00", "09:30", "10:00", "10:30",
      "11:00", "11:30", "12:00", "12:30"
    ];
    const evening = [
      "16:30", "17:00", "17:30", "18:00",
      "18:30", "19:00", "19:30", "20:00"
    ];

    let times = [];
    if ([1, 3, 5].includes(day)) {
      times = morning;
    } else if ([2, 4].includes(day)) {
      times = evening;
    }

    times.forEach(time => {
      const btn = document.createElement("button");
      btn.textContent = time;
      btn.className = "slot-button";
      btn.addEventListener("click", () => {
        selectedTime = time;
        document.querySelectorAll(".slot-button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        confirmButton.disabled = false;
      });
      timeOptionsDiv.appendChild(btn);
    });

    timeSlotsDiv.classList.remove("hidden");
  }

  confirmButton.addEventListener("click", () => {
    if (!selectedDate || !selectedTime) return;
    messageDiv.textContent = `✅ ¡Turno reservado para el ${selectedDate} a las ${selectedTime}!`;

    // Acá iría la lógica para enviar a Google Sheets con fetch
    confirmButton.disabled = true;
    confirmButton.textContent = "Reservado";
    confirmButton.classList.add("reserved");
  });

  function scrollToElement(el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
