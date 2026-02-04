// js/config.js
export const API_BASE_URL = "http://localhost/MyProject/backend/api-eventos"; 


export const ENDPOINTS = {
  // Endpoints corregidos para apuntar a tu estructura PHP
  STATS: (eventId) => `${API_BASE_URL}/dashboard/stats?event_id=${eventId}`,
  AGENDA: (eventId) => `${API_BASE_URL}/sessions?event_id=${eventId}`,
  ATTENDEES: (eventId, query = '') => `${API_BASE_URL}/asistentes?id_evento=${eventId}&q=${query}`, // Nota: tu API PHP filtra por query param si lo implementas, por ahora traerá todos
  EVENTOS: `${API_BASE_URL}/eventos`,
  SESIONES: `${API_BASE_URL}/sessions`
};