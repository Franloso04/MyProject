import { apiRequest } from "./api.js";
import { requireAuth } from "./auth.js";
import { renderNavbar } from "../components/navbar.js";

requireAuth();
renderNavbar();


const agendaContainer = document.getElementById("agendaContainer");
const createSessionForm = document.getElementById("createSessionForm");
const createSpeakerForm = document.getElementById("createSpeakerForm");
const speakerSelect = document.getElementById("speakerSelect");

const eventData = JSON.parse(localStorage.getItem("selected_event"));
if (eventData && eventData.color) {
    const style = document.createElement('style');
    style.innerHTML = `
        .bg-primary { background-color: ${eventData.color} !important; }
        .text-primary { color: ${eventData.color} !important; }
        .border-primary { border-color: ${eventData.color} !important; }
    `;
    document.head.appendChild(style);
}
// Variable global para el modal de asignación profesional
let currentSessionId = null;

// 1. CARGAR PONENTES Y RELLENAR LOS SELECTORES (El de crear y el de reasignar)
async function loadSpeakers() {
    try {
        const res = await apiRequest(`/ponentes?id_evento=${eventData.id}`);
        const ponentes = res.data || [];
        
        // Rellenar selectores
        const selectors = [speakerSelect, document.getElementById('assignSpeakerSelect')];
        
        selectors.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">-- Sin asignar / Desvincular --</option>';
                ponentes.forEach(p => {
                    select.insertAdjacentHTML("beforeend", `<option value="${p.id}">${p.nombre_completo}</option>`);
                });
            }
        });
    } catch (err) { console.error("Error cargando ponentes:", err); }
}

// 2. CARGAR SESIONES (Diseño profesional con visualización de ponente y botón de gestión)


// ... (Tus imports y lógica inicial se mantienen igual)

async function loadSessions() {
    if (!agendaContainer) return;
    try {
        const res = await apiRequest(`/sesiones?id_evento=${eventData.id}`);
        const sesiones = res.data || [];
        agendaContainer.innerHTML = sesiones.length === 0 ? '<p class="text-center py-10 opacity-50 italic">No hay sesiones.</p>' : "";

        sesiones.forEach(ses => {
            const start = new Date(ses.hora_inicio);
            const fechaLegible = start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            const hInicio = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // --- LÓGICA DEL CUADRO DEL PONENTE CON BIOGRAFÍA DESPLEGABLE ---
            let ponenteHTML = '';
            if (ses.nombre_ponente) {
                ponenteHTML = `
                    <div class="mt-4 bg-primary/10 rounded-xl border border-primary/20 overflow-hidden transition-all duration-300">
                        <button onclick="toggleBio(${ses.id})" class="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors text-left focus:outline-none">
                            <div class="bg-primary text-white p-1.5 rounded-full flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-sm">mic</span>
                            </div>
                            <div class="flex-1">
                                <span class="text-[10px] uppercase font-bold text-primary block leading-none mb-1">Ponente Asignado</span>
                                <span class="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    ${ses.nombre_completo || ses.nombre_ponente}
                                    <span id="icon-bio-${ses.id}" class="material-symbols-outlined text-xs transition-transform duration-300">expand_more</span>
                                </span>
                            </div>
                        </button>
                        
                        <div id="bio-${ses.id}" class="hidden px-4 pb-4 animate-fade-in">
                            <div class="pt-2 border-t border-primary/10">
                                <p class="text-xs text-slate-600 italic leading-relaxed">
                                    ${ses.biografia || "Este ponente aún no tiene una biografía detallada."}
                                </p>
                            </div>
                        </div>
                    </div>`;
            } else {
                ponenteHTML = `
                    <div class="mt-4 flex items-center gap-2 px-1 opacity-40 italic">
                        <span class="material-symbols-outlined text-sm">person_off</span>
                        <span class="text-xs">Pendiente de asignar ponente</span>
                    </div>`;
            }

            agendaContainer.insertAdjacentHTML("beforeend", `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4 transition-all hover:border-primary/30">
                    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="material-symbols-outlined text-primary text-sm">calendar_today</span>
                                <span class="text-xs font-bold uppercase text-slate-400">${fechaLegible}</span>
                            </div>
                            <h3 class="font-bold text-xl text-slate-800">${ses.titulo}</h3>
                            <p class="text-slate-500 text-sm mt-1">${ses.descripcion || ""}</p>
                            
                            ${ponenteHTML}
                        </div>
                        
                        <div class="flex flex-col items-end gap-3 shrink-0">
                            <div class="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 text-center">
                                <span class="text-primary font-bold text-lg">${hInicio} - ${hFin}</span>
                            </div>
                            <button onclick="window.openAssigner(${ses.id})" class="group flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest">
                                <span class="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform">sync_alt</span> 
                                Gestionar
                            </button>
                        </div>
                    </div>
                </div>`);
        });
    } catch (err) { console.error(err); }
}

// --- FUNCIÓN GLOBAL PARA DESPLEGAR LA BIO ---
window.toggleBio = (id) => {
    const bioDiv = document.getElementById(`bio-${id}`);
    const icon = document.getElementById(`icon-bio-${id}`);
    
    if (bioDiv.classList.contains('hidden')) {
        bioDiv.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        bioDiv.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
};


// 3. FUNCIÓN PARA ABRIR EL MODAL DE ASIGNACIÓN/REASIGNACIÓN
window.openAssigner = (idSesion) => {
    currentSessionId = idSesion;
    document.getElementById('assignSpeakerModal').showModal();
};

// 4. CONFIRMAR REASIGNACIÓN (Llamada a tabla intermedia)
document.getElementById('btnConfirmAssign')?.addEventListener('click', async () => {
    const id_ponente = document.getElementById('assignSpeakerSelect').value;
    
    // Llamamos a tu controlador de SesionPonente
    const res = await apiRequest("/sesiones_ponentes", "POST", {
        id_sesion: currentSessionId,
        id_ponente: id_ponente
    });

    if (res.success) {
        document.getElementById('assignSpeakerModal').close();
        loadSessions(); // Refrescamos la agenda para ver el cambio
    } else {
        alert("Error al reasignar: " + res.message);
    }
});

// 5. CREAR SESIÓN
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
            id_ponente: formData.get('id_ponente') || null, 
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

// 6. CREAR PONENTE
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
            loadSpeakers(); // Actualizamos los selectores
        }
    });
    // Función para guardar los cambios de Branding e Idioma
async function saveEventSettings() {
    const selectedLangs = Array.from(document.querySelectorAll('input[name="lang"]:checked')).map(el => el.value);
    const primaryColor = document.getElementById('colorPicker').value;

    const payload = {
        nombre: document.getElementById('editNombre').value,
        fecha_inicio: document.getElementById('editInicio').value,
        fecha_fin: document.getElementById('editFin').value,
        ubicacion: document.getElementById('editUbicacion').value,
        descripcion: document.getElementById('editDesc').value,
        languages: selectedLangs,
        primary_color: primaryColor
    };

    const res = await apiRequest(`/eventos/${eventData.id}`, "PUT", payload);
    if (res.success) {
        alert("Configuración guardada. Aplicando cambios...");
        // Actualizamos el objeto en localStorage para que el branding se vea al instante
        eventData.configuracion = JSON.stringify({
            languages: selectedLangs,
            primary_color: primaryColor
        });
        localStorage.setItem("selected_event", JSON.stringify(eventData));
        location.reload(); 
    }
}
}

// Iniciar la página
loadSessions();
loadSpeakers();