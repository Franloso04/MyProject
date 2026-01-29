<?php
// models/Asistente.php

class Asistente {
    private $conn;
    private $table_name = "asistentes";

    // Propiedades (Columnas de la BD)
    public $id;
    public $id_evento;
    public $id_categoria;
    public $id_registro;
    public $token_qr;
    public $nombre;
    public $apellidos;
    public $email;
    public $empresa;
    public $cargo;
    public $campos_personalizados; // JSON
    public $estado;
    public $fecha_creacion;

    // Propiedades auxiliares para lectura (Joins)
    public $nombre_evento;
    public $nombre_categoria;

    public function __construct($db) {
        $this->conn = $db;
    }

    // --- LEER TODOS (GET) ---
    public function leer() {
        // Hacemos JOIN para traer nombres útiles en lugar de solo IDs
        $query = "SELECT 
                    a.*, 
                    e.nombre as nombre_evento, 
                    c.nombre as nombre_categoria
                  FROM " . $this->table_name . " a
                  LEFT JOIN eventos e ON a.id_evento = e.id
                  LEFT JOIN categorias_asistentes c ON a.id_categoria = c.id
                  ORDER BY a.fecha_creacion DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // --- LEER UNO POR ID (GET) ---
    public function leerUno() {
        $query = "SELECT 
                    a.*, 
                    e.nombre as nombre_evento, 
                    c.nombre as nombre_categoria
                  FROM " . $this->table_name . " a
                  LEFT JOIN eventos e ON a.id_evento = e.id
                  LEFT JOIN categorias_asistentes c ON a.id_categoria = c.id
                  WHERE a.id = ?
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            // Mapeamos los datos al objeto
            $this->id_evento = $row['id_evento'];
            $this->id_categoria = $row['id_categoria'];
            $this->id_registro = $row['id_registro'];
            $this->token_qr = $row['token_qr'];
            $this->nombre = $row['nombre'];
            $this->apellidos = $row['apellidos'];
            $this->email = $row['email'];
            $this->empresa = $row['empresa'];
            $this->cargo = $row['cargo'];
            $this->campos_personalizados = $row['campos_personalizados'];
            $this->estado = $row['estado'];
            $this->fecha_creacion = $row['fecha_creacion'];
            // Auxiliares
            $this->nombre_evento = $row['nombre_evento'];
            $this->nombre_categoria = $row['nombre_categoria'];
            return true;
        }
        return false;
    }

    // --- CREAR (POST) ---
    public function crear() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    id_evento = :id_evento,
                    id_categoria = :id_categoria,
                    id_registro = :id_registro,
                    token_qr = :token_qr,
                    nombre = :nombre,
                    apellidos = :apellidos,
                    email = :email,
                    empresa = :empresa,
                    cargo = :cargo,
                    campos_personalizados = :campos_personalizados,
                    estado = :estado";

        $stmt = $this->conn->prepare($query);

        // Limpieza básica (Sanitize)
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->apellidos = htmlspecialchars(strip_tags($this->apellidos));
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Binding de parámetros
        $stmt->bindParam(":id_evento", $this->id_evento);
        $stmt->bindParam(":id_categoria", $this->id_categoria);
        $stmt->bindParam(":id_registro", $this->id_registro);
        $stmt->bindParam(":token_qr", $this->token_qr);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellidos", $this->apellidos);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":empresa", $this->empresa);
        $stmt->bindParam(":cargo", $this->cargo);
        $stmt->bindParam(":campos_personalizados", $this->campos_personalizados);
        $stmt->bindParam(":estado", $this->estado);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // --- ACTUALIZAR (PUT) ---
    public function actualizar() {
        $query = "UPDATE " . $this->table_name . "
                  SET
                    id_categoria = :id_categoria,
                    nombre = :nombre,
                    apellidos = :apellidos,
                    email = :email,
                    empresa = :empresa,
                    cargo = :cargo,
                    campos_personalizados = :campos_personalizados,
                    estado = :estado
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Binding
        $stmt->bindParam(":id_categoria", $this->id_categoria);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellidos", $this->apellidos);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":empresa", $this->empresa);
        $stmt->bindParam(":cargo", $this->cargo);
        $stmt->bindParam(":campos_personalizados", $this->campos_personalizados);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // --- ELIMINAR (DELETE) ---
    public function eliminar() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // --- HELPER: VERIFICAR DUPLICADOS ---
    public function existeEmail($email, $id_evento) {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE email = ? AND id_evento = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->bindParam(2, $id_evento);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
}
?>