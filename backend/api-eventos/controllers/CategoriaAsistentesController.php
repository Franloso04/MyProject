<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/CategoriaAsistente.php';

class CategoriaAsistenteController {
    private $db;
    private $categoria;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->categoria = new CategoriaAsistente($this->db);
    }

    public function index() {
        $stmt = $this->categoria->leer();
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }
        echo json_encode(["data" => $items]);
    }
}
?>