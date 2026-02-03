const API_URL = "http://localhost/api-eventos";

export const getEventos = async () =>
  fetch(`${API_URL}/eventos`).then(r => r.json());

export const getDashboard = async (id) =>
  fetch(`${API_URL}/dashboard/${id}`).then(r => r.json());

export const getAsistentes = async (id) =>
  fetch(`${API_URL}/asistentes/evento/${id}`).then(r => r.json());

export const getSesiones = async (id) =>
  fetch(`${API_URL}/sesiones/evento/${id}`).then(r => r.json());

export const registrarAcceso = async (data) =>
  fetch(`${API_URL}/registro-acceso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
