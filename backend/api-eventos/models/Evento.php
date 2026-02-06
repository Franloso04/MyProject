<?php
class Evento {
    private $conn;
    private $table_name = "eventos";

    public $id;
    public $titulo;
    public $descripcion;
    public $fecha_inicio;
    public $fecha_fin;
    public $organizacion_id; // ESTANDARIZADO
    public $ubicacion_id;
    public $estado;

    public function __construct($db) {
        $this->conn = $db;
    }

    // LEER (GET)
    public function leer() {
        // Asegúrate de que tu tabla tenga estas columnas
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY fecha_inicio DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // CREAR (POST)
    public function crear() {
        // AQUÍ ES DONDE SUELE FALLAR: Asegúrate que los nombres (:nombre) coincidan abajo
        $query = "INSERT INTO " . $this->table_name . " 
                  SET titulo=:titulo, 
                      descripcion=:descripcion, 
                      fecha_inicio=:fecha_inicio, 
                      fecha_fin=:fecha_fin, 
                      organizacion_id=:organizacion_id, 
                      ubicacion_id=:ubicacion_id,
                      estado=:estado";

        $stmt = $this->conn->prepare($query);

        // Limpieza básica
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->organizacion_id = htmlspecialchars(strip_tags($this->organizacion_id));
        $this->estado = htmlspecialchars(strip_tags($this->estado));

        // Vinculación de parámetros
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":fecha_inicio", $this->fecha_inicio);
        $stmt->bindParam(":fecha_fin", $this->fecha_fin);
        $stmt->bindParam(":organizacion_id", $this->organizacion_id); // ¡IMPORTANTE!
        $stmt->bindParam(":ubicacion_id", $this->ubicacion_id);
        $stmt->bindParam(":estado", $this->estado);

        if ($stmt->execute()) {
            return true;
        }
        
        // Esto imprimirá el error real en el log de errores de PHP si falla
        error_log("Error BD Evento: " . print_r($stmt->errorInfo(), true));
        return false;
    }
}
?>