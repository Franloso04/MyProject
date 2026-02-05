import { apiRequest } from "./api.js";
import { saveSession } from "./auth.js";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    errorMsg.textContent = "Debes completar todos los campos.";
    return;
  }

  try {
    const data = await apiRequest("/usuarios/login", "POST", {
      email,
      password,
    });

    if (!data.token || !data.user) {
      throw new Error("Respuesta inválida del servidor.");
    }

    saveSession(data);

    window.location.href = "./events.html";
  } catch (err) {
    errorMsg.textContent = err.message;
    console.error("LOGIN ERROR:", err);
  }
});
