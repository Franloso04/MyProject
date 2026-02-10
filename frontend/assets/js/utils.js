export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
export function applyBranding() {
    const event = JSON.parse(localStorage.getItem("selected_event"));
    if (event && event.configuracion) {
        try {
            const config = JSON.parse(event.configuracion);
            if (config.primary_color) {
                // Cambiamos el color de los elementos con clase 'bg-primary' y 'text-primary'
                const style = document.createElement('style');
                style.innerHTML = `
                    .bg-primary { background-color: ${config.primary_color} !important; }
                    .text-primary { color: ${config.primary_color} !important; }
                    .border-primary { border-color: ${config.primary_color} !important; }
                    .btn-primary { background-color: ${config.primary_color} !important; }
                `;
                document.head.appendChild(style);
            }
        } catch(e) {}
    }
}