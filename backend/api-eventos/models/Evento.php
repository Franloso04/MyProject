<?php
class Evento {
    private $conn;
    private $table_name = "eventos";

    public $id;
    public $nombre; 
    public $titulo; 
    public $descripcion;
    public $fecha_inicio;
    public $fecha_fin;
    public $id_organizacion;
    public $id_ubicacion;
    public $estado;
    public $config_marca; // Columna correcta

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leer() {
        // Query básica, el JOIN se hace a veces en el controlador o aquí
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY fecha_inicio DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function crear() {
        if (empty($this->nombre) && !empty($this->titulo)) $this->nombre = $this->titulo;

        // SQL LIMPIO
        $query = "INSERT INTO " . $this->table_name . " 
                  SET nombre=:nombre, 
                      descripcion=:descripcion, 
                      fecha_inicio=:fecha_inicio, 
                      fecha_fin=:fecha_fin, 
                      id_organizacion=:id_organizacion, 
                      id_ubicacion=:id_ubicacion, 
                      estado=:estado,
                      config_marca=:config_marca";

        $stmt = $this->conn->prepare($query);

        // Limpieza y bind
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->id_ubicacion = !empty($this->id_ubicacion) ? $this->id_ubicacion : null;

        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":fecha_inicio", $this->fecha_inicio);
        $stmt->bindParam(":fecha_fin", $this->fecha_fin);
        $stmt->bindParam(":id_organizacion", $this->id_organizacion);
        $stmt->bindParam(":id_ubicacion", $this->id_ubicacion);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":config_marca", $this->config_marca);

        if ($stmt->execute()) return true;
        
        error_log("Error BD Crear: " . print_r($stmt->errorInfo(), true));
        return false;
    }

    public function actualizar() {
        if (empty($this->nombre) && !empty($this->titulo)) {
            $this->nombre = $this->titulo;
        }

        $query = "UPDATE " . $this->table_name . " 
                  SET nombre=:nombre, 
                      descripcion=:descripcion, 
                      fecha_inicio=:fecha_inicio,  
                      fecha_fin=:fecha_fin, 
                      id_ubicacion=:id_ubicacion, 
                      config_marca=:config_marca
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Limpieza
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->id_ubicacion = !empty($this->id_ubicacion) ? htmlspecialchars(strip_tags($this->id_ubicacion)) : null;

        // Bindings (Nombres exactos del SQL)
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":fecha_inicio", $this->fecha_inicio); // Antes era :inicio
        $stmt->bindParam(":fecha_fin", $this->fecha_fin);       // Antes era :fin
        $stmt->bindParam(":id_ubicacion", $this->id_ubicacion);
        $stmt->bindParam(":config_marca", $this->config_marca); 
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) return true;
        
        error_log("Error Update Evento: " . print_r($stmt->errorInfo(), true));
        return false;
    }

    public function borrar() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        if ($stmt->execute()) return true;
        return false;
    }
}
?>