<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/PuntoAcceso.php';

class PuntoAccesoController {
    private $db;
    private $punto;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->punto = new PuntoAcceso($this->db);
    }

    public function index() {
        $stmt = $this->punto->leer();
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }
        echo json_encode(["data" => $items]);
    }
}
?>