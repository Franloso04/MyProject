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
                // Filtro SQL usando la columna real 'id_organizacion'
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

    // GET /eventos/{id} (NECESARIO PARA QUE NO FALLE INDEX.PHP)
    public function show($id) {
        header("Content-Type: application/json; charset=UTF-8");
        // Aquí deberías implementar la lógica para leer un solo evento
        // Por ahora devolvemos un mock para que no de error 500
        echo json_encode(["message" => "Detalle del evento ID: " . $id]);
    }

    // POST /eventos (RENOMBRADO A store PARA COINCIDIR CON INDEX.PHP)
    public function store() {
        header("Content-Type: application/json; charset=UTF-8");
        
        $raw = file_get_contents("php://input");
        $data = json_decode($raw);

        // 1. Si no llega JSON válido
        if (is_null($data)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "El servidor recibió datos vacíos.", "raw" => $raw]);
            return;
        }

        // 2. Ver qué campos faltan
        if (empty($data->titulo) || empty($data->id_organizacion)) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "Faltan datos obligatorios (titulo, id_organizacion).",
                "recibido" => $data
            ]);
            return;
        }

        // 3. Asignación de datos
        $this->evento->titulo = $data->titulo;
        $this->evento->descripcion = $data->descripcion ?? '';
        $this->evento->fecha_inicio = $data->fecha_inicio;
        $this->evento->fecha_fin = $data->fecha_fin;
        
        // ¡OJO! Esto conecta con el modelo usando el nombre correcto
        $this->evento->id_organizacion = $data->id_organizacion;
        
        $this->evento->ubicacion_id = $data->ubicacion_id ?? null;
        $this->evento->estado = 'BORRADOR';

        // 4. Guardar
        if ($this->evento->crear()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Evento creado correctamente."]);
        } else {
            http_response_code(500); 
            echo json_encode(["success" => false, "message" => "Error interno al crear evento."]);
        }
    }

     public function update($id) {
    header("Content-Type: application/json");
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        echo json_encode(["success" => false, "message" => "Datos inválidos"]);
        return;
    }

    $this->evento->id = $id;
    $this->evento->nombre = $data->nombre ?? $data->titulo;
    $this->evento->descripcion = $data->descripcion ?? '';
    $this->evento->fecha_inicio = $data->fecha_inicio;
    $this->evento->fecha_fin = $data->fecha_fin;
    $this->evento->ubicacion = $data->ubicacion ?? '';
    $this->evento->configuracion = $data->configuracion ?? null;

    if ($this->evento->actualizar()) {
        echo json_encode(["success" => true, "message" => "Evento actualizado"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
}
}
?>