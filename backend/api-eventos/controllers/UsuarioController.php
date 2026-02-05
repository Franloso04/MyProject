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

        // CORRECCIÓN: El modelo 'leer()' devuelve un array o false, no un objeto stmt iterable
        $resultado = $this->usuario->leer();
        
        $items = [];

        if ($resultado) {
            // Si hay datos, el modelo ya devuelve el array completo (fetchAll)
            $items = $resultado;
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

        // 1. Obtener datos del body
        $data = json_decode(file_get_contents("php://input"));

        // 2. Validar que llegue el JSON correctamente y tenga campos
        if (!$data || !isset($data->email) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Faltan datos de login (email o password)"
            ]);
            return;
        }

        $email = trim($data->email);
        $password = trim($data->password);

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Los campos no pueden estar vacíos"
            ]);
            return;
        }

        // 3. Intentar Login (CORRECCIÓN: Llamar solo una vez)
        $user = $this->usuario->login($email, $password);

        if (!$user) {
            // Si devuelve false, las credenciales están mal
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Credenciales inválidas"
            ]);
            return;
        }

        // 4. Generar Token simple
        $token = base64_encode($user["id"] . "|" . $user["email"] . "|" . time());

        // 5. Responder éxito
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