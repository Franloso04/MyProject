import { apiRequest } from "./api.js";
import { saveSession, isLoggedIn } from "./auth.js";

if (isLoggedIn()) {
    window.location.href = "dashboard.html";
}

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMsg.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        // Ajusta este endpoint según tu API real
        const response = await apiRequest("auth/login.php", "POST", {
            email,
            password
        });

        if (!response.token || !response.organization) {
            throw new Error("Respuesta inválida del servidor");
        }

        saveSession(response.token, response.organization);

        window.location.href = "dashboard.html";

    } catch (err) {
        errorMsg.textContent = "Credenciales incorrectas o error en servidor.";
        console.error(err);
    }
});
