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

    // GET /ponentes?id_evento=X
    public function index() {
        header("Content-Type: application/json");
        $id_evento = isset($_GET['id_evento']) ? $_GET['id_evento'] : null;

        if ($id_evento) {
            $stmt = $this->ponente->leerPorEvento($id_evento);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $items]);
        } else {
            // Si no hay ID, devolvemos array vacío en vez de error para no romper el frontend
            echo json_encode(["success" => true, "data" => []]);
        }
    }

    // POST /ponentes (RENOMBRADO A create PARA QUE TU INDEX.PHP NO FALLE)
    public function create() {
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->nombre) || empty($data->id_evento)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos (nombre, id_evento)."]);
            return;
        }

        $this->ponente->nombre = $data->nombre;
        $this->ponente->id_evento = $data->id_evento;
        $this->ponente->email = $data->email ?? '';
        $this->ponente->bio = $data->bio ?? '';
        $this->ponente->foto_url = $data->foto_url ?? '';

        if ($this->ponente->crear()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Ponente añadido correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al guardar en BD."]);
        }
    }
}
?>