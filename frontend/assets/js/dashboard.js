import { requireAuth, getOrganization } from "./auth.js";
import { apiRequest } from "./api.js";
import { renderNavbar, initNavbar } from "../../frontend/components/navbar.js";
import { eventCard } from "../../frontend/components/eventCard.js";

requireAuth();

const navbarDiv = document.getElementById("navbar");
navbarDiv.innerHTML = renderNavbar();
initNavbar();

const eventsGrid = document.getElementById("eventsGrid");
const loadingMsg = document.getElementById("loadingMsg");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");

let allEvents = [];

async function loadEvents() {
    loadingMsg.style.display = "block";
    eventsGrid.innerHTML = "";

    try {
        const org = getOrganization();

        if (!org || !org.id) {
            throw new Error("No hay organización en sesión");
        }

        // Ajusta el endpoint a tu API real
        const response = await apiRequest(`events/getByOrganization.php?org_id=${org.id}`);

        allEvents = response.events || [];
        renderEvents(allEvents);

    } catch (err) {
        console.error(err);
        eventsGrid.innerHTML = `<p class="error-msg">Error cargando eventos.</p>`;
    }

    loadingMsg.style.display = "none";
}

function renderEvents(events) {
    if (!events.length) {
        eventsGrid.innerHTML = `<p>No hay eventos disponibles.</p>`;
        return;
    }

    eventsGrid.innerHTML = events.map(ev => eventCard(ev)).join("");

    // Botones funcionales
    document.querySelectorAll(".btn-primary").forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Ver detalles del evento ID: " + btn.dataset.id);
        });
    });

    document.querySelectorAll(".btn-secondary").forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Editar evento ID: " + btn.dataset.id);
        });
    });
}

refreshBtn.addEventListener("click", loadEvents);

searchInput.addEventListener("input", () => {
    const text = searchInput.value.toLowerCase();
    const filtered = allEvents.filter(e => e.titulo.toLowerCase().includes(text));
    renderEvents(filtered);
});

loadEvents();
