import { apiRequest } from "./api.js";
import { requireAuth, logout, getSession } from "./auth.js";

// 1. Verificar autenticación
requireAuth();

// 2. Variables DOM
const eventsGrid = document.getElementById("eventsGrid");
const sidebarUserName = document.getElementById("sidebarUserName");
const eventCountBadge = document.getElementById("eventCountBadge");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");

// 3. Inicializar Usuario
const session = getSession();
if (session?.user) {
    if(sidebarUserName) sidebarUserName.textContent = session.user.nombre_completo || "Usuario";
}

// 4. Logout Listener
if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (refreshBtn) refreshBtn.addEventListener("click", loadEvents);

// 5. FUNCIÓN PRINCIPAL DE CARGA
async function loadEvents() {
    // Obtenemos el ID de organización guardado en el login
    const orgId = localStorage.getItem("selected_org");

    console.log("Intentando cargar eventos para Org ID:", orgId); // DEBUG

    if (!orgId) {
        alert("Error de sesión: No se detectó organización. Por favor, inicia sesión de nuevo.");
        logout();
        return;
    }

    try {
        // Llamada a la API
        const response = await apiRequest(`/eventos?organizacion_id=${orgId}`);
        
        console.log("Respuesta API cruda:", response); // DEBUG: Mira esto en la consola (F12)

        // ADAPTADOR INTELIGENTE:
        // A veces la API devuelve un array directo, a veces { data: [...] }
        let events = [];
        if (Array.isArray(response)) {
            events = response;
        } else if (response.data && Array.isArray(response.data)) {
            events = response.data;
        } else {
            console.error("Formato desconocido:", response);
        }

        // Renderizar
        renderGrid(events);

    } catch (err) {
        console.error("Error fatal cargando eventos:", err);
        eventsGrid.innerHTML = `
            <div class="col-span-full bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                <p class="font-bold text-red-700">Error de conexión</p>
                <p class="text-sm text-red-600">${err.message}</p>
            </div>
        `;
    }
}

function renderGrid(events) {
    eventsGrid.innerHTML = ""; // Limpiar loader
    eventCountBadge.innerText = events.length;

    if (events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div class="bg-white p-6 rounded-full shadow-sm mb-4">
                    <span class="material-icons-outlined text-4xl text-slate-300">event_busy</span>
                </div>
                <h3 class="text-lg font-bold text-slate-700">No hay eventos activos</h3>
                <p class="text-slate-500 max-w-sm mt-2">Parece que tu organización aún no ha creado eventos.</p>
                <button class="mt-6 text-blue-600 font-medium hover:underline">Crear el primero ahora</button>
            </div>
        `;
        return;
    }

    events.forEach(ev => {
        // Lógica de colores según estado
        const isPublished = (ev.estado === 'PUBLICADO' || ev.estado === 'LIVE');
        const statusColor = isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
        const statusIcon = isPublished ? 'check_circle' : 'edit_note';
        
        // Formatear fecha
        const fecha = new Date(ev.fecha_inicio).toLocaleDateString('es-ES', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });

        const card = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 fade-in flex flex-col">
            
            <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <span class="material-icons-outlined">event</span>
                </div>
                <span class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusColor}">
                    <span class="material-icons-outlined text-[14px]">${statusIcon}</span>
                    ${ev.estado || 'Borrador'}
                </span>
            </div>

            <h3 class="font-bold text-lg text-slate-800 mb-2 line-clamp-1" title="${ev.titulo || ev.nombre}">
                ${ev.titulo || ev.nombre}
            </h3>
            
            <p class="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">
                ${ev.descripcion || "Sin descripción disponible para este evento."}
            </p>

            <div class="border-t border-slate-100 pt-4 mt-auto">
                <div class="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <span class="material-icons-outlined text-sm">calendar_month</span>
                    ${fecha}
                </div>
                
                <button class="btn-select w-full py-2.5 rounded-lg bg-dark text-white font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                    data-id="${ev.id}" 
                    data-name="${ev.titulo || ev.nombre}">
                    Gestionar
                    <span class="material-icons-outlined text-base">arrow_forward</span>
                </button>
            </div>
        </div>
        `;
        eventsGrid.innerHTML += card;
    });

    // Agregar eventos click a los botones generados
    document.querySelectorAll(".btn-select").forEach(btn => {
        btn.addEventListener("click", () => {
            const eventData = {
                id: btn.dataset.id,
                nombre: btn.dataset.name
            };
            localStorage.setItem("selected_event", JSON.stringify(eventData));
            window.location.href = "dashboard.html";
        });
    });
}

// Ejecutar
loadEvents();