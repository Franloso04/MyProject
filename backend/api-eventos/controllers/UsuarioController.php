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

    public function index() {
        $stmt = $this->usuario->leer();
        $items = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }

        http_response_code(200);
        echo json_encode(["data" => $items]);
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["message" => "Faltan datos de login"]);
            return;
        }

        $user = $this->usuario->login($data->email, $data->password);

        if (!$user) {
            http_response_code(401);
            echo json_encode(["message" => "Credenciales inválidas"]);
            return;
        }

        // token simple (sin JWT, pero válido para demo)
        $token = base64_encode($user["id"] . "|" . $user["email"] . "|" . time());

        http_response_code(200);
        echo json_encode([
            "message" => "Login exitoso",
            "token" => $token,
            "user" => $user,
            "organization" => [
                "id" => $user["organizacion_id"]
            ]
        ]);
    }
}
?>
