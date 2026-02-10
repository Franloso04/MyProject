<?php
include_once dirname(__DIR__) . '/config/database.php';
include_once dirname(__DIR__) . '/models/Sesion.php';

class SesionController {
    private $db;
    private $sesion;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->sesion = new Sesion($this->db);
    }

    public function index() {
        header("Content-Type: application/json");
        $id_evento = isset($_GET['id_evento']) ? $_GET['id_evento'] : null;
        if ($id_evento) {
            $stmt = $this->sesion->leerPorEvento($id_evento);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $items]);
        } else {
            echo json_encode(["success" => true, "data" => []]);
        }
    }

    public function store() {
        $this->create();
    }

    public function create() {
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents("php://input"));

        if (!$data || empty($data->titulo) || empty($data->hora_inicio)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios."]);
            return;
        }

        $this->sesion->id_evento = $data->id_evento;
        $this->sesion->titulo = $data->titulo;
        $this->sesion->descripcion = $data->descripcion ?? '';
        $this->sesion->hora_inicio = $data->hora_inicio;
        $this->sesion->hora_fin = $data->hora_fin ?? $data->hora_inicio;
        $this->sesion->id_ubicacion = $data->id_ubicacion ?? null;

        if ($this->sesion->crear()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Sesión creada."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al crear sesión."]);
        }
    }
}
?>