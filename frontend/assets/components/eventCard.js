import { formatDate } from "../assets/js/utils.js";

export function eventCard(event) {
    return `
        <div class="event-card">
            <h3>${event.titulo}</h3>
            <p><strong>Fecha:</strong> ${formatDate(event.fecha)}</p>
            <p><strong>Ubicación:</strong> ${event.ubicacion}</p>
            <p class="event-desc">${event.descripcion || "Sin descripción"}</p>

            <div class="event-actions">
                <button class="btn btn-primary" data-id="${event.id}">Ver detalles</button>
                <button class="btn btn-secondary" data-id="${event.id}">Editar</button>
            </div>
        </div>
    `;
}
export function createEventCard(ev) {
    const fecha = new Date(ev.fecha_inicio).toLocaleDateString();
    
    // Sacamos el color de la config
    let primaryColor = "#197fe6";
    if (ev.configuracion) {
        try {
            const config = typeof ev.configuracion === 'string' ? JSON.parse(ev.configuracion) : ev.configuracion;
            primaryColor = config.primary_color || primaryColor;
        } catch (e) {}
    }

    return `
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all">
        <div class="flex justify-between items-start mb-4">
            <span class="text-[10px] font-bold uppercase px-2 py-1 rounded" 
                  style="color: ${primaryColor}; background-color: ${primaryColor}15">
                ${ev.estado || 'BORRADOR'}
            </span>
            <button class="btn-edit text-slate-300 hover:text-primary transition-colors" data-id="${ev.id}">
                <span class="material-symbols-outlined text-xl">settings</span>
            </button>
        </div>
        <h3 class="font-bold text-lg text-slate-900 mb-1">${ev.nombre || ev.titulo}</h3>
        <p class="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">${ev.descripcion || ""}</p>
        <div class="pt-4 border-t border-slate-50 mt-auto">
            <button class="btn-manage w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2"
                data-id="${ev.id}" 
                data-name="${ev.nombre || ev.titulo}"
                style="--hover-color: ${primaryColor}"
                onmouseover="this.style.backgroundColor='${primaryColor}'"
                onmouseout="this.style.backgroundColor='#1e293b'">
                Gestionar <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
        </div>
    </div>`;
}