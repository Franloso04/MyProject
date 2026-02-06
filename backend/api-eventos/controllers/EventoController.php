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
                // CORRECCIÓN: Filtro SQL usando la columna real 'id_organizacion'
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
  // Reemplaza tu función create() en EventoController.php con esto:
    public function create() {
        header("Content-Type: application/json; charset=UTF-8");
        
        // 1. Ver qué llega exactamente
        $raw = file_get_contents("php://input");
        $data = json_decode($raw);

        // 2. Si no llega JSON válido
        if (is_null($data)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "El servidor recibió datos vacíos o inválidos.", "raw" => $raw]);
            return;
        }

        // 3. Ver qué campos faltan
        if (empty($data->titulo) || empty($data->id_organizacion)) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "Faltan datos obligatorios.",
                "recibido" => $data // Esto te mostrará qué estás enviando realmente
            ]);
            return;
        }

        // 4. Si todo está bien, procedemos
        $this->evento->titulo = $data->titulo;
        $this->evento->descripcion = $data->descripcion ?? '';
        $this->evento->fecha_inicio = $data->fecha_inicio;
        $this->evento->fecha_fin = $data->fecha_fin;
        $this->evento->id_organizacion = $data->id_organizacion;
        $this->evento->ubicacion_id = $data->ubicacion_id ?? null;
        $this->evento->estado = 'BORRADOR';

        if ($this->evento->crear()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Evento creado correctamente."]);
        } else {
            // Error 500 real para ver el log
            http_response_code(500); 
            echo json_encode(["success" => false, "message" => "Error SQL. Revisa el log de errores de PHP."]);
        }
    }
}
?>