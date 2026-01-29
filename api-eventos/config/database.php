<?php
class Database {
    private $host = "localhost";  // ← CAMBIAR a localhost
    private $db_name = "eventos_app";
    private $username = "root";   // ← Usuario por defecto en LAMP
    private $password = "";       // ← Sin contraseña por defecto
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo json_encode(["error" => "Error de conexión: " . $exception->getMessage()]);
            exit();
        }
        return $this->conn;
    }
}
?>