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
// Escuchamos clicks en todo el grid, y detectamos si fue en un botón "Gestionar" o "Editar"
if (eventsGrid) {
    eventsGrid.addEventListener('click', (e) => {
        // A) Lógica para GESTIONAR
        const btnManage = e.target.closest('.btn-manage');
        if (btnManage) {
            const eventId = btnManage.dataset.id;
            const eventName = btnManage.dataset.name;
            const eventConfig = btnManage.dataset.config;

            console.log("CLICK GESTIONAR DETECTADO:", eventId, eventName);

            if (eventId && eventName) {
                // GUARDAMOS EL OBJETO COMPLETO PARA EL BRANDING
                const eventData = { 
                    id: eventId, 
                    nombre: eventName,
                    configuracion: eventConfig
                };
                localStorage.setItem("selected_event", JSON.stringify(eventData));
                
                console.log("Guardado en LocalStorage:", localStorage.getItem("selected_event"));
                window.location.href = "dashboard.html";
            } else {
                alert("Error: El evento no tiene ID válido.");
            }
            return;
        }

        // B) Lógica para EDITAR (Icono Settings)
        const btnEdit = e.target.closest('.btn-edit');
        if (btnEdit) {
            const eventId = btnEdit.dataset.id;
            // Buscamos los datos en el array global que cargamos en loadEvents
            const event = window.allEvents.find(ev => ev.id == eventId);
            if (event) {
                openEditModal(event);
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
        
        // Guardamos en window para que la edición tenga acceso rápido a los datos
        window.allEvents = events;

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
                    // Verificamos si es string (de la BD) o ya es objeto
                    const config = typeof ev.configuracion === 'string' ? JSON.parse(ev.configuracion) : ev.configuracion;
                    primaryColor = config.primary_color || primaryColor;
                } catch (e) {
                    console.error("Error parseando configuración de branding", e);
                }
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
                <p class="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">${ev.descripcion || ""}</p>
                <div class="pt-4 border-t border-slate-50 mt-auto">
                    <p class="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">calendar_today</span> ${fecha}
                    </p>
                    
                    <button class="btn-manage w-full py-2.5 rounded-xl text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2"
                        data-id="${ev.id}" 
                        data-name="${titulo}"
                        data-config='${typeof ev.configuracion === 'string' ? ev.configuracion : JSON.stringify(ev.configuracion || {})}'
                        style="background-color: #1e293b;"
                        onmouseover="this.style.backgroundColor='${primaryColor}'"
                        onmouseout="this.style.backgroundColor='#1e293b'">
                        Gestionar <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                </div>
            </div>`;
            eventsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (err) {
        console.error("Error cargando eventos:", err);
        eventsGrid.innerHTML = `<p class="col-span-full text-red-500 text-center">Error de conexión al cargar la lista.</p>`;
    }
}

// 4. Función para abrir modal en Modo Edición (Punto B Hoja de Ruta)
function openEditModal(event) {
    createEventModal.querySelector('h3').textContent = "Editar Evento";
    const form = createEventForm;
    
    // Rellenar campos del formulario
    form.nombre.value = event.nombre || event.titulo;
    form.descripcion.value = event.descripcion || "";
    // Formateo de fecha para input datetime-local
    form.fecha_inicio.value = event.fecha_inicio ? event.fecha_inicio.substring(0, 16).replace(" ", "T") : "";
    form.fecha_fin.value = event.fecha_fin ? event.fecha_fin.substring(0, 16).replace(" ", "T") : "";
    form.ubicacion.value = event.ubicacion || "";
    
    // Rellenar Branding (Punto C8)
    let config = { primary_color: "#197fe6" };
    if (event.configuracion) {
        try { 
            config = typeof event.configuracion === 'string' ? JSON.parse(event.configuracion) : event.configuracion; 
        } catch(e) {}
    }
    const picker = document.getElementById("primaryColorPicker");
    if (picker) picker.value = config.primary_color || "#197fe6";

    // Atributo crucial para saber que estamos editando en el submit
    form.dataset.editId = event.id;
    createEventModal.showModal();
}

// 5. Crear o Actualizar Evento (POST o PUT)
if (createEventForm) {
    createEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const editId = createEventForm.dataset.editId;
        const formData = new FormData(createEventForm);
        const data = Object.fromEntries(formData.entries());
        
        data.id_organizacion = localStorage.getItem("selected_org");
        
        // --- PROCESAR BRANDING E IDIOMAS (Punto C y B6) ---
        const color = document.getElementById("primaryColorPicker")?.value || "#197fe6";
        data.configuracion = JSON.stringify({
            primary_color: color,
            languages: ["es"] 
        });

        try {
            let res;
            if (editId) {
                // MODO EDICIÓN: Enviamos al endpoint PUT de tu EventoController
                res = await apiRequest(`/eventos/${editId}`, "PUT", data);
            } else {
                // MODO CREACIÓN
                data.estado = "BORRADOR";
                res = await apiRequest("/eventos", "POST", data);
            }

            if (res.success) {
                createEventModal.close();
                resetModal();
                loadEvents(); // Recargamos la parrilla para ver el cambio de color/texto
            } else {
                alert("Error: " + (res.message || "No se pudo completar la operación"));
            }
        } catch (err) { 
            console.error("Error en submit:", err);
            alert("Error de conexión al procesar el evento"); 
        }
    });
}

// 6. Funciones de Limpieza
function resetModal() {
    createEventForm.reset();
    delete createEventForm.dataset.editId;
    createEventModal.querySelector('h3').textContent = "Nuevo Evento";
}

createEventModal.addEventListener('close', () => {
    if (!createEventModal.open) resetModal();
});

loadEvents();