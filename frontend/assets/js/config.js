// js/config.js
export const API_BASE = "http://localhost/MyProject/backend/api-eventos"; 


export const ENDPOINTS = {
  // Endpoints corregidos para apuntar a tu estructura PHP
  STATS: (eventId) => `${API_BASE}/dashboard/stats?event_id=${eventId}`,
  AGENDA: (eventId) => `${API_BASE}/sessions?event_id=${eventId}`,
  ATTENDEES: (eventId, query = '') => `${API_BASE}/asistentes?id_evento=${eventId}&q=${query}`, // Nota: tu API PHP filtra por query param si lo implementas, por ahora traerá todos
  EVENTOS: `${API_BASE}/eventos`,
  SESIONES: `${API_BASE}/sessions`,
  ASISTENTES: `${API_BASE}/asistentes`,
};