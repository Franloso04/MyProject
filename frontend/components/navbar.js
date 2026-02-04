import { logout, getOrganization } from "../assets/js/auth.js";

export function renderNavbar() {
    const org = getOrganization();

    return `
        <nav class="navbar">
            <div class="navbar-left">
                <h2>Event Management Backoffice</h2>
                <span class="org-name">${org ? org.nombre : "Organización"}</span>
            </div>

            <div class="navbar-right">
                <button id="logoutBtn" class="btn btn-danger">Cerrar sesión</button>
            </div>
        </nav>
    `;
}

export function initNavbar() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}
