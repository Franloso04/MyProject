<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';

class DashboardController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getStats() {
        $event_id = isset($_GET['event_id']) ? $_GET['event_id'] : null;
        
        if (!$event_id) {
            http_response_code(400);
            echo json_encode(["message" => "Falta event_id"]);
            return;
        }

        // 1. Total Asistentes
        $query1 = "SELECT COUNT(*) as total FROM asistentes WHERE id_evento = ?";
        $stmt1 = $this->db->prepare($query1);
        $stmt1->execute([$event_id]);
        $total_attendees = $stmt1->fetchColumn();

        // 2. Total Checked-in
        $query2 = "SELECT COUNT(*) as total FROM asistentes WHERE id_evento = ? AND estado = 'CHECKED_IN'";
        $stmt2 = $this->db->prepare($query2);
        $stmt2->execute([$event_id]);
        $checked_in = $stmt2->fetchColumn();

        // 3. Calculo de porcentaje
        $percentage = ($total_attendees > 0) ? round(($checked_in / $total_attendees) * 100) : 0;

        // 4. Ingresos (Simulado o real si tienes tabla de pagos)
        // Por ahora simulamos $50 por ticket confirmado
        $revenue = $total_attendees * 50; 

        $response = [
            "total_attendees" => $total_attendees,
            "total_revenue" => $revenue,
            "checkin_percentage" => $percentage,
            "checked_in_count" => $checked_in
        ];

        http_response_code(200);
        echo json_encode($response);
    }
}
?>