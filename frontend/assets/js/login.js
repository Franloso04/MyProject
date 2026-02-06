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

            // MIRA LA CONSOLA: Esto te dirá qué está llegando realmente
            console.log("LOGIN RESPONSE:", res); 

            if (res.success) {
                saveSession(res);

                // BLINDAJE: Buscamos cualquiera de los dos nombres
                // Si el PHP devuelve 'organizacion_id', lo pilla. Si devuelve 'id_organizacion', también.
                const orgId = res.user.id_organizacion || res.user.organizacion_id;

                if (orgId) {
                    localStorage.setItem("selected_org", orgId);
                    // IMPORTANTE: Redirigir a events.html
                    window.location.href = "events.html"; 
                } else {
                    // Si el usuario no tiene org asignada, le ponemos la 1 para que no explote
                    console.warn("Usuario sin org. Asignando 1 por defecto.");
                    localStorage.setItem("selected_org", "1");
                    window.location.href = "events.html";
                }
            } else {
                throw new Error(res.message || "Credenciales incorrectas");
            }
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            errorMsg.textContent = "Error: " + (err.message || "Fallo de conexión");
        }
    });
}