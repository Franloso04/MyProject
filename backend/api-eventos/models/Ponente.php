<?php
class Ponente {
    private $conn;
    private $table = "ponentes";

    public $id;
    public $id_evento; // IMPORTANTE: id_evento
    public $nombre;
    public $email;
    public $bio;
    public $foto_url;

    public function __construct($db) {
        $this->conn = $db;
    }

    // LEER POR EVENTO
    public function leerPorEvento($id_evento) {
        $query = "SELECT * FROM " . $this->table . " WHERE id_evento = ? ORDER BY nombre ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id_evento);
        $stmt->execute();
        return $stmt;
    }

    // CREAR
    public function crear() {
        $query = "INSERT INTO " . $this->table . " 
                  SET id_evento=:id_evento, nombre=:nombre, email=:email, bio=:bio, foto_url=:foto_url";

        $stmt = $this->conn->prepare($query);

        $this->id_evento = htmlspecialchars(strip_tags($this->id_evento));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->bio = htmlspecialchars(strip_tags($this->bio));
        $this->foto_url = htmlspecialchars(strip_tags($this->foto_url));

        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":bio", $this->bio);
        $stmt->bindParam(":foto_url", $this->foto_url);

        if ($stmt->execute()) return true;
        error_log("Error crear ponente: " . print_r($stmt->errorInfo(), true));
        return false;
    }
}
?>