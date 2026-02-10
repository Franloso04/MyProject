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
    public $id_ubicacion; // Nombre real en BD (antes era ubicacion_id)

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

        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":inicio", $this->hora_inicio);
        $stmt->bindParam(":fin", $this->hora_fin);
        $stmt->bindParam(":ubicacion", $this->id_ubicacion);

         // Limpieza
        $this->id_evento = htmlspecialchars(strip_tags($this->id_evento));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->fecha_hora_inicio = htmlspecialchars(strip_tags($this->fecha_hora_inicio));
        $this->fecha_hora_fin = htmlspecialchars(strip_tags($this->fecha_hora_fin));
        $this->descripcion = !empty($this->descripcion) ? htmlspecialchars(strip_tags($this->descripcion)) : '';
        $ubicacion_val = !empty($this->ubicacion_id) ? htmlspecialchars(strip_tags($this->ubicacion_id)) : null;
        
        return $stmt->execute();

        error_log("Error crear sesion: " . print_r($stmt->errorInfo(), true));
        return false;

        
    }


       
        
    }

?>