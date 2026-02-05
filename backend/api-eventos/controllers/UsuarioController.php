<?php

$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/Usuario.php';

class UsuarioController {
    private $db;
    private $usuario;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->usuario = new Usuario($this->db);
    }

    // GET /usuarios
    public function index() {
        header("Content-Type: application/json; charset=UTF-8");

        $stmt = $this->usuario->leer();
        $items = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = $row;
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => $items
        ]);
    }

    // POST /usuarios/login
    public function login() {
        header("Content-Type: application/json; charset=UTF-8");

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->email) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Faltan datos de login"
            ]);
            return;
        }

        $email = trim($data->email);
        $password = trim($data->password);

        if ($email === "" || $password === "") {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Email y password son obligatorios"
            ]);
            return;
        }

        $user = $this->usuario->login($email, $password);

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Credenciales inválidas"
            ]);
            return;
        }

        // Token simple (no JWT, pero sirve para tu proyecto)
        $token = base64_encode($user["id"] . "|" . $user["email"] . "|" . time());

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login exitoso",
            "token" => $token,
            "user" => $user
        ]);
    }
}
?>
