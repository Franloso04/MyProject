<?php
$root = dirname(dirname(__FILE__));
include_once $root . '/config/database.php';
include_once $root . '/models/RegistroAcceso.php';

class RegistroAccesoController {
    private $db;
    private $registro;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->registro = new RegistroAcceso($this->db);
    }

    public function index() {
        $stmt = $this->registro->leer();
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($items, $row);
        }
        echo json_encode(["data" => $items]);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id_asistente) && !empty($data->id_punto_acceso)) {
            $this->registro->id_asistente = $data->id_asistente;
            $this->registro->id_punto_acceso = $data->id_punto_acceso;
            
            // Asignamos valores por defecto o los que vengan del JSON
            $this->registro->id_escaneado_por_usuario = $data->id_usuario ?? 1; // ID de admin por defecto si no se envía
            $this->registro->es_valido = isset($data->es_valido) ? $data->es_valido : 1; 
            $this->registro->motivo_rechazo = $data->motivo_rechazo ?? null;

            if($this->registro->crear()) {
                http_response_code(201);
                echo json_encode(["message" => "Acceso registrado correctamente."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al registrar acceso."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos."]);
        }
    }
    public function scan() {
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->token_qr) || empty($data->id_evento)) {
        http_response_code(400);
        echo json_encode(["message" => "Falta el token QR o ID de evento."]);
        return;
    }

    // 1. Instanciar Asistente para buscarlo
    include_once dirname(dirname(__FILE__)) . '/models/Asistente.php';
    $asistenteModel = new Asistente($this->db);

    if(!$asistenteModel->buscarPorToken($data->token_qr, $data->id_evento)) {
        http_response_code(404);
        echo json_encode(["message" => "QR inválido o no pertenece a este evento."]);
        return;
    }

    // 2. Regla de Negocio: ¿Ya hizo check-in?
    if($asistenteModel->estado === 'CHECKED_IN') {
        http_response_code(409); // Conflict
        echo json_encode([
            "message" => "El asistente ya ha ingresado previamente.",
            "asistente" => [
                "nombre" => $asistenteModel->nombre,
                "apellidos" => $asistenteModel->apellidos
            ]
        ]);
        return;
    }

    // 3. Registrar el acceso en la tabla registros_acceso
    $this->registro->id_asistente = $asistenteModel->id;
    $this->registro->id_punto_acceso = 1; // Default
    $this->registro->id_escaneado_por_usuario = 1; // Default admin
    $this->registro->es_valido = 1;
    $this->registro->crear();

    // 4. Actualizar estado del asistente a CHECKED_IN
    // Nota: Deberías agregar un método rapido en Asistente.php para actualizar solo estado, 
    // pero por ahora podemos usar una query directa o actualizar el objeto.
    $queryUpdate = "UPDATE asistentes SET estado = 'CHECKED_IN' WHERE id = :id";
    $stmtUpdate = $this->db->prepare($queryUpdate);
    $stmtUpdate->execute([':id' => $asistenteModel->id]);

    http_response_code(200);
    echo json_encode([
        "message" => "Acceso permitido.",
        "asistente" => [
            "id" => $asistenteModel->id,
            "nombre" => $asistenteModel->nombre,
            "apellidos" => $asistenteModel->apellidos
        ]
    ]);
    }
}
?>