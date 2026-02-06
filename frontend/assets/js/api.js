import { API_BASE } from "./config.js";
import { getSession } from "./auth.js";

export async function apiRequest(endpoint, method = "GET", body = null) {
    const session = getSession();
    const headers = {
        // ESTA LÍNEA ES OBLIGATORIA para que PHP entienda los datos
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    if (session && session.token) {
        headers["Authorization"] = `Bearer ${session.token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        // Si el servidor devuelve error 500 (HTML), esto captura el fallo antes de romper
        const text = await response.text();
        try {
            return JSON.parse(text); // Intentamos convertir a JSON
        } catch (e) {
            console.error("Respuesta no es JSON:", text); // Muestra el error real de PHP en consola
            throw new Error("Error del servidor (PHP): " + text.substring(0, 100)); 
        }
    } catch (err) {
        console.error("Error de red:", err);
        throw err;
    }
}