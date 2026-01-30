// js/config.js
export const API_BASE_URL = "http://localhost/MyProject/"; 

export const ENDPOINTS = {
  STATS: (eventId) => `${API_BASE_URL}/dashboard/stats?event_id=${eventId}`,
  AGENDA: (eventId) => `${API_BASE_URL}/sessions?event_id=${eventId}`,
  ATTENDEES: (eventId, query = '') => `${API_BASE_URL}/attendees?event_id=${eventId}&q=${query}`
};