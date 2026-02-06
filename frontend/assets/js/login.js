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
            // Petición al backend
            const res = await apiRequest("/usuarios/login", "POST", { email, password });
            
            // DEBUG: Ver qué devuelve exactamente el servidor (Míralo en la consola F12)
            console.log("Respuesta del servidor:", res);

            if (res.success) {
                saveSession(res);

                // --- SOLUCIÓN BLINDADA ---
                // Buscamos el ID con ambos nombres posibles para evitar fallos tontos
                // Si 'res.user' no existe, evitamos que el código explote con el '?.'
                const orgId = res.user?.id_organizacion || res.user?.organizacion_id;

                if (orgId) {
                    localStorage.setItem("selected_org", orgId);
                    console.log("Guardado Org ID:", orgId);
                    window.location.href = "events.html";
                } else {
                    // Si llegamos aquí, es que el usuario existe pero la columna viene vacía
                    console.warn("Usuario logueado pero sin organización. Asignando '1' por defecto.");
                    localStorage.setItem("selected_org", "1"); 
                    window.location.href = "events.html";
                }
            } else {
                // Si success es false, mostramos el mensaje del servidor
                throw new Error(res.message || "Credenciales incorrectas");
            }
        } catch (err) {
            console.error("Error Login:", err);
            // Esto te mostrará el error real en la pantalla
            errorMsg.textContent = "Error: " + (err.message || "Error de conexión");
        }
    });
}