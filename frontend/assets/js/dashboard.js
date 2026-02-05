import { apiRequest } from "./api.js";
import { requireAuth, logout } from "./auth.js";

requireAuth();

document.getElementById("btnLogout").addEventListener("click", logout);

const eventId = localStorage.getItem("selected_event");
if (!eventId) window.location.href = "selector.html";

async function loadStats() {
  try {
    const res = await apiRequest(`/dashboard/stats?event_id=${eventId}`);

    document.getElementById("total_attendees").innerText = res.data.total_attendees;
    document.getElementById("total_revenue").innerText = "$" + res.data.total_revenue;
    document.getElementById("total_sessions").innerText = res.data.total_sessions;
    document.getElementById("total_access").innerText = res.data.total_access;

  } catch (err) {
    console.error(err);
    alert("Error cargando estadísticas");
  }
}

loadStats();
