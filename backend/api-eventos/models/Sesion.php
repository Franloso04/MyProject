<?php
class Sesion {
    private $conn;
    private $table = "sesiones";
    public $id;
    public $id_evento;        // FK obligatoria
    public $titulo;           // Obligatorio
    public $descripcion;      // Opcional
    public $fecha_hora_inicio; // Obligatorio (DATETIME)
    public $fecha_hora_fin;    // Obligatorio (DATETIME)
    public $id_ubicacion;     // Opcional (FK o NULL)

    public function __construct($db) {
        $this->conn = $db;
    }

    // LEER POR EVENTO (Para mostrar en la agenda)
    public function leerPorEvento($id_evento) {
        $query = "SELECT * FROM " . $this->table . " WHERE id_evento = ? ORDER BY fecha_hora_inicio ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id_evento);
        $stmt->execute();
        return $stmt;
    }

    // CREAR (Blindado contra errores)
    public function crear() {
        $query = "INSERT INTO " . $this->table . " 
                  SET id_evento=:id_evento, 
                      titulo=:titulo, 
                      descripcion=:descripcion, 
                      fecha_hora_inicio=:inicio, 
                      fecha_hora_fin=:fin,
                      id_ubicacion=:ubicacion";

        $stmt = $this->conn->prepare($query);

        // 1. Limpieza y Seguridad (Sanitización)
        $this->id_evento = htmlspecialchars(strip_tags($this->id_evento));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->fecha_hora_inicio = htmlspecialchars(strip_tags($this->fecha_hora_inicio));
        $this->fecha_hora_fin = htmlspecialchars(strip_tags($this->fecha_hora_fin));
        
        // Campos opcionales: Si vienen vacíos, asignamos NULL o cadena vacía
        $this->descripcion = !empty($this->descripcion) ? htmlspecialchars(strip_tags($this->descripcion)) : '';
        
        // TRUCO PRO: Si ubicacion_id viene vacío o es 0, lo guardamos como NULL para que SQL no falle
        $ubicacion_val = !empty($this->ubicacion_id) ? htmlspecialchars(strip_tags($this->ubicacion_id)) : null;

        // 2. Vinculación (Binding)
        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":inicio", $this->fecha_hora_inicio);
        $stmt->bindParam(":fin", $this->fecha_hora_fin);
        $stmt->bindParam(":ubicacion", $ubicacion_val);

        // 3. Ejecución y Log de Errores
        if ($stmt->execute()) {
            return true;
        }
        
        // Si falla, guarda el error exacto en el log del servidor
        error_log("Error SQL Sesion: " . print_r($stmt->errorInfo(), true));
        return false;
    }
}
?>