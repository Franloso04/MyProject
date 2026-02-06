<?php
class Usuario {
    private $conn;
    private $table = "usuarios";

    public function __construct($db) {
        $this->conn = $db;
    }

    // LISTAR USUARIOS
    public function leer() {
        // CAMBIO: Usamos 'organizacion_id' por seguridad
        $query = "SELECT id, organizacion_id, nombre_completo, email, rol, ultimo_acceso, fecha_creacion
                  FROM " . $this->table . "
                  ORDER BY id DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        if ($stmt->rowCount() == 0) return false;
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // LOGIN (EL QUE FALLABA)
    public function login($email, $password) {
        // CAMBIO: Pedimos 'organizacion_id' en vez de 'id_organizacion'
        $query = "SELECT id, organizacion_id, nombre_completo, email, hash_contrasena, rol
                  FROM " . $this->table . "
                  WHERE email = ?
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();

        if ($stmt->rowCount() == 0) return false;

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!password_verify($password, $row['hash_contrasena'])) return false;

        $this->actualizarUltimoAcceso($row['id']);
        unset($row['hash_contrasena']);
        
        // TRUCO FINAL:
        // Si el código espera 'id_organizacion' pero la BD trae 'organizacion_id',
        // lo duplicamos aquí para que el frontend no se rompa nunca.
        $row['id_organizacion'] = $row['organizacion_id'];
        
        return $row;
    }

    public function actualizarUltimoAcceso($userId) {
        $query = "UPDATE " . $this->table . " SET ultimo_acceso = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $userId);
        return $stmt->execute();
    }
}
?>