<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/RegistroAcceso.php';

class RegistroAccesoController {
    private $db;
    private $registro;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->registro = new RegistroAcceso($this->db);
    }

    public function index() {
        $stmt = $this->registro->leer();
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }
        echo json_encode(["data" => $items]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id_asistente) && !empty($data->id_punto_acceso)) {
            $this->registro->id_asistente = $data->id_asistente;
            $this->registro->id_punto_acceso = $data->id_punto_acceso;
            
            // Asignamos valores por defecto o los que vengan del JSON
            $this->registro->id_escaneado_por_usuario = $data->id_usuario ?? 1; // ID de admin por defecto si no se envía
            $this->registro->es_valido = isset($data->es_valido) ? $data->es_valido : 1; 
            $this->registro->motivo_rechazo = $data->motivo_rechazo ?? null;

            if($this->registro->crear()) {
                http_response_code(201);
                echo json_encode(["message" => "Acceso registrado correctamente."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al registrar acceso."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos."]);
        }
    }
}
?>