import { apiRequest } from "./api.js";
import { requireAuth, logout, getSession } from "./auth.js";

requireAuth();
const session = getSession();

const eventsGrid = document.getElementById("eventsGrid");
const userNameDisplay = document.getElementById("userNameDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const createEventForm = document.getElementById("createEventForm");
const createEventModal = document.getElementById("createEventModal");

if (session?.user) userNameDisplay.textContent = session.user.nombre_completo || "Usuario";
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// CARGAR EVENTOS
async function loadEvents() {
    const orgId = localStorage.getItem("selected_org");
    localStorage.removeItem("selected_event"); // <--- ESTO ES LA CLAVE
    console.log("Contexto de evento limpiado. Listo para seleccionar uno nuevo.");

    if (!orgId) {
        alert("Error: No se detectó organización. Vuelve a iniciar sesión.");
        logout();
        return;
    }

    try {
        // CORRECCIÓN: Enviamos parámetro ?id_organizacion=
        const response = await apiRequest(`/eventos?id_organizacion=${orgId}`);
        const events = Array.isArray(response) ? response : (response.data || []);

        eventsGrid.innerHTML = "";

        if (events.length === 0) {
            eventsGrid.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                    <span class="material-symbols-outlined text-4xl mb-2">event_busy</span>
                    <p>No tienes eventos creados aún.</p>
                </div>`;
            return;
        }

        events.forEach(ev => {
            const fecha = new Date(ev.fecha_inicio).toLocaleDateString();
            const cardHTML = `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col h-full">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <span class="material-symbols-outlined">event</span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-primary">
                        ${ev.estado || 'ACTIVO'}
                    </span>
                </div>
                <h3 class="font-bold text-lg text-slate-900 mb-1 line-clamp-1">${ev.titulo || ev.nombre}</h3>
                <p class="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">${ev.descripcion || "Sin descripción"}</p>
                <div class="pt-4 border-t border-slate-50 mt-auto">
                    <p class="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">calendar_today</span> ${fecha}
                    </p>
                    <button class="btn-manage w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase hover:bg-primary transition-colors flex items-center justify-center gap-2"
                        data-id="${ev.id}" data-name="${ev.titulo || ev.nombre}">
                        Gestionar
                        <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                </div>
            </div>`;
            eventsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        document.querySelectorAll('.btn-manage').forEach(btn => {
            btn.addEventListener('click', () => {
                const eventData = { id: btn.dataset.id, nombre: btn.dataset.name };
                localStorage.setItem("selected_event", JSON.stringify(eventData));
                window.location.href = "dashboard.html";
            });
        });

    } catch (err) {
        console.error("Error:", err);
        eventsGrid.innerHTML = `<p class="col-span-full text-red-500 text-center">Error al cargar eventos.</p>`;
    }
}

// CREAR EVENTO
if (createEventForm) {
    createEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(createEventForm);
        const data = Object.fromEntries(formData.entries());
        
        // CORRECCIÓN CRÍTICA: La llave debe ser 'id_organizacion'
        data.id_organizacion = localStorage.getItem("selected_org");
        data.estado = "BORRADOR";

        console.log("Enviando:", data); // DEBUG

        try {
            const res = await apiRequest("/eventos", "POST", data);
            
            if (res.success) {
                createEventModal.close();
                createEventForm.reset();
                loadEvents();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) {
            alert("Error de conexión al crear evento.");
        }
    });
}

loadEvents();