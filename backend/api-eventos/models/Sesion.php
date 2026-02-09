<?php
// backend/api-eventos/models/Sesion.php
class Sesion {
    private $conn;
    private $table = "sesiones";

    public $id;
    public $id_evento;
    public $titulo;
    public $descripcion;
    public $fecha_hora_inicio;
    public $fecha_hora_fin;
    public $ubicacion_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leerPorEvento($id_evento) {
        $query = "SELECT * FROM " . $this->table . " WHERE id_evento = ? ORDER BY fecha_hora_inicio ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id_evento);
        $stmt->execute();
        return $stmt;
    }

    public function crear() {
        // SQL: Usamos 'titulo' e 'id_evento'
        $query = "INSERT INTO " . $this->table . " 
                  SET id_evento=:id_evento, 
                      titulo=:titulo, 
                      descripcion=:descripcion, 
                      fecha_hora_inicio=:inicio, 
                      fecha_hora_fin=:fin,
                      ubicacion_id=:ubicacion";

        $stmt = $this->conn->prepare($query);

        // Limpieza
        $this->id_evento = htmlspecialchars(strip_tags($this->id_evento));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->fecha_hora_inicio = htmlspecialchars(strip_tags($this->fecha_hora_inicio));
        $this->fecha_hora_fin = htmlspecialchars(strip_tags($this->fecha_hora_fin));
        $this->descripcion = !empty($this->descripcion) ? htmlspecialchars(strip_tags($this->descripcion)) : '';
        $ubicacion_val = !empty($this->ubicacion_id) ? htmlspecialchars(strip_tags($this->ubicacion_id)) : null;

        // Bind
        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":inicio", $this->fecha_hora_inicio);
        $stmt->bindParam(":fin", $this->fecha_hora_fin);
        $stmt->bindParam(":ubicacion", $ubicacion_val);

        if ($stmt->execute()) return true;
        
        error_log("Error crear sesion: " . print_r($stmt->errorInfo(), true));
        return false;
    }
}
?>