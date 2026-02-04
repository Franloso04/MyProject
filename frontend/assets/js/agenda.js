import { apiRequest } from "./api.js";
import { requireAuth, getSelectedEvent, logout } from "./auth.js";

requireAuth();

const event = getSelectedEvent();

if (!event) {
  window.location.href = "./events.html";
}

document.getElementById("eventName").textContent = event.nombre;
document.getElementById("logoutBtn").addEventListener("click", logout);

async function loadAgenda() {
  const list = document.getElementById("agendaList");
  list.innerHTML = "<p class='muted'>Cargando agenda...</p>";

  try {
    const sessions = await apiRequest(`/sesiones?event_id=${event.id}`);

    if (!Array.isArray(sessions) || sessions.length === 0) {
      list.innerHTML = "<p class='muted'>No hay sesiones registradas.</p>";
      return;
    }

    list.innerHTML = "";

    sessions.forEach((s) => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${s.titulo}</h3>
        <p class="muted">${s.descripcion || ""}</p>
        <p><b>Inicio:</b> ${s.hora_inicio}</p>
        <p><b>Fin:</b> ${s.hora_fin || "-"}</p>
      `;

      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

loadAgenda();
