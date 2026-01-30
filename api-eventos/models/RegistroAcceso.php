<?php
class RegistroAcceso {
    private $conn;
    private $table = "registros_acceso";

    public $id;
    public $id_asistente;
    public $id_punto_acceso;
    public $id_escaneado_por_usuario; 
    public $es_valido;
    public $fecha_escaneo;
    public $motivo_rechazo;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leer() {
        
        $query = "SELECT r.*, a.nombre as nombre_asistente, a.apellidos as apellidos_asistente, p.nombre as nombre_punto 
                  FROM " . $this->table . " r
                  LEFT JOIN asistentes a ON r.id_asistente = a.id
                  LEFT JOIN puntos_acceso p ON r.id_punto_acceso = p.id
                  ORDER BY r.fecha_escaneo DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function crear() {
       
        $query = "INSERT INTO " . $this->table . " 
                  SET id_asistente=:id_asistente, 
                      id_punto_acceso=:id_punto_acceso, 
                      id_escaneado_por_usuario=:id_escaneado, 
                      es_valido=:es_valido, 
                      motivo_rechazo=:motivo_rechazo,
                      fecha_escaneo=NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":id_asistente", $this->id_asistente);
        $stmt->bindParam(":id_punto_acceso", $this->id_punto_acceso);
        $stmt->bindParam(":id_escaneado", $this->id_escaneado_por_usuario);
        $stmt->bindParam(":es_valido", $this->es_valido);
        $stmt->bindParam(":motivo_rechazo", $this->motivo_rechazo);

        return $stmt->execute();
    }
}
?>