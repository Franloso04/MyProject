<?php
// controllers/AsistenteController.php
include_once 'config/database.php';
include_once 'models/Asistente.php';

class AsistenteController {
    private $db;
    private $asistente;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->asistente = new Asistente($this->db);
    }

    // GET /api-eventos/asistentes
    public function index() {
        $stmt = $this->asistente->leer();
        $num = $stmt->rowCount();

        if($num > 0) {
            $asistentes_arr = array();
            $asistentes_arr["data"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Decodificamos el JSON de campos personalizados para que el Frontend lo lea bien
                $row['campos_personalizados'] = json_decode($row['campos_personalizados']);
                array_push($asistentes_arr["data"], $row);
            }
            http_response_code(200);
            echo json_encode($asistentes_arr);
        } else {
            http_response_code(200); // 200 OK pero vacío es mejor que 404 para listas
            echo json_encode(array("data" => []));
        }
    }

    // GET /api-eventos/asistentes/{id}
    public function show($id) {
        $this->asistente->id = $id;

        if($this->asistente->leerUno()) {
            $asistente_item = array(
                "id" => $this->asistente->id,
                "id_evento" => $this->asistente->id_evento,
                "nombre_evento" => $this->asistente->nombre_evento,
                "id_categoria" => $this->asistente->id_categoria,
                "nombre_categoria" => $this->asistente->nombre_categoria,
                "id_registro" => $this->asistente->id_registro,
                "token_qr" => $this->asistente->token_qr,
                "nombre" => $this->asistente->nombre,
                "apellidos" => $this->asistente->apellidos,
                "email" => $this->asistente->email,
                "empresa" => $this->asistente->empresa,
                "cargo" => $this->asistente->cargo,
                "campos_personalizados" => json_decode($this->asistente->campos_personalizados),
                "estado" => $this->asistente->estado,
                "fecha_creacion" => $this->asistente->fecha_creacion
            );
            http_response_code(200);
            echo json_encode($asistente_item);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Asistente no encontrado."));
        }
    }

    // POST /api-eventos/asistentes
    public function store() {
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos obligatorios
        if(
            !empty($data->id_evento) &&
            !empty($data->id_categoria) &&
            !empty($data->nombre) &&
            !empty($data->apellidos) &&
            !empty($data->email)
        ) {
            // 1. Verificar duplicados (Email único por evento)
            if ($this->asistente->existeEmail($data->email, $data->id_evento)) {
                http_response_code(409); // Conflict
                echo json_encode(array("message" => "Este email ya está registrado en este evento."));
                return;
            }

            // 2. Generar datos automáticos
            $this->asistente->id_evento = $data->id_evento;
            $this->asistente->id_categoria = $data->id_categoria;
            $this->asistente->nombre = $data->nombre;
            $this->asistente->apellidos = $data->apellidos;
            $this->asistente->email = $data->email;
            $this->asistente->empresa = $data->empresa ?? null;
            $this->asistente->cargo = $data->cargo ?? null;
            $this->asistente->estado = $data->estado ?? 'CONFIRMADO';
            
            // Manejar campos JSON
            $this->asistente->campos_personalizados = isset($data->campos_personalizados) 
                ? json_encode($data->campos_personalizados) 
                : null;

            // GENERACIÓN DE ID Y TOKEN (Lógica Core)
            // Generar UUID V4 seguro para el QR
            $this->asistente->token_qr = $this->generateUuid();
            // Generar ID legible: EV-{EventID}-{Random} (Ej: EV-1-A8F2)
            $this->asistente->id_registro = 'EV-' . $data->id_evento . '-' . strtoupper(substr(uniqid(), -4));

            // 3. Guardar en BD
            if($this->asistente->crear()) {
                http_response_code(201);
                echo json_encode(array(
                    "message" => "Asistente registrado exitosamente.",
                    "id_registro" => $this->asistente->id_registro,
                    "qr_token" => $this->asistente->token_qr
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "No se pudo registrar al asistente."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Datos incompletos. Faltan campos obligatorios."));
        }
    }

    // PUT /api-eventos/asistentes/{id}
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));
        $this->asistente->id = $id;

        // Validamos que el asistente exista antes de actualizar
        if (!$this->asistente->leerUno()) {
            http_response_code(404);
            echo json_encode(array("message" => "Asistente no encontrado."));
            return;
        }

        // Asignamos valores nuevos o mantenemos los viejos si no vienen en el JSON
        $this->asistente->id_categoria = $data->id_categoria ?? $this->asistente->id_categoria;
        $this->asistente->nombre = $data->nombre ?? $this->asistente->nombre;
        $this->asistente->apellidos = $data->apellidos ?? $this->asistente->apellidos;
        $this->asistente->email = $data->email ?? $this->asistente->email;
        $this->asistente->empresa = $data->empresa ?? $this->asistente->empresa;
        $this->asistente->cargo = $data->cargo ?? $this->asistente->cargo;
        $this->asistente->estado = $data->estado ?? $this->asistente->estado;
        
        if (isset($data->campos_personalizados)) {
            $this->asistente->campos_personalizados = json_encode($data->campos_personalizados);
        }

        if($this->asistente->actualizar()) {
            http_response_code(200);
            echo json_encode(array("message" => "Asistente actualizado."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "No se pudo actualizar."));
        }
    }

    // DELETE /api-eventos/asistentes/{id}
    public function delete($id) {
        $this->asistente->id = $id;

        if($this->asistente->eliminar()) {
            http_response_code(200);
            echo json_encode(array("message" => "Asistente eliminado."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "No se pudo eliminar el asistente."));
        }
    }

    /**
     * Genera un UUID v4 seguro nativo en PHP
     * Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     */
    private function generateUuid() {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
?>