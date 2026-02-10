import { apiRequest } from "./api.js";
import { requireAuth } from "./auth.js";
import { renderNavbar } from "../components/navbar.js";

requireAuth();
renderNavbar();

// --- SEGURIDAD DE CONTEXTO ---
const eventDataJSON = localStorage.getItem("selected_event");
if (!eventDataJSON) {
    alert("⚠️ Debes seleccionar un evento para gestionar la agenda.");
    window.location.href = "events.html";
    throw new Error("No event context");
}
const eventData = JSON.parse(eventDataJSON);
// -----------------------------

const agendaContainer = document.getElementById("agendaContainer");
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
            const hora = new Date(ses.fecha_hora_inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            const card = `
                <div class="bg-white p-4 rounded-xl border-l-4 border-primary shadow-sm mb-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded mb-2 inline-block">${hora}</span>
                            <h3 class="font-bold text-lg text-slate-800">${ses.titulo}</h3>
                            <p class="text-sm text-slate-500 mt-1">${ses.descripcion || ""}</p>
                        </div>
                    </div>
                </div>
            `;
            agendaContainer.insertAdjacentHTML("beforeend", card);
        });

    } catch (err) {
        console.error("Error cargando sesiones:", err);
        agendaContainer.innerHTML = `<p class="text-center text-red-500 py-10">Error cargando sesiones.</p>`;
    }
}

// 2. CARGAR PONENTES
async function loadSpeakers() {
    try {
        const res = await apiRequest(`/ponentes?id_evento=${eventData.id}`);
        console.log("Ponentes cargados:", res.data || []);
    } catch (err) {
        console.error("Error cargando ponentes:", err);
    }
}

// 3. CREAR SESIÓN
if (createSessionForm) {
    createSessionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(createSessionForm);
        
        // Mapeamos los nombres del HTML a las propiedades que espera el Modelo PHP
        const payload = {
            id_evento: eventData.id,
            titulo: formData.get('titulo'),
            descripcion: formData.get('descripcion'),
            hora_inicio: formData.get('fecha_hora_inicio'), // Captura del input Inicio
            hora_fin: formData.get('fecha_hora_fin'),       // Captura del input Fin
            id_ubicacion: formData.get('ubicacion_id') || null
        };

        // Validación corregida
        if (!payload.titulo || !payload.hora_inicio) {
            alert("⚠️ Título y Fecha Inicio son obligatorios");
            return;
        }

        try {
            const res = await apiRequest("/sesiones", "POST", payload);
            if (res.success) {
                document.getElementById("createSessionModal").close();
                createSessionForm.reset();
                // Recargar sesiones para ver la nueva
                if (typeof loadSessions === "function") loadSessions();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) {
            console.error("Error en la petición:", err);
        }
    });
}
// 4. CREAR PONENTE
if (createSpeakerForm) {
    createSpeakerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(createSpeakerForm);

        const payload = {
            id_evento: eventData.id,
            nombre: formData.get("nombre"),
            email: formData.get("email")
        };

        if (!payload.nombre) {
            alert("⚠️ El nombre del ponente es obligatorio.");
            return;
        }

        try {
            const res = await apiRequest("/ponentes", "POST", payload);

            if (res.success) {
                document.getElementById("createSpeakerModal").close();
                createSpeakerForm.reset();
                loadSpeakers();
            } else {
                alert("❌ Error: " + (res.message || "No se pudo crear el ponente."));
            }

        } catch (err) {
            console.error(err);
            alert("❌ Error de conexión con el servidor.");
        }
    });
}

// Iniciar
loadSessions();
loadSpeakers();
