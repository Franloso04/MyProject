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
