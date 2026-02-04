<?php

class Usuario {
    private $conn;
    private $table = "usuarios";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leer() {
        $query = "SELECT id, organizacion_id, nombre_completo, email, rol, fecha_creacion 
                  FROM " . $this->table;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function login($email, $password) {

        $query = "SELECT id, organizacion_id, nombre_completo, email, hash_contrasena, rol 
                  FROM " . $this->table . " 
                  WHERE email = ? 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            return false;
        }

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica hash con password_verify
        if (!password_verify($password, $row["hash_contrasena"])) {
            return false;
        }

        // No devolver hash
        unset($row["hash_contrasena"]);

        return $row;
    }
}
?>
