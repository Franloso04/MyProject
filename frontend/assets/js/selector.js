import { apiRequest } from "./api.js";
import { requireAuth, logout, getSession } from "./auth.js";

// Verificar autenticación al inicio
requireAuth();

// Elementos del DOM
const orgSelect = document.getElementById("orgSelect");
const eventSelect = document.getElementById("eventSelect");
const eventContainer = document.getElementById("eventContainer");
const btnContinue = document.getElementById("btnContinue");
const btnLogout = document.getElementById("btnLogout");
const userNameSpan = document.getElementById("userName");

// Inicialización
const session = getSession();
if (userNameSpan && session?.user) {
    userNameSpan.innerText = session.user.nombre_completo || session.user.email;
}

// Listeners
if (btnLogout) btnLogout.addEventListener("click", logout);

// Lógica de carga
async function loadOrganizations() {
    try {
        const res = await apiRequest("/organizaciones");
        
        orgSelect.innerHTML = `<option value="">Selecciona una organización</option>`;
        
        if (res.data && res.data.length > 0) {
            res.data.forEach((org) => {
                const option = document.createElement("option");
                option.value = org.id;
                option.textContent = org.nombre;
                orgSelect.appendChild(option);
            });
        } else {
            orgSelect.innerHTML = `<option value="">No se encontraron organizaciones</option>`;
        }
    } catch (err) {
        console.error(err);
        alert("Error cargando organizaciones. Revisa la consola.");
    }
}

async function loadEvents(orgId) {
    // Resetear selector de eventos
    eventSelect.innerHTML = `<option value="">Cargando eventos...</option>`;
    eventSelect.disabled = true;
    btnContinue.disabled = true;

    try {
        const res = await apiRequest(`/eventos?organizacion_id=${orgId}`);
        
        eventSelect.innerHTML = `<option value="">Selecciona un evento</option>`;
        
        if (res && res.length > 0) { // Tu controlador devuelve un array directo, no {data: []} a veces.
            res.forEach((ev) => {
                const option = document.createElement("option");
                option.value = ev.id;
                option.textContent = ev.nombre || ev.titulo; // Manejar ambos casos
                eventSelect.appendChild(option);
            });
            
            // Activar UI
            eventSelect.disabled = false;
            eventContainer.classList.remove("opacity-50", "pointer-events-none");
            document.getElementById("step2-dot").classList.add("active");
        } else {
            eventSelect.innerHTML = `<option value="">Sin eventos activos</option>`;
        }
    } catch (err) {
        console.error(err);
        eventSelect.innerHTML = `<option value="">Error cargando eventos</option>`;
    }
}

// Evento: Cambio de Organización
orgSelect.addEventListener("change", (e) => {
    const orgId = e.target.value;
    if (orgId) {
        loadEvents(orgId);
    } else {
        eventContainer.classList.add("opacity-50", "pointer-events-none");
        eventSelect.disabled = true;
        btnContinue.disabled = true;
    }
});

// Evento: Cambio de Evento
eventSelect.addEventListener("change", (e) => {
    const eventId = e.target.value;
    if (eventId) {
        btnContinue.disabled = false;
        btnContinue.classList.add("ring-4", "ring-blue-300"); // Efecto visual
    } else {
        btnContinue.disabled = true;
    }
});

// Evento: Botón Continuar
btnContinue.addEventListener("click", () => {
    const orgId = orgSelect.value;
    const eventId = eventSelect.value;
    const eventName = eventSelect.options[eventSelect.selectedIndex].text;

    if (!orgId || !eventId) return;

    // Guardar selección
    localStorage.setItem("selected_org", orgId);
    
    // Guardamos el objeto evento básico para usarlo en el dashboard
    const eventData = {
        id: eventId,
        nombre: eventName
    };
    localStorage.setItem("selected_event", JSON.stringify(eventData));

    // Redirigir
    window.location.href = "dashboard.html";
});

// Arrancar
loadOrganizations();