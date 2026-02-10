<?php
include_once dirname(__DIR__) . '/config/database.php';
include_once dirname(__DIR__) . '/models/Ponente.php';

class PonenteController {
    private $db;
    private $ponente;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->ponente = new Ponente($this->db);
    }

    public function index() {
        header("Content-Type: application/json");
        $id_evento = $_GET['id_evento'] ?? null;
        if ($id_evento) {
            $stmt = $this->ponente->leerPorEvento($id_evento);
            echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } else {
            echo json_encode(["success" => true, "data" => []]);
        }
    }

    public function store() { // MÉTODO CORREGIDO
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->nombre_completo) || empty($data->id_evento)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Datos insuficientes."]);
            return;
        }

        $this->ponente->id_evento = $data->id_evento;
        $this->ponente->nombre_completo = $data->nombre_completo;
        $this->ponente->biografia = $data->biografia ?? '';
        $this->ponente->email = $data->email ?? '';

        if ($this->ponente->crear()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Ponente creado."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al crear ponente."]);
        }
    }
}