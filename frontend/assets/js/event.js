import { apiRequest } from "./api.js";
import { requireAuth, getSession, setSelectedEvent, logout } from "./auth.js";

requireAuth();

const session = getSession();

document.getElementById("userInfo").textContent =
  session.user?.nombre || session.user?.email || "Usuario";

document.getElementById("orgInfo").textContent =
  session.organization?.nombre || "Organización desconocida";

document.getElementById("logoutBtn").addEventListener("click", logout);

async function loadEvents() {
  const list = document.getElementById("eventsList");
  list.innerHTML = "<p class='muted'>Cargando eventos...</p>";

  try {
    // filtrar por organización:
    // /eventos?organizacion_id=X
    const orgId = session.organization?.id;

    if (!orgId) {
      throw new Error("No se detectó organización en sesión.");
    }

    const events = await apiRequest(`/eventos?organizacion_id=${orgId}`);

    if (!Array.isArray(events) || events.length === 0) {
      list.innerHTML = "<p class='muted'>No hay eventos disponibles.</p>";
      return;
    }

    list.innerHTML = "";

    events.forEach((ev) => {
      const div = document.createElement("div");
      div.className = "card event-card";

      div.innerHTML = `
        <h3>${ev.nombre}</h3>
        <p class="muted">${ev.descripcion || ""}</p>
        <button class="btn btn-primary w100">Seleccionar</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        setSelectedEvent(ev);
        window.location.href = "./dashboard.html";
      });

      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

loadEvents();
