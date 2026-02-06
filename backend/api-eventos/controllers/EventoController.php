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
            // CORRECCIÓN: Leemos 'id_organizacion' de la URL
            $orgId = isset($_GET['id_organizacion']) ? $_GET['id_organizacion'] : null;
            
            if ($orgId) {
                // CORRECCIÓN: Filtramos por la columna 'id_organizacion'
                $query = "SELECT * FROM eventos WHERE id_organizacion = :orgId ORDER BY fecha_inicio DESC";
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

        // CORRECCIÓN: Validamos que llegue 'id_organizacion'
        // IMPORTANTE: Aquí cambiamos $data->organizacion_id por $data->id_organizacion
        if (empty($data->titulo) || empty($data->id_organizacion)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (titulo, id_organizacion)."]);
            return;
        }

        $this->evento->titulo = $data->titulo;
        $this->evento->descripcion = $data->descripcion ?? '';
        $this->evento->fecha_inicio = $data->fecha_inicio;
        $this->evento->fecha_fin = $data->fecha_fin;
        
        // CORRECCIÓN CLAVE: Asignamos a la propiedad correcta del modelo
        $this->evento->id_organizacion = $data->id_organizacion; 
        
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