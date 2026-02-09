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

// 1. Limpiamos cualquier selección previa al entrar aquí
localStorage.removeItem("selected_event");

// 2. TÉCNICA INFALIBLE: Delegación de Eventos
// Escuchamos clicks en todo el grid, y detectamos si fue en un botón "Gestionar"
if (eventsGrid) {
    eventsGrid.addEventListener('click', (e) => {
        // Buscamos si el click fue en el botón o en el icono dentro del botón
        const btn = e.target.closest('.btn-manage');
        
        if (btn) {
            const eventId = btn.dataset.id;
            const eventName = btn.dataset.name;

            console.log("CLICK DETECTADO:", eventId, eventName); // Esto saldrá en la consola

            if (eventId && eventName) {
                // GUARDAMOS EN LOCALSTORAGE
                const eventData = { id: eventId, nombre: eventName };
                localStorage.setItem("selected_event", JSON.stringify(eventData));
                
                // Confirmación visual en consola
                console.log("Guardado en LocalStorage:", localStorage.getItem("selected_event"));

                // Redirigimos
                window.location.href = "dashboard.html";
            } else {
                alert("Error: El evento no tiene ID válido.");
            }
        }
    });
}

// 3. Cargar Eventos
async function loadEvents() {
    const orgId = localStorage.getItem("selected_org");

    if (!orgId) {
        alert("Error: No se detectó organización.");
        return;
    }

    try {
        const response = await apiRequest(`/eventos?id_organizacion=${orgId}`);
        const events = Array.isArray(response) ? response : (response.data || []);

        eventsGrid.innerHTML = "";

        if (events.length === 0) {
            eventsGrid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10">No hay eventos.</p>`;
            return;
        }

        events.forEach(ev => {
            const fecha = new Date(ev.fecha_inicio).toLocaleDateString();
            const titulo = ev.titulo || ev.nombre || "Sin título";
            
            // OJO: Aquí aseguro que los atributos data-id y data-name estén perfectos
            const cardHTML = `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-50 text-primary">${ev.estado || 'BORRADOR'}</span>
                </div>
                <h3 class="font-bold text-lg text-slate-900 mb-1">${titulo}</h3>
                <p class="text-sm text-slate-500 mb-4 flex-1">${ev.descripcion || ""}</p>
                <div class="pt-4 border-t border-slate-50 mt-auto">
                    <p class="text-xs text-slate-400 mb-3">${fecha}</p>
                    
                    <button class="btn-manage w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase hover:bg-primary transition-colors flex items-center justify-center gap-2"
                        data-id="${ev.id}" 
                        data-name="${titulo}">
                        Gestionar <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                </div>
            </div>`;
            eventsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (err) {
        console.error("Error:", err);
        eventsGrid.innerHTML = `<p class="col-span-full text-red-500 text-center">Error de conexión.</p>`;
    }
}

// 4. Crear Evento
if (createEventForm) {
    createEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(createEventForm);
        const data = Object.fromEntries(formData.entries());
        data.id_organizacion = localStorage.getItem("selected_org");
        data.estado = "BORRADOR";

        try {
            const res = await apiRequest("/eventos", "POST", data);
            if (res.success) {
                createEventModal.close();
                createEventForm.reset();
                loadEvents();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) { alert("Error al crear evento"); }
    });
}

loadEvents();