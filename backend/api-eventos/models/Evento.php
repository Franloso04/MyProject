<?php
class Evento {
    private $conn;
    private $table_name = "eventos";

    public $id;
    public $titulo;
    public $descripcion;
    public $fecha_inicio;
    public $fecha_fin;
    public $id_organizacion; // CORRECCIÓN: Nombre de propiedad cambiado
    public $ubicacion_id;
    public $estado;

    public function __construct($db) {
        $this->conn = $db;
    }

    // LEER
    public function leer() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY fecha_inicio DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // CREAR
    public function crear() {
        // CORRECCIÓN: Insertamos en la columna 'id_organizacion'
        $query = "INSERT INTO " . $this->table_name . " 
                  SET titulo=:titulo, 
                      descripcion=:descripcion, 
                      fecha_inicio=:fecha_inicio, 
                      fecha_fin=:fecha_fin, 
                      id_organizacion=:id_organizacion, 
                      ubicacion_id=:ubicacion_id,
                      estado=:estado";

        $stmt = $this->conn->prepare($query);

        // Limpieza
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->id_organizacion = htmlspecialchars(strip_tags($this->id_organizacion));
        $this->estado = htmlspecialchars(strip_tags($this->estado));

        // Bind
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":fecha_inicio", $this->fecha_inicio);
        $stmt->bindParam(":fecha_fin", $this->fecha_fin);
        $stmt->bindParam(":id_organizacion", $this->id_organizacion); // CORRECCIÓN
        $stmt->bindParam(":ubicacion_id", $this->ubicacion_id);
        $stmt->bindParam(":estado", $this->estado);

        if ($stmt->execute()) {
            return true;
        }
        
        error_log("Error BD Evento: " . print_r($stmt->errorInfo(), true));
        return false;
    }
}
?>