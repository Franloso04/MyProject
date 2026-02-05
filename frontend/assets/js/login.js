import { apiRequest } from "./api.js";
import { saveSession } from "./auth.js";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

if(form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.textContent = "";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            errorMsg.textContent = "Por favor, completa todos los campos.";
            return;
        }

        try {
            // Petición al backend
            const res = await apiRequest("/usuarios/login", "POST", { email, password });

            if (res.success && res.token) {
                // Guardamos sesión
                saveSession(res); 
                // REDIRECCIÓN CORRECTA: Vamos al selector para elegir organización/evento
                window.location.href = "selector.html";
            } else {
                throw new Error(res.message || "Credenciales incorrectas");
            }
        } catch (err) {
            console.error("Login error:", err);
            errorMsg.textContent = err.message || "Error al conectar con el servidor.";
        }
    });
}