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

// 1. CARGAR EVENTOS
async function loadEvents() {
    const orgId = localStorage.getItem("selected_org");
    localStorage.removeItem("selected_event"); 

    if (!orgId) {
        alert("Error: No se detectó organización.");
        logout();
        return;
    }

    try {
        const response = await apiRequest(`/eventos?id_organizacion=${orgId}`);
        const events = Array.isArray(response) ? response : (response.data || []);

        eventsGrid.innerHTML = "";

        if (events.length === 0) {
            eventsGrid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10 italic">No hay eventos creados aún.</p>`;
            return;
        }

        events.forEach(ev => {
            const fecha = new Date(ev.fecha_inicio).toLocaleDateString();
            const titulo = ev.titulo || ev.nombre || "Sin título";
            
            // --- IMPLEMENTACIÓN DE BRANDING ---
            let primaryColor = "#197fe6";
            if (ev.configuracion) {
                try {
                    const config = JSON.parse(ev.configuracion);
                    primaryColor = config.primary_color || primaryColor;
                } catch (e) {}
            }

            const cardHTML = `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all group">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[10px] font-bold uppercase px-2 py-1 rounded" 
                          style="color: ${primaryColor}; background-color: ${primaryColor}15">
                        ${ev.estado || 'BORRADOR'}
                    </span>
                    <button class="btn-edit text-slate-400 hover:text-primary transition-colors" data-id="${ev.id}">
                        <span class="material-symbols-outlined text-xl">settings</span>
                    </button>
                </div>
                <h3 class="font-bold text-lg text-slate-900 mb-1">${titulo}</h3>
                <p class="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">${ev.descripcion || "Sin descripción"}</p>
                <div class="pt-4 border-t border-slate-50 mt-auto">
                    <p class="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">calendar_today</span> ${fecha}
                    </p>
                    
                    <button class="btn-manage w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2"
                        data-id="${ev.id}" 
                        data-name="${titulo}"
                        onmouseover="this.style.backgroundColor='${primaryColor}'"
                        onmouseout="this.style.backgroundColor='#1e293b'">
                        Gestionar <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                </div>
            </div>`;
            eventsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        attachEventListeners(events);

    } catch (err) {
        console.error("Error:", err);
        eventsGrid.innerHTML = `<p class="col-span-full text-red-500 text-center">Error de conexión.</p>`;
    }
}

function attachEventListeners(events) {
    document.querySelectorAll('.btn-manage').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventId = btn.dataset.id;
            const event = events.find(e => e.id == eventId);
            // Guardamos el objeto completo para tener la configuración (color) en las siguientes páginas
            localStorage.setItem("selected_event", JSON.stringify(event));
            window.location.href = "dashboard.html";
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventId = btn.dataset.id;
            const event = events.find(e => e.id == eventId);
            openEditModal(event);
        });
    });
}

function openEditModal(event) {
    createEventModal.querySelector('h3').textContent = "Editar Evento";
    const form = createEventForm;
    
    form.nombre.value = event.nombre || event.titulo;
    form.descripcion.value = event.descripcion || "";
    form.fecha_inicio.value = event.fecha_inicio ? event.fecha_inicio.substring(0, 16) : "";
    form.fecha_fin.value = event.fecha_fin ? event.fecha_fin.substring(0, 16) : "";
    form.ubicacion.value = event.ubicacion || "";
    
    let config = { primary_color: "#197fe6" };
    if (event.configuracion) {
        try { config = JSON.parse(event.configuracion); } catch(e) {}
    }
    const picker = document.getElementById("primaryColorPicker");
    if (picker) picker.value = config.primary_color || "#197fe6";

    form.dataset.editId = event.id;
    createEventModal.showModal();
}

if (createEventForm) {
    createEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const editId = createEventForm.dataset.editId;
        const formData = new FormData(createEventForm);
        const data = Object.fromEntries(formData.entries());
        
        data.id_organizacion = localStorage.getItem("selected_org");
        
        // --- GUARDAR COLOR CORPORATIVO ---
        const primaryColor = document.getElementById("primaryColorPicker")?.value || "#197fe6";
        data.configuracion = JSON.stringify({
            primary_color: primaryColor,
            languages: ["es"]
        });

        try {
            let res;
            if (editId) {
                // Asegúrate de que el Backend soporte PUT en /eventos/{id}
                res = await apiRequest(`/eventos/${editId}`, "PUT", data);
            } else {
                data.estado = "BORRADOR";
                res = await apiRequest("/eventos", "POST", data);
            }

            if (res.success) {
                createEventModal.close();
                resetModal();
                loadEvents();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) { alert("Error al procesar el evento"); }
    });
}

function resetModal() {
    delete createEventForm.dataset.editId;
    createEventForm.reset();
    createEventModal.querySelector('h3').textContent = "Nuevo Evento";
}

createEventModal.addEventListener('close', () => {
    if (!createEventModal.open) resetModal();
});

loadEvents();