<?php
include_once dirname(__DIR__) . '/config/database.php';
include_once dirname(__DIR__) . '/models/SesionPonente.php';

class SesionPonenteController {
    private $db;
    private $modelo;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->modelo = new SesionPonente($this->db);
    }

    public function asignar() {
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->id_sesion)) {
            echo json_encode(["success" => false, "message" => "ID de sesión requerido"]);
            return;
        }

        // 1. Limpiamos asignaciones previas para esta sesión (Reasignación limpia)
        $queryDelete = "DELETE FROM sesiones_ponentes WHERE id_sesion = ?";
        $stmtDel = $this->db->prepare($queryDelete);
        $stmtDel->execute([$data->id_sesion]);

        // 2. Si se envió un ponente, creamos la nueva vinculación
        if (!empty($data->id_ponente)) {
            $queryInsert = "INSERT INTO sesiones_ponentes (id_sesion, id_ponente) VALUES (?, ?)";
            $stmtIns = $this->db->prepare($queryInsert);
            if ($stmtIns->execute([$data->id_sesion, $data->id_ponente])) {
                echo json_encode(["success" => true, "message" => "Asignación actualizada"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al vincular"]);
            }
        } else {
            echo json_encode(["success" => true, "message" => "Ponente desvinculado"]);
        }
    }
}