<?php
class Ponente {
    private $conn;
    private $table = "ponentes";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leer() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>