<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/SesionPonente.php';

class SesionPonenteController {
    private $db;
    private $relacion;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->relacion = new SesionPonente($this->db);
    }

    public function asignar() {
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id_sesion) && !empty($data->id_ponente)) {
            $this->relacion->id_sesion = $data->id_sesion;
            $this->relacion->id_ponente = $data->id_ponente;
            
            if($this->relacion->asignar()) {
                http_response_code(201);
                echo json_encode(["message" => "Ponente asignado a la sesion."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "No se pudo asignar."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Faltan IDs."]);
        }
    }
}
?>