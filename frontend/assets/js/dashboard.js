import { requireAuth, getSelectedEvent, logout } from "./auth.js";

requireAuth();

const event = getSelectedEvent();

if (!event) {
  window.location.href = "./events.html";
}

document.getElementById("eventName").textContent = event.nombre;
document.getElementById("eventDesc").textContent = event.descripcion || "";

document.getElementById("logoutBtn").addEventListener("click", logout);

document.getElementById("agendaBtn").addEventListener("click", () => {
  window.location.href = "./agenda.html";
});
