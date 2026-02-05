<?php

$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/Evento.php';

class EventoController {
    private $db;
    private $evento;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->evento = new Evento($this->db);
    }

    public function index() {
        $org_id = isset($_GET['organizacion_id']) ? $_GET['organizacion_id'] : null;

        if (!$org_id) {
            http_response_code(400);
            echo json_encode(["message" => "Falta organizacion_id"]);
            return;
        }

        $stmt = $this->evento->leerPorOrganizacion($org_id);

        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }

        http_response_code(200);
        echo json_encode($items);
    }

    public function show($id) {
        $stmt = $this->evento->leerUno($id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(["message" => "Evento no encontrado"]);
            return;
        }

        http_response_code(200);
        echo json_encode($row);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->organizacion_id) || empty($data->titulo) || empty($data->fecha_inicio)) {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos"]);
            return;
        }

        $this->evento->organizacion_id = $data->organizacion_id;
        $this->evento->titulo = $data->titulo;
        $this->evento->descripcion = $data->descripcion ?? '';
        $this->evento->fecha_inicio = $data->fecha_inicio;
        $this->evento->fecha_fin = $data->fecha_fin ?? null;
        $this->evento->estado = $data->estado ?? 'DRAFT';

        if ($this->evento->crear()) {
            http_response_code(201);
            echo json_encode(["message" => "Evento creado"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error creando evento"]);
        }
    }
}
?>
