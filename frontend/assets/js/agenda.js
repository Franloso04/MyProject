import { apiRequest } from "./api.js";
import { requireAuth } from "./auth.js";
import { renderNavbar } from "../components/navbar.js"; // Asegúrate de importar esto

requireAuth();
renderNavbar();

// --- SEGURIDAD DE CONTEXTO ---
const eventDataJSON = localStorage.getItem("selected_event");
if (!eventDataJSON) {
    alert("⚠️ Debes seleccionar un evento para gestionar la agenda.");
    window.location.href = "events.html"; // Te echa fuera si no hay evento
    throw new Error("No event context");
}
const eventData = JSON.parse(eventDataJSON);
// -----------------------------

const agendaContainer = document.getElementById("agendaContainer");
const speakersGrid = document.getElementById("speakersGrid");
const createSessionForm = document.getElementById("createSessionForm");
const createSpeakerForm = document.getElementById("createSpeakerForm");

// 1. CARGAR SESIONES
async function loadSessions() {
    if (!agendaContainer) return;

    try {
        const res = await apiRequest(`/sesiones?id_evento=${eventData.id}`);
        const sesiones = res.data || [];
        agendaContainer.innerHTML = "";

        if (sesiones.length === 0) {
            agendaContainer.innerHTML = `<p class="text-center text-slate-400 py-10 italic">No hay sesiones programadas.</p>`;
            return;
        }

        sesiones.forEach(ses => {
            const hora = new Date(ses.fecha_hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const card = `
                <div class="bg-white p-4 rounded-xl border-l-4 border-primary shadow-sm mb-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded mb-2 inline-block">${hora}</span>
                            <h3 class="font-bold text-lg text-slate-800">${ses.titulo}</h3>
                            <p class="text-sm text-slate-500 mt-1">${ses.descripcion || ''}</p>
                        </div>
                    </div>
                </div>`;
            agendaContainer.insertAdjacentHTML('beforeend', card);
        });
    } catch (err) {
        console.error("Error cargando sesiones:", err);
    }
}

// 2. CARGAR PONENTES
async function loadSpeakers() {
    if (!speakersGrid) return;
    try {
        const res = await apiRequest(`/ponentes?id_evento=${eventData.id}`);
        const speakers = res.data || [];
        speakersGrid.innerHTML = "";
        
        if (speakers.length === 0) {
            speakersGrid.innerHTML = `<p class="text-slate-400 col-span-full text-center italic py-4">No hay ponentes.</p>`;
            return;
        }

        speakers.forEach(sp => {
            const inicial = sp.nombre.charAt(0).toUpperCase();
            const avatar = sp.foto_url 
                ? `<img src="${sp.foto_url}" class="w-10 h-10 rounded-full object-cover">`
                : `<div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">${inicial}</div>`;
            
            speakersGrid.insertAdjacentHTML('beforeend', `
                <div class="bg-white p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                    ${avatar}
                    <div>
                        <h4 class="font-bold text-sm text-slate-800">${sp.nombre}</h4>
                        <p class="text-xs text-slate-500 truncate max-w-[120px]">${sp.email || ''}</p>
                    </div>
                </div>
            `);
        });
    } catch (err) { console.error(err); }
}

// 3. CREAR SESIÓN (SOLUCIÓN ERROR 400)
if (createSessionForm) {
    createSessionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(createSessionForm);
        
        // CONSTRUIMOS EL OBJETO MANUALMENTE
        const payload = {
            id_evento: eventData.id, // ¡AQUÍ ESTÁ LA CLAVE!
            titulo: formData.get('titulo') || formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            fecha_hora_inicio: formData.get('fecha_inicio'),
            fecha_hora_fin: formData.get('fecha_fin'),
            ubicacion_id: formData.get('ubicacion_id')
        };

        if (!payload.titulo || !payload.fecha_hora_inicio) {
            alert("Título y Fecha Inicio son obligatorios");
            return;
        }

        try {
            const res = await apiRequest("/sesiones", "POST", payload);
            if (res.success) {
                document.getElementById("createSessionModal").close();
                createSessionForm.reset();
                loadSessions();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) { alert("Error de conexión"); }
    });
}

// 4. CREAR PONENTE
if (createSpeakerForm) {
    createSpeakerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(createSpeakerForm);
        const data = Object.fromEntries(formData.entries());
        data.id_evento = eventData.id; // ¡CLAVE!

        try {
            const res = await apiRequest("/ponentes", "POST", data);
            if (res.success) {
                document.getElementById("createSpeakerModal").close();
                createSpeakerForm.reset();
                loadSpeakers();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) { alert("Error de conexión"); }
    });
}

// Iniciar
loadSessions();
loadSpeakers();