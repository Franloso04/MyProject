<?php
class SesionPonente {
    private $conn;
    private $table = "sesiones_ponentes";

    public $id_sesion;
    public $id_ponente;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Asignar ponente a sesión
    public function asignar() {
        $query = "INSERT INTO " . $this->table . " SET id_sesion=:id_sesion, id_ponente=:id_ponente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_sesion", $this->id_sesion);
        $stmt->bindParam(":id_ponente", $this->id_ponente);
        return $stmt->execute();
    }

    // Eliminar asignación
    public function eliminar() {
        $query = "DELETE FROM " . $this->table . " WHERE id_sesion=:id_sesion AND id_ponente=:id_ponente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_sesion", $this->id_sesion);
        $stmt->bindParam(":id_ponente", $this->id_ponente);
        return $stmt->execute();
    }
}
?>