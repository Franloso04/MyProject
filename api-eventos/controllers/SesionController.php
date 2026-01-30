<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/Sesion.php';

class SesionController {
    private $db;
    private $sesion;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->sesion = new Sesion($this->db);
    }

    public function index() {
        // Obtenemos el ID del evento de la URL (?event_id=1)
        $event_id = isset($_GET['event_id']) ? $_GET['event_id'] : null;

        if (!$event_id) {
            http_response_code(400);
            echo json_encode(["message" => "Falta el parametro event_id"]);
            return;
        }

        $stmt = $this->sesion->leerPorEvento($event_id);
        $items = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // El frontend espera esta estructura exacta
            array_push($items, $row);
        }

        http_response_code(200);
        echo json_encode($items); // React espera un array directo aquí, no {data: []} en Agenda.jsx
    }
    
    public function store() {
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->id_evento) && !empty($data->titulo) && !empty($data->hora_inicio)) {
        $this->sesion->id_evento = $data->id_evento;
        $this->sesion->titulo = $data->titulo;
        $this->sesion->descripcion = $data->descripcion ?? '';
        $this->sesion->hora_inicio = $data->hora_inicio;
        $this->sesion->hora_fin = $data->hora_fin ?? null;
        $this->sesion->id_ubicacion = $data->id_ubicacion ?? null;
        $this->sesion->estado = $data->estado ?? 'DRAFT';

        if($this->sesion->crear()) {
            http_response_code(201);
            echo json_encode(["message" => "Sesión creada exitosamente."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al crear la sesión."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos."]);
    }
}
}
?>