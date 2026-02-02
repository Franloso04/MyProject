<?php
// api-eventos/models/Dashboard.php

class Dashboard {
    private $conn;

    // No tiene tabla propia, consulta varias
    public function __construct($db) {
        $this->conn = $db;
    }

    public function obtenerEstadisticas($id_evento) {
        // 1. Total Asistentes (Confirmados o Pendientes, según tu lógica de negocio)
        // Aquí contamos todos los registros de ese evento
        $queryTotal = "SELECT COUNT(*) as total FROM asistentes WHERE id_evento = ?";
        $stmtTotal = $this->conn->prepare($queryTotal);
        $stmtTotal->execute([$id_evento]);
        $total = $stmtTotal->fetchColumn();

        // 2. Total Checked-in (Ya han entrado)
        $queryCheckin = "SELECT COUNT(*) as total FROM asistentes WHERE id_evento = ? AND estado = 'CHECKED_IN'";
        $stmtCheckin = $this->conn->prepare($queryCheckin);
        $stmtCheckin->execute([$id_evento]);
        $checkedIn = $stmtCheckin->fetchColumn();

        // 3. Cálculo de porcentaje (Evitar división por cero)
        $porcentaje = ($total > 0) ? round(($checkedIn / $total) * 100) : 0;

        // 4. Cálculo de Ingresos
        // Si tuvieras tabla de tickets, harías SUM(precio). 
        // Como no la tenemos en el esquema básico, simulamos un precio promedio (ej: 50$) o devolvemos 0
        $ingresos = $total * 50; 

        return [
            "total_attendees" => (int)$total,
            "total_revenue" => (float)$ingresos,
            "checkin_percentage" => (int)$porcentaje,
            "checked_in_count" => (int)$checkedIn
        ];
    }
}
?>