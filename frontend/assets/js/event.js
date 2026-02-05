import { apiRequest } from "./api.js";
import { getSession, requireAuth, logout } from "./auth.js";

requireAuth();

const session = getSession();
const orgId = session.user.organizacion_id;

document.getElementById("logoutBtn").addEventListener("click", () => {
  logout();
});

async function loadEvents() {
  const tbody = document.getElementById("eventsTableBody");
  tbody.innerHTML = `<tr><td colspan="4">Cargando eventos...</td></tr>`;

  try {
    const events = await apiRequest(`/eventos?organizacion_id=${orgId}`, "GET");

    if (!Array.isArray(events) || events.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No hay eventos disponibles.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    for (const ev of events) {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${ev.id}</td>
        <td>${ev.titulo}</td>
        <td>${ev.fecha_inicio}</td>
        <td>
          <button class="btn btn-primary btn-sm" data-id="${ev.id}">
            Ver Agenda
          </button>
        </td>
      `;

      tr.querySelector("button").addEventListener("click", () => {
        window.location.href = `agenda.html?event_id=${ev.id}`;
      });

      tbody.appendChild(tr);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:red;">Error: ${err.message}</td></tr>`;
  }
}

loadEvents();
