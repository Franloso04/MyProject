<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/Ubicacion.php';

class UbicacionController {
    private $db;
    private $ubicacion;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->ubicacion = new Ubicacion($this->db);
    }

    public function index() {
        $stmt = $this->ubicacion->leer();
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }
        echo json_encode(["data" => $items]);
    }
}
?>