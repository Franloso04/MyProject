<?php
class Sesion {
    private $conn;
    private $table = "sesiones";

    public $id;
    public $id_evento;
    public $titulo;
    public $descripcion;
    public $hora_inicio; // Nombre real en BD
    public $hora_fin;    // Nombre real en BD
    public $id_ubicacion; // Nombre real en BD

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leerPorEvento($id_evento) {
        // CORRECCIÓN: Usando 'hora_inicio' para el ORDER BY
        $query = "SELECT * FROM " . $this->table . " WHERE id_evento = ? ORDER BY hora_inicio ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id_evento);
        $stmt->execute();
        return $stmt;
    }

    public function crear() {
        $query = "INSERT INTO " . $this->table . " 
                  SET id_evento=:id_evento, 
                      titulo=:titulo, 
                      descripcion=:descripcion, 
                      hora_inicio=:inicio, 
                      hora_fin=:fin,
                      id_ubicacion=:ubicacion";

        $stmt = $this->conn->prepare($query);

        // Limpieza de datos
        $this->id_evento = htmlspecialchars(strip_tags($this->id_evento));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->hora_inicio = htmlspecialchars(strip_tags($this->hora_inicio));
        $this->hora_fin = htmlspecialchars(strip_tags($this->hora_fin));
        $ubicacion_val = !empty($this->id_ubicacion) ? $this->id_ubicacion : null;

        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":inicio", $this->hora_inicio);
        $stmt->bindParam(":fin", $this->hora_fin);
        $stmt->bindParam(":ubicacion", $ubicacion_val);

        if ($stmt->execute()) return true;
        
        error_log("Error crear sesion: " . print_r($stmt->errorInfo(), true));
        return false;
    }
}
?>