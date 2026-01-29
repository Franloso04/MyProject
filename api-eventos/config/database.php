<?php
// config/database.php

class Database {
    private $host = "154.53.132.197";
    private $db_name = "eventos_app"; // El nombre de tu BD
    private $username = "adminMarobe";
    private $password = "*pk7R2a57";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            // Configuración de seguridad: Lanzar excepciones en caso de error
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Modo de fetch por defecto: Array asociativo
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
            exit();
        }

        return $this->conn;
    }
}
?>