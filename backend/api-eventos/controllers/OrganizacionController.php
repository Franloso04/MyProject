<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/Organizacion.php';

class OrganizacionController {
    private $db;
    private $organizacion;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->organizacion = new Organizacion($this->db);
    }

    public function index() {
        $stmt = $this->organizacion->leer();
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }
        echo json_encode(["data" => $items]);
    }

    public function show($id) {
        $this->organizacion->id = $id;
        if($this->organizacion->leerUno()) {
            echo json_encode([
                "id" => $this->organizacion->id,
                "nombre" => $this->organizacion->nombre,
                "descripcion" => $this->organizacion->descripcion
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Organización no encontrada."]);
        }
    }
}
?>