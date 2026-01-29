<?php
// controllers/EventoController.php
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

    // GET /eventos
    public function index() {
        $stmt = $this->evento->leer();
        $num = $stmt->rowCount();

        if($num > 0) {
            $eventos_arr = array();
            $eventos_arr["data"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $evento_item = array(
                    "id" => $row['id'],
                    "organizacion" => $row['nombre_organizacion'],
                    "nombre" => $row['nombre'],
                    "descripcion" => $row['descripcion'],
                    "fecha_inicio" => $row['fecha_inicio'],
                    "fecha_fin" => $row['fecha_fin'],
                    "estado" => $row['estado']
                );
                array_push($eventos_arr["data"], $evento_item);
            }
            http_response_code(200);
            echo json_encode($eventos_arr);
        } else {
            http_response_code(200);
            echo json_encode(array("data" => []));
        }
    }

    // GET /eventos/{id}
    public function show($id) {
        $query = "SELECT e.*, o.nombre as nombre_organizacion 
                  FROM eventos e
                  LEFT JOIN organizaciones o ON e.id_organizacion = o.id
                  WHERE e.id = ?
                  LIMIT 0,1";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            http_response_code(200);
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Evento no encontrado."));
        }
    }

    // POST /eventos
    public function store() {
        $data = json_decode(file_get_contents("php://input"));

        if(
            !empty($data->id_organizacion) &&
            !empty($data->nombre) &&
            !empty($data->fecha_inicio) &&
            !empty($data->fecha_fin)
        ) {
            $this->evento->id_organizacion = $data->id_organizacion;
            $this->evento->nombre = $data->nombre;
            $this->evento->descripcion = $data->descripcion ?? null;
            $this->evento->fecha_inicio = $data->fecha_inicio;
            $this->evento->fecha_fin = $data->fecha_fin;
            $this->evento->estado = $data->estado ?? 'BORRADOR';

            if($this->evento->crear()) {
                http_response_code(201);
                echo json_encode(array("message" => "Evento creado exitosamente."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "No se pudo crear el evento."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Datos incompletos."));
        }
    }
}
?>