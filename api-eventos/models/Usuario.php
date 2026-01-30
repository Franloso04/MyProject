<?php
class Usuario {
    private $conn;
    private $table = "usuarios";

    public $id;
    public $organizacion_id;

    public $nombre_completo;
    public $email;
    public $hash_contrasena; 
    public $rol;

    public $fecha_creacion;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function leer() {
        // Ojo: Nunca devuelvas el password en el listado
        $query = "SELECT id, nombre_completo, email, rol, fecha_creacion FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function login($email, $password) {
        $query = "SELECT id, nombre, password, rol FROM " . $this->table . " WHERE email = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            // Verificar hash (asumiendo que usas password_hash al crear)
            if(password_verify($password, $row['password'])) {
                unset($row['password']);
                return $row;
            }
        }
        return false;
    }
}
?>