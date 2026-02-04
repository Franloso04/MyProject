import { API_BASE } from "./config.js";
import { getToken } from "./auth.js";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Respuesta inválida del servidor");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Error en la API");
  }

  return data;
}
