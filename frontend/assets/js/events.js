import { apiRequest } from "./api.js";
import { requireAuth, logout, getSession } from "./auth.js";

requireAuth();
const session = getSession();

const eventsGrid = document.getElementById("eventsGrid");
const userNameDisplay = document.getElementById("userNameDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const createEventForm = document.getElementById("createEventForm");
const createEventModal = document.getElementById("createEventModal");

// 1. Mostrar nombre de usuario (Evita error si el ID no existe en el HTML)
if (userNameDisplay && session?.user) {
    userNameDisplay.textContent = session.user.nombre_completo || "Usuario";
}
if (logoutBtn) logoutBtn.addEventListener("click", logout);

localStorage.removeItem("selected_event");

// 2. Delegación de Eventos (Gestionar y Editar)
if (eventsGrid) {
    eventsGrid.addEventListener('click', (e) => {
        const btnManage = e.target.closest('.btn-manage');
        if (btnManage) {
            const eventId = btnManage.dataset.id;
            const eventName = btnManage.dataset.name;
            const eventConfig = btnManage.dataset.config;

            if (eventId && eventName) {
                localStorage.setItem("selected_event", JSON.stringify({ 
                    id: eventId, 
                    nombre: eventName,
                    configuracion: eventConfig
                }));
                window.location.href = "dashboard.html";
            }
            return;
        }

        const btnEdit = e.target.closest('.btn-edit');
        if (btnEdit) {
            const eventId = btnEdit.dataset.id;
            const event = window.allEvents.find(ev => ev.id == eventId);
            if (event) openEditModal(event);
        }
    });
}

// 3. Cargar Eventos con tu DISEÑO DE BOOTSTRAP y PIN de UBICACIÓN
async function loadEvents() {
    const orgId = localStorage.getItem("selected_org");
    if (!orgId) return;

    try {
        const response = await apiRequest(`/eventos?id_organizacion=${orgId}`);
        const events = response.data || [];
        window.allEvents = events;
        eventsGrid.innerHTML = "";

        if (events.length === 0) {
            eventsGrid.innerHTML = `<div class="col-12 text-center py-5 text-muted italic">No hay eventos creados.</div>`;
            return;
        }

        events.forEach(ev => {
            const fecha = new Date(ev.fecha_inicio).toLocaleDateString();
            const titulo = ev.titulo || ev.nombre || "Sin título";
            const ubicacionTexto = ev.ubicacion || "Sin ubicación";
            
            let primaryColor = "#0d6efd";
            const configRaw = ev.config_marca || ev.configuracion;
            if (configRaw) {
                try {
                    const config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw;
                    primaryColor = config.primary_color || primaryColor;
                } catch (e) {}
            }

            const cardHTML = `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 card-event shadow-sm border-0 d-flex flex-column" style="min-height: 400px;">
                    <div class="color-strip" style="background-color: ${primaryColor}; height: 6px;"></div>
                    <div class="card-body p-4 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="badge rounded-pill" style="color: ${primaryColor}; background-color: ${primaryColor}20">
                                ${ev.estado || 'BORRADOR'}
                            </span>
                            <button class="btn btn-link text-muted p-0 btn-edit" data-id="${ev.id}">
                                <span class="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                        
                        <h5 class="card-title fw-bold text-dark mb-1">${titulo}</h5>
                        
                        <div class="d-flex align-items-center gap-1 text-muted small mb-3">
                            <span class="material-symbols-outlined fs-6 text-danger" style="font-variation-settings: 'FILL' 1;">location_on</span>
                            <span class="fw-semibold">${ubicacionTexto}</span>
                        </div>

                        <div class="flex-grow-1 overflow-auto pe-1 mb-3" style="max-height: 120px; scrollbar-width: thin;">
                            <p class="card-text text-secondary small">
                                ${ev.descripcion || "Sin descripción disponible."}
                            </p>
                        </div>
                        
                        <div class="mt-auto pt-3 border-top">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="text-muted small d-flex align-items-center gap-1">
                                    <span class="material-symbols-outlined fs-6">calendar_today</span>
                                    ${fecha}
                                </div>
                                <button class="btn btn-primary btn-sm px-3 fw-bold btn-manage d-flex align-items-center gap-2"
                                    data-id="${ev.id}" 
                                    data-name="${titulo}"
                                    data-config='${typeof configRaw === 'string' ? configRaw : JSON.stringify(configRaw || {})}'
                                    style="background-color: ${primaryColor}; border-color: ${primaryColor}">
                                    Gestionar <span class="material-symbols-outlined fs-6">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            eventsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (err) {
        console.error("Error cargando eventos:", err);
    }
}

// 4. Modal de Edición
function openEditModal(event) {
    const modalEl = document.getElementById('createEventModal');
    const modal = new bootstrap.Modal(modalEl);
    
    document.getElementById('modalTitle').textContent = "Editar Evento";
    const form = createEventForm;
    
    form.titulo.value = event.nombre || event.titulo;
    form.descripcion.value = event.descripcion || "";
    form.fecha_inicio.value = event.fecha_inicio ? event.fecha_inicio.substring(0, 10) : "";
    form.fecha_fin.value = event.fecha_fin ? event.fecha_fin.substring(0, 10) : "";
    form.ubicacion.value = event.ubicacion || "";
    
    const configRaw = event.config_marca || event.configuracion;
    let config = { primary_color: "#0d6efd" };
    if (configRaw) {
        try { config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw; } catch(e) {}
    }
    document.getElementById("primaryColorPicker").value = config.primary_color || "#0d6efd";

    form.dataset.editId = event.id;
    modal.show();
}

// 5. Submit Form
if (createEventForm) {
    createEventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const editId = createEventForm.dataset.editId;
        const formData = new FormData(createEventForm);
        const data = Object.fromEntries(formData.entries());
        data.id_organizacion = localStorage.getItem("selected_org");
        
        const color = document.getElementById("primaryColorPicker").value;
        data.configuracion = JSON.stringify({ primary_color: color, languages: ["es"] });

        try {
            let res = editId 
                ? await apiRequest(`/eventos/${editId}`, "PUT", data)
                : await apiRequest("/eventos", "POST", data);

            if (res.success) {
                bootstrap.Modal.getInstance(createEventModal).hide();
                loadEvents();
            }
        } catch (err) { console.error(err); }
    });
}

loadEvents();