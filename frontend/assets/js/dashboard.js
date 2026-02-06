import { apiRequest } from "./api.js";
import { requireAuth, getSession } from "./auth.js";

requireAuth();

const eventNameHeader = document.getElementById("eventNameHeader");
const statAttendees = document.getElementById("stat-attendees");
const statSessions = document.getElementById("stat-sessions");
const statRevenue = document.getElementById("stat-revenue");

// 1. Obtener Evento Seleccionado
const eventData = JSON.parse(localStorage.getItem("selected_event"));

if (!eventData || !eventData.id) {
    alert("No hay evento seleccionado");
    window.location.href = "events.html";
} else {
    eventNameHeader.textContent = eventData.nombre;
    loadStats(eventData.id);
}

// 2. Cargar Métricas Reales
async function loadStats(eventId) {
    try {
        const res = await apiRequest(`/dashboard/stats?evento_id=${eventId}`);
        
        if(res.success && res.data) {
            statAttendees.textContent = res.data.total_asistentes || 0;
            statSessions.textContent = res.data.total_sesiones || 0;
            statRevenue.textContent = `$${res.data.ingresos_totales || 0}`;
        }
    } catch (err) {
        console.error("Error loading stats", err);
    }
}