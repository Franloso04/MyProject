import { apiRequest } from "./api.js";
import { requireAuth, logout, getSession } from "./auth.js";

requireAuth();
const session = getSession();
const formData = new FormData(createEventForm);
const data = Object.fromEntries(formData.entries());

// ESTA LÍNEA ES CRÍTICA:
data.organizacion_id = localStorage.getItem("selected_org"); 
data.estado = "BORRADOR";

// Debug para que veas qué se envía
console.log("Enviando JSON:", JSON.stringify(data));

// DOM
const eventsGrid = document.getElementById("eventsGrid");
const userNameDisplay = document.getElementById("userNameDisplay");
const createEventForm = document.getElementById("createEventForm");

if (session?.user) userNameDisplay.textContent = session.user.nombre_completo || "Usuario";
if (document.getElementById("logoutBtn")) document.getElementById("logoutBtn").addEventListener("click", logout);

// --- CARGAR EVENTOS ---
async function loadEvents() {
    const orgId = localStorage.getItem("selected_org");
    if (!orgId) { logout(); return; }

    try {
        const response = await apiRequest(`/eventos?organizacion_id=${orgId}`);
        const events = Array.isArray(response) ? response : (response.data || []);
        renderGrid(events);
    } catch (err) {
        console.error(err);
        eventsGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Error cargando eventos.</p>`;
    }
}

function renderGrid(events) {
    eventsGrid.innerHTML = "";
    if (events.length === 0) {
        eventsGrid.innerHTML = `<div class="col-span-full text-center py-10 text-slate-500">No hay eventos. Crea uno nuevo.</div>`;
        return;
    }
    events.forEach(ev => {
        const html = `
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <h3 class="font-bold text-lg text-slate-900 mb-1">${ev.titulo || ev.nombre}</h3>
            <p class="text-sm text-slate-500 mb-4 line-clamp-2">${ev.descripcion || "Sin descripción"}</p>
            <button class="btn-manage w-full py-2.5 rounded-xl bg-slate-50 text-slate-700 font-bold text-xs uppercase hover:bg-primary hover:text-white transition-all"
                data-id="${ev.id}" data-name="${ev.titulo || ev.nombre}">
                Gestionar Panel
            </button>
        </div>`;
        eventsGrid.insertAdjacentHTML('beforeend', html);
    });

    document.querySelectorAll('.btn-manage').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventData = { id: btn.dataset.id, nombre: btn.dataset.name };
            localStorage.setItem("selected_event", JSON.stringify(eventData));
            window.location.href = "dashboard.html"; // Redirige al dashboard
        });
    });
}

// --- CREAR EVENTO (NUEVO) ---
if(createEventForm) {
    createEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(createEventForm);
        const data = Object.fromEntries(formData.entries());
        data.organizacion_id = localStorage.getItem("selected_org");
        data.estado = "BORRADOR";

        try {
            const res = await apiRequest("/eventos", "POST", data);
            if(res.success) {
                document.getElementById("createEventModal").close();
                createEventForm.reset();
                loadEvents(); // Recargar lista
            } else {
                alert("Error al crear: " + res.message);
            }
        } catch (err) {
            alert("Error de conexión");
        }
    });
}

loadEvents();