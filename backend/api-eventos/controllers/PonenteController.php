<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/Ponente.php';

class PonenteController {
    private $db;
    private $ponente;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->ponente = new Ponente($this->db);
    }

    public function index() {
        $stmt = $this->ponente->leer();
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }
        echo json_encode(["data" => $items]);
    }
}
?>