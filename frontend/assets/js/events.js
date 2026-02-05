import { apiRequest } from "./api.js";
import { requireAuth, logout, getUser } from "./auth.js";

requireAuth();

document.getElementById("btnLogout").addEventListener("click", logout);

const user = getUser();
document.getElementById("userName").innerText = user.nombre_completo;

async function loadMyEvents() {
  try {
    const res = await apiRequest("/eventos");
    const list = document.getElementById("eventsList");

    list.innerHTML = "";

    res.data.forEach((ev) => {
      list.innerHTML += `
        <div class="event-card">
          <h3>${ev.nombre}</h3>
          <p>${ev.fecha_inicio} - ${ev.fecha_fin}</p>
          <button class="btnSelect" data-id="${ev.id}">Seleccionar</button>
        </div>
      `;
    });

    document.querySelectorAll(".btnSelect").forEach(btn => {
      btn.addEventListener("click", () => {
        localStorage.setItem("selected_event", btn.dataset.id);
        window.location.href = "dashboard.html";
      });
    });

  } catch (err) {
    alert("Error cargando eventos");
  }
}

loadMyEvents();
