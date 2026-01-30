<?php
class Ubicacion {
    private $conn;
    private $table = "ubicaciones";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY nombre ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>