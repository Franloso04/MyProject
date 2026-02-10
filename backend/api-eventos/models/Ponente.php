<?php
class Ponente {
    private $conn;
    private $table = "ponentes";

    public $id;
    public $id_evento;
    public $nombre_completo; // Nombre real en BD
    public $biografia;       // Nombre real en BD
    public $foto_url;
    public $empresa;
    public $cargo;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leerPorEvento($id_evento) {
        $query = "SELECT * FROM " . $this->table . " WHERE id_evento = ? ORDER BY nombre_completo ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id_evento);
        $stmt->execute();
        return $stmt;
    }

    public function crear() {
        $query = "INSERT INTO " . $this->table . " 
                  SET id_evento=:id_evento, 
                      nombre_completo=:nombre, 
                      biografia=:bio, 
                      foto_url=:foto_url,
                      empresa=:empresa,
                      cargo=:cargo";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":nombre", $this->nombre_completo);
        $stmt->bindParam(":bio", $this->biografia);
        $stmt->bindParam(":foto_url", $this->foto_url);
        $stmt->bindParam(":empresa", $this->empresa);
        $stmt->bindParam(":cargo", $this->cargo);

        return $stmt->execute();
    }
}