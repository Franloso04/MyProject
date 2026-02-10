<?php
class Sesion {
    private $conn;
    private $table = "sesiones";

    public $id;
    public $id_evento;
    public $titulo;
    public $descripcion;
    public $hora_inicio; 
    public $hora_fin;    
    public $id_ubicacion; 

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leerPorEvento($id_evento) {
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
                      id_ubicacion=:id_ubicacion";

        $stmt = $this->conn->prepare($query);

        $this->id_evento = htmlspecialchars(strip_tags($this->id_evento));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->hora_inicio = htmlspecialchars(strip_tags($this->hora_inicio));
        $this->hora_fin = htmlspecialchars(strip_tags($this->hora_fin));
        $ubicacion_val = !empty($this->id_ubicacion) ? htmlspecialchars(strip_tags($this->id_ubicacion)) : null;

        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":inicio", $this->hora_inicio);
        $stmt->bindParam(":fin", $this->hora_fin);
        $stmt->bindParam(":id_ubicacion", $ubicacion_val);

        if ($stmt->execute()) return true;
        return false;
    }
}
?>