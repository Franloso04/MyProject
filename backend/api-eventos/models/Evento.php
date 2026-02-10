<?php
class Evento {
    private $conn;
    private $table_name = "eventos";

    public $id;
    public $titulo; 
    public $descripcion;
    public $fecha_inicio;
    public $fecha_fin;
    public $id_organizacion;
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
        // CORRECCIÓN FINAL:
        // 1. Usamos 'nombre' en vez de 'titulo' (arreglado antes)
        // 2. Quitamos 'ubicacion_id' del SQL porque tu tabla no la tiene
        $query = "INSERT INTO " . $this->table_name . " 
                  SET nombre=:titulo, 
                      descripcion=:descripcion, 
                      fecha_inicio=:fecha_inicio, 
                      fecha_fin=:fecha_fin, 
                      id_organizacion=:id_organizacion, 
                      /* ubicacion_id=:ubicacion_id, <-- ELIMINADO PARA EVITAR EL ERROR */
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
        $stmt->bindParam(":id_organizacion", $this->id_organizacion);
        // $stmt->bindParam(":ubicacion_id", $this->ubicacion_id); <-- COMENTADO TAMBIÉN
        $stmt->bindParam(":estado", $this->estado);

        if ($stmt->execute()) {
            return true;
        }
        
        error_log("Error BD Evento: " . print_r($stmt->errorInfo(), true));
        return false;
    }
    public function actualizar() {
    $query = "UPDATE " . $this->table . " 
              SET nombre=:nombre, descripcion=:descripcion, fecha_inicio=:inicio, 
                  fecha_fin=:fin, ubicacion=:ubicacion, configuracion=:config
              WHERE id=:id";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(":nombre", $this->nombre);
    $stmt->bindParam(":descripcion", $this->descripcion);
    $stmt->bindParam(":inicio", $this->fecha_inicio);
    $stmt->bindParam(":fin", $this->fecha_fin);
    $stmt->bindParam(":ubicacion", $this->ubicacion);
    $stmt->bindParam(":config", $this->configuracion); 
    $stmt->bindParam(":id", $this->id);

    return $stmt->execute();
}
}
?>