<?php

class Evento {
    private $conn;
    private $table = "eventos";

    public $id;
    public $organizacion_id;
    public $titulo;
    public $descripcion;
    public $fecha_inicio;
    public $fecha_fin;
    public $estado;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leerPorOrganizacion($org_id) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE organizacion_id = ?
                  ORDER BY fecha_inicio DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $org_id);
        $stmt->execute();
        return $stmt;
    }

    public function leerUno($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        return $stmt;
    }

    public function crear() {
        $query = "INSERT INTO " . $this->table . " 
            (organizacion_id, titulo, descripcion, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            $this->organizacion_id,
            $this->titulo,
            $this->descripcion,
            $this->fecha_inicio,
            $this->fecha_fin,
            $this->estado
        ]);
    }
}
?>
