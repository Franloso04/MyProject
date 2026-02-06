<?php
include_once dirname(__DIR__) . '/config/database.php';
include_once dirname(__DIR__) . '/models/Evento.php';

class EventoController {
    private $db;
    private $evento;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->evento = new Evento($this->db);
    }

    // GET /eventos
    public function index() {
        header("Content-Type: application/json; charset=UTF-8");

        try {
            // Recibe 'organizacion_id' de la URL
            $orgId = isset($_GET['organizacion_id']) ? $_GET['organizacion_id'] : null;
            
            if ($orgId) {
                // Consulta manual para filtrar
                $query = "SELECT * FROM eventos WHERE organizacion_id = :orgId ORDER BY fecha_inicio DESC";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(":orgId", $orgId);
                $stmt->execute();
            } else {
                $stmt = $this->evento->leer();
            }

            $items = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $items[] = $row;
            }

            echo json_encode(["success" => true, "data" => $items]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    // POST /eventos
    public function create() {
        header("Content-Type: application/json; charset=UTF-8");
        $data = json_decode(file_get_contents("php://input"));

        // Validación
        if (empty($data->titulo) || empty($data->organizacion_id)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios."]);
            return;
        }

        // Asignación estandarizada
        $this->evento->titulo = $data->titulo;
        $this->evento->descripcion = $data->descripcion ?? '';
        $this->evento->fecha_inicio = $data->fecha_inicio;
        $this->evento->fecha_fin = $data->fecha_fin;
        $this->evento->organizacion_id = $data->organizacion_id; // Coincide con BD
        $this->evento->ubicacion_id = $data->ubicacion_id ?? null;
        $this->evento->estado = 'BORRADOR';

        if ($this->evento->crear()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Evento creado."]);
        } else {
            http_response_code(503);
            echo json_encode(["success" => false, "message" => "Error al guardar en BD."]);
        }
    }
}
?>