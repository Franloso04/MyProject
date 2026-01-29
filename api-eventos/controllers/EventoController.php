<?php
// controllers/EventoController.php
include_once 'config/database.php';
include_once 'models/Evento.php';

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

            while ($row = $stmt->fetch()) {
                // Extraer fila a variables
                extract($row);

                $evento_item = array(
                    "id" => $id,
                    "organizacion" => $nombre_organizacion, // Del JOIN
                    "nombre" => $nombre,
                    "descripcion" => $descripcion,
                    "fecha_inicio" => $fecha_inicio,
                    "fecha_fin" => $fecha_fin,
                    "estado" => $estado
                );

                array_push($eventos_arr["data"], $evento_item);
            }
            // Respuesta JSON 200 OK
            http_response_code(200);
            echo json_encode($eventos_arr);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "No se encontraron eventos."));
        }
    }

    // POST /eventos
    public function store() {
        // Obtener datos del cuerpo JSON (React envía JSON, no form-data)
        $data = json_decode(file_get_contents("php://input"));

        if(
            !empty($data->id_organizacion) &&
            !empty($data->nombre) &&
            !empty($data->fecha_inicio) &&
            !empty($data->fecha_fin)
        ) {
            // Asignar valores al modelo
            $this->evento->id_organizacion = $data->id_organizacion;
            $this->evento->nombre = $data->nombre;
            $this->evento->descripcion = $data->descripcion ?? null; // Null coalescing
            $this->evento->fecha_inicio = $data->fecha_inicio;
            $this->evento->fecha_fin = $data->fecha_fin;
            $this->evento->estado = $data->estado ?? 'BORRADOR';

            if($this->evento->crear()) {
                http_response_code(201); // 201 Created
                echo json_encode(array("message" => "Evento creado exitosamente."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "No se pudo crear el evento."));
            }
        } else {
            http_response_code(400); // 400 Bad Request
            echo json_encode(array("message" => "Datos incompletos."));
        }
    }
}
?>