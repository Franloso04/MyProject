export function renderNavbar() {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    // LEEMOS EL DATO GUARDADO EN EL PASO ANTERIOR
    const eventDataJSON = localStorage.getItem("selected_event");
    let eventData = null;
    
    if (eventDataJSON) {
        try {
            eventData = JSON.parse(eventDataJSON);
        } catch (e) {
            console.error("Error leyendo evento:", e);
        }
    }

    // LÓGICA VISUAL
    const isManaging = eventData && eventData.id;
    const brandText = isManaging ? `Gestionando: ${eventData.nombre}` : "Mis Eventos";
    const brandLink = isManaging ? "dashboard.html" : "events.html";

    // Si NO estamos gestionando, ocultamos los enlaces de la derecha
    const menuLinks = isManaging 
        ? `
        <a href="dashboard.html" class="hover:text-primary transition-colors font-medium text-sm text-slate-600">Dashboard</a>
        <a href="agenda.html" class="hover:text-primary transition-colors font-medium text-sm text-slate-600">Agenda</a>
        <a href="events.html" class="text-slate-400 hover:text-slate-600 text-sm ml-4 border-l pl-4 border-slate-200">Salir del evento</a>
        `
        : `<span class="text-xs text-slate-400 italic">Selecciona un evento para ver opciones</span>`;

    nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-8">
            <a href="${brandLink}" class="font-bold text-lg text-slate-800 tracking-tight flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">dataset</span>
                ${brandText}
            </a>
            <div class="hidden md:flex items-center gap-6">
                ${menuLinks}
            </div>
        </div>
        
        <div class="flex items-center gap-3">
             <span id="userNameDisplay" class="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Admin</span>
             <button id="logoutBtn" class="text-slate-400 hover:text-red-500">
                <span class="material-symbols-outlined">logout</span>
             </button>
        </div>
    </div>
    `;
    
    // Reactivar logout
    setTimeout(() => {
        const btn = document.getElementById("logoutBtn");
        if(btn) {
            btn.onclick = () => {
                localStorage.clear();
                window.location.href = "index.html";
            };
        }
    }, 500);
}