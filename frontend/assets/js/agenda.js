import { apiRequest } from "./api.js";
import { requireAuth } from "./auth.js";
import { renderNavbar } from "../components/navbar.js";

requireAuth();
renderNavbar();

const eventData = JSON.parse(localStorage.getItem("selected_event"));
const agendaContainer = document.getElementById("agendaContainer");
const createSessionForm = document.getElementById("createSessionForm");
const createSpeakerForm = document.getElementById("createSpeakerForm");
const speakerSelect = document.getElementById("speakerSelect");

// 1. CARGAR PONENTES Y RELLENAR EL SELECTOR
async function loadSpeakers() {
    try {
        const res = await apiRequest(`/ponentes?id_evento=${eventData.id}`);
        const ponentes = res.data || [];
        
        if (speakerSelect) {
            speakerSelect.innerHTML = '<option value="">Seleccionar ponente (opcional)</option>';
            ponentes.forEach(p => {
                speakerSelect.insertAdjacentHTML("beforeend", 
                    `<option value="${p.id}">${p.nombre_completo}</option>`);
            });
        }
    } catch (err) { console.error("Error cargando ponentes:", err); }
}

// 2. CARGAR SESIONES CON DISEÑO MEJORADO (Día y Fecha)
async function loadSessions() {
    if (!agendaContainer) return;
    try {
        const res = await apiRequest(`/sesiones?id_evento=${eventData.id}`);
        const sesiones = res.data || [];
        agendaContainer.innerHTML = sesiones.length === 0 ? '<p class="text-center py-10 opacity-50 italic">No hay sesiones.</p>' : "";

        sesiones.forEach(ses => {
            const start = new Date(ses.hora_inicio);
            const end = new Date(ses.hora_fin);
            
            // Formateo profesional de fecha: "lunes, 12 de mayo"
            const fechaLegible = start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            const hInicio = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const hFin = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            agendaContainer.insertAdjacentHTML("beforeend", `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="material-symbols-outlined text-primary text-sm">calendar_today</span>
                                <span class="text-xs font-bold uppercase text-slate-400">${fechaLegible}</span>
                            </div>
                            <h3 class="font-bold text-xl text-slate-800">${ses.titulo}</h3>
                            <p class="text-slate-500 text-sm mt-1">${ses.descripcion || ""}</p>
                        </div>
                        <div class="bg-primary/5 p-3 rounded-xl border border-primary/10 text-center min-w-[120px]">
                            <span class="text-[10px] font-bold text-primary uppercase block">Horario</span>
                            <span class="text-primary font-bold text-lg">${hInicio} - ${hFin}</span>
                        </div>
                    </div>
                </div>`);
        });
    } catch (err) { console.error(err); }
}

// 3. CREAR SESIÓN (Incluyendo el ID del ponente)
if (createSessionForm) {
    createSessionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(createSessionForm);
        const payload = {
            id_evento: eventData.id,
            titulo: formData.get('titulo'),
            descripcion: formData.get('descripcion'),
            hora_inicio: formData.get('hora_inicio'),
            hora_fin: formData.get('hora_fin'),
            id_ponente: formData.get('id_ponente') || null, // Nuevo campo
            id_ubicacion: formData.get('id_ubicacion') || null
        };

        const res = await apiRequest("/sesiones", "POST", payload);
        if (res.success) {
            document.getElementById("createSessionModal").close();
            createSessionForm.reset();
            loadSessions();
        }
    });
}

// 4. CREAR PONENTE (Y actualizar el selector al terminar)
if (createSpeakerForm) {
    createSpeakerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(createSpeakerForm);
        const payload = {
            id_evento: eventData.id,
            nombre_completo: formData.get("nombre_completo"),
            biografia: formData.get("biografia"),
            email: formData.get("email")
        };

        const res = await apiRequest("/ponentes", "POST", payload);
        if (res.success) {
            document.getElementById("createSpeakerModal").close();
            createSpeakerForm.reset();
            loadSpeakers(); // Actualizamos el selector para que aparezca el nuevo ponente
        }
    });
}

// Iniciar la página
loadSessions();
loadSpeakers();