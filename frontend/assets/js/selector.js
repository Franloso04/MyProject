import { apiRequest } from "./api.js";
import { requireAuth, logout, getUser } from "./auth.js";

requireAuth();

const user = getUser();

const orgSelect = document.getElementById("orgSelect");
const eventSelect = document.getElementById("eventSelect");

document.getElementById("btnLogout").addEventListener("click", logout);

async function loadOrganizations() {
  try {
    const res = await apiRequest("/organizaciones");
    orgSelect.innerHTML = `<option value="">Selecciona organización</option>`;

    res.data.forEach((org) => {
      orgSelect.innerHTML += `<option value="${org.id}">${org.nombre}</option>`;
    });
  } catch (err) {
    alert("Error cargando organizaciones");
  }
}

async function loadEvents(orgId) {
  try {
    const res = await apiRequest(`/eventos?organizacion_id=${orgId}`);

    eventSelect.innerHTML = `<option value="">Selecciona evento</option>`;

    res.data.forEach((ev) => {
      eventSelect.innerHTML += `<option value="${ev.id}">${ev.nombre}</option>`;
    });
  } catch (err) {
    alert("Error cargando eventos");
  }
}

orgSelect.addEventListener("change", (e) => {
  const orgId = e.target.value;
  localStorage.setItem("selected_org", orgId);

  if (orgId) loadEvents(orgId);
});

document.getElementById("btnContinue").addEventListener("click", () => {
  const orgId = orgSelect.value;
  const eventId = eventSelect.value;

  if (!orgId || !eventId) {
    alert("Selecciona organización y evento");
    return;
  }

  localStorage.setItem("selected_event", eventId);
  window.location.href = "dashboard.html";
});

loadOrganizations();
