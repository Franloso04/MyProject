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
    public $estado; // 'PUBLISHED', 'DRAFT'

    // Auxiliares para el JOIN
    public $room_name;
    public $speaker_name;
    public $speaker_photo;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leerPorEvento($id_evento) {
        // Hacemos JOIN con Ubicaciones y Ponentes (asumiendo tabla intermedia sesiones_ponentes)
        // Nota: Ajusta los nombres de columnas si difieren en tu BD real
        $query = "SELECT 
                    s.id as session_id, s.titulo as title, s.descripcion, 
                    s.hora_inicio as start_time, s.hora_fin as end_time, 
                    s.estado as publication_status,
                    u.nombre as room_name,
                    p.nombre as speaker_name, p.foto_url as speaker_photo
                  FROM " . $this->table . " s
                  LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
                  LEFT JOIN sesiones_ponentes sp ON s.id = sp.id_sesion
                  LEFT JOIN ponentes p ON sp.id_ponente = p.id
                  WHERE s.id_evento = ?
                  ORDER BY s.hora_inicio ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id_evento);
        $stmt->execute();
        return $stmt;
    }
}
?>