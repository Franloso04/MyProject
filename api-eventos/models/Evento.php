<?php
// models/Evento.php

class Evento {
    private $conn;
    private $table_name = "eventos";

    // Propiedades del objeto (iguales a tus columnas)
    public $id;
    public $id_organizacion;
    public $nombre;
    public $descripcion;
    public $fecha_inicio;
    public $fecha_fin;
    public $estado;

    public function __construct($db) {
        $this->conn = $db;
    }

    // LEER TODOS
    public function leer() {
        // Query uniendo con Organizaciones para obtener el nombre
        $query = "SELECT e.*, o.nombre as nombre_organizacion 
                  FROM " . $this->table_name . " e
                  LEFT JOIN organizaciones o ON e.id_organizacion = o.id
                  ORDER BY e.fecha_creacion DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // CREAR
    public function crear() {
        // Consulta SQL con placeholders (SECURE contra SQL Injection)
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    id_organizacion = :id_organizacion,
                    nombre = :nombre,
                    descripcion = :descripcion,
                    fecha_inicio = :fecha_inicio,
                    fecha_fin = :fecha_fin,
                    estado = :estado";

        $stmt = $this->conn->prepare($query);

        // Limpieza básica
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        
        // Asignar valores (Binding)
        $stmt->bindParam(":id_organizacion", $this->id_organizacion);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":fecha_inicio", $this->fecha_inicio);
        $stmt->bindParam(":fecha_fin", $this->fecha_fin);
        $stmt->bindParam(":estado", $this->estado);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>