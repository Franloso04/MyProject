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

    // GET /sesiones
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

    // ALIAS: Si index.php llama a store(), redirigimos a create()
    public function store() {
        $this->create();
    }

    // POST /sesiones
    public function create() {
        header("Content-Type: application/json");
        
        // 1. Obtener datos
        $raw = file_get_contents("php://input");
        $data = json_decode($raw);

        // 2. Diagnóstico: Si llega vacío
        if (is_null($data)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "JSON inválido o vacío."]);
            return;
        }

        // 3. FLEXIBILIDAD DE NOMBRES (Aquí arreglamos el error 400)
        // Buscamos la fecha con varios nombres posibles
        $inicio = $data->hora_inicio ?? $data->fecha_inicio ?? $data->inicio ?? null;
        $fin = $data->hora_fin ?? $data->fecha_fin ?? $data->fin ?? null;
        $titulo = $data->titulo ?? $data->nombre ?? null;

        // 4. Validación estricta
        if (empty($titulo) || empty($data->id_evento) || empty($inicio)) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "Faltan datos obligatorios: titulo, id_evento o fecha de inicio.",
                "recibido" => $data // Te dirá qué está llegando realmente en la consola
            ]);
            return;
        }

        // 5. Asignar al modelo
        $this->sesion->titulo = $titulo;
        $this->sesion->id_evento = $data->id_evento;
        $this->sesion->descripcion = $data->descripcion ?? '';
        $this->sesion->hora_inicio = $inicio; // Usamos el valor encontrado
        $this->sesion->hora_fin = $fin ?? $inicio; // Si no hay fin, usamos inicio
        $this->sesion->ubicacion_id = $data->ubicacion_id ?? null;

        if ($this->sesion->crear()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Sesión creada correctamente."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error SQL al crear sesión."]);
        }
    }
}
?>