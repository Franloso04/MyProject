import { apiRequest } from "./api.js";
import { saveSession } from "./auth.js";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

if(form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.textContent = "Conectando...";
        
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await apiRequest("/usuarios/login", "POST", { email, password });

            if (res.success) {
                saveSession(res);

                // --- CLAVE: Guardamos la Organización del usuario ---
                // Tu SQL dice que Juan Perez (id 1) es de organizacion_id 1
                // Asegúrate de que el backend devuelve 'organizacion_id' en el objeto 'user'
                if(res.user && res.user.organizacion_id) {
                    localStorage.setItem("selected_org", res.user.organizacion_id);
                    window.location.href = "events.html";
                } else {
                    // Si el usuario es superadmin o no tiene org, lo mandamos igual a ver qué pasa
                    // O le asignamos org 1 por defecto para probar
                    console.warn("Usuario sin organización, asignando 1 por defecto para test");
                    localStorage.setItem("selected_org", "1"); 
                    window.location.href = "events.html";
                }
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = "Error: " + (err.message || "Credenciales incorrectas");
        }
    });
}