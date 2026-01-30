<?php
class CategoriaAsistente {
    private $conn;
    private $table = "categorias_asistentes";

    public $id;
    public $nombre;
    public $precio;
    public $permisos;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>