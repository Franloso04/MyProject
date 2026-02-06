import { apiRequest } from "./api.js";
import { requireAuth } from "./auth.js";

requireAuth();

const agendaContainer = document.getElementById("agendaContainer");
const createSessionForm = document.getElementById("createSessionForm");
const createSpeakerForm = document.getElementById("createSpeakerForm");

// Verificar Evento Seleccionado
const eventData = JSON.parse(localStorage.getItem("selected_event"));
if (!eventData || !eventData.id) {
    alert("Evento no seleccionado");
    window.location.href = "events.html";
}

// --- CARGAR SESIONES ---
async function loadSessions() {
    try {
        const res = await apiRequest(`/sesiones?evento_id=${eventData.id}`);
        const sesiones = Array.isArray(res) ? res : (res.data || []);

        agendaContainer.innerHTML = "";
        if (sesiones.length === 0) {
            agendaContainer.innerHTML = `<div class="text-center text-slate-500 mt-10">No hay sesiones. Agrega la primera.</div>`;
            return;
        }

        // Ordenar por fecha
        sesiones.sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));

        sesiones.forEach(sesion => {
            const inicio = new Date(sesion.fecha_hora_inicio);
            const hora = inicio.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const html = `
            <div class="flex gap-4 mb-6 group">
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 bg-slate-300 rounded-full mt-6 group-hover:bg-primary transition-colors ring-4 ring-white"></div>
                    <div class="w-0.5 bg-slate-100 flex-1 h-full -my-1"></div>
                </div>
                <div class="flex-1 bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between mb-2">
                        <span class="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded">${hora}</span>
                    </div>
                    <h3 class="font-bold text-lg text-slate-900">${sesion.titulo}</h3>
                    <p class="text-slate-500 text-sm mt-1 line-clamp-2">${sesion.descripcion || ""}</p>
                    <div class="mt-4 flex items-center gap-4 text-xs text-slate-400">
                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">location_on</span> ${sesion.ubicacion || "Sin sala"}</span>
                    </div>
                </div>
            </div>`;
            agendaContainer.insertAdjacentHTML('beforeend', html);
        });

    } catch (err) {
        console.error(err);
        agendaContainer.innerHTML = `<p class="text-red-500 text-center">Error al cargar agenda.</p>`;
    }
}

// --- CREAR SESIÓN ---
createSessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(createSessionForm);
    const data = Object.fromEntries(formData.entries());
    
    // Añadir ID evento
    data.evento_id = eventData.id;

    try {
        const res = await apiRequest("/sesiones", "POST", data);
        if(res.success) {
            document.getElementById("createSessionModal").close();
            createSessionForm.reset();
            loadSessions(); // Recargar lista
        } else {
            alert("Error: " + res.message);
        }
    } catch (err) {
        alert("Error de conexión al crear sesión");
    }
});

// --- CREAR PONENTE ---
createSpeakerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(createSpeakerForm);
    const data = Object.fromEntries(formData.entries());
    data.evento_id = eventData.id; // Asignamos ponente al evento actual (si tu DB lo soporta así)

    try {
        const res = await apiRequest("/ponentes", "POST", data);
        if(res.success) {
            alert("Ponente añadido correctamente");
            document.getElementById("createSpeakerModal").close();
            createSpeakerForm.reset();
        } else {
            alert("Error: " + res.message);
        }
    } catch (err) {
        alert("Error al guardar ponente");
    }
});

loadSessions();