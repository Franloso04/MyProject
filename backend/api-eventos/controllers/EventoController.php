<?php
include_once dirname(__DIR__) . '/config/database.php';
include_once dirname(__DIR__) . '/models/Evento.php';

class EventoController {
    private $db;
    private $evento;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->evento = new Evento($this->db);
    }

    public function index() {
        header("Content-Type: application/json");
        $orgId = $_GET['id_organizacion'] ?? null;
        
        if ($orgId) {
            // Traemos el nombre de la ubicación usando JOIN
            $query = "SELECT e.*, u.nombre as nombre_ubicacion 
                      FROM eventos e 
                      LEFT JOIN ubicaciones u ON e.id_ubicacion = u.id 
                      WHERE e.id_organizacion = :orgId 
                      ORDER BY e.fecha_inicio DESC";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":orgId", $orgId);
            $stmt->execute();
        } else {
            $stmt = $this->evento->leer();
        }

        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['titulo'] = $row['nombre'];
            $row['ubicacion'] = $row['nombre_ubicacion'] ?? ''; 
            $row['configuracion'] = $row['config_marca'];
            $items[] = $row;
        }
        echo json_encode(["success" => true, "data" => $items]);
    }

    public function store() {
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || (empty($data->titulo) && empty($data->nombre))) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }

        // 1. Configurar datos del evento (SIN UBICACIÓN AÚN)
        $this->evento->nombre = $data->titulo ?? $data->nombre;
        $this->evento->descripcion = $data->descripcion ?? '';
        $this->evento->fecha_inicio = $data->fecha_inicio;
        $this->evento->fecha_fin = $data->fecha_fin;
        $this->evento->id_organizacion = $data->id_organizacion;
        $this->evento->estado = 'BORRADOR';
        $this->evento->config_marca = $data->configuracion ?? null;
        $this->evento->id_ubicacion = null; // Lo actualizaremos luego

        // 2. CREAR EL EVENTO PRIMERO
        if ($this->evento->crear()) {
            $eventoId = $this->db->lastInsertId(); // ¡Ya tenemos ID!

            // 3. SI HAY UBICACIÓN, LA CREAMOS VINCULADA AL EVENTO
            if (!empty($data->ubicacion)) {
                // Insertar en ubicaciones con el id_evento
                $queryUbi = "INSERT INTO ubicaciones (nombre, id_evento) VALUES (:nombre, :id_evento)";
                $stmtUbi = $this->db->prepare($queryUbi);
                $nombreUbi = htmlspecialchars(strip_tags($data->ubicacion));
                $stmtUbi->bindParam(":nombre", $nombreUbi);
                $stmtUbi->bindParam(":id_evento", $eventoId);
                
                if ($stmtUbi->execute()) {
                    $ubicacionId = $this->db->lastInsertId();
                    
                    // 4. ACTUALIZAR EL EVENTO CON EL ID DE LA UBICACIÓN (Vinculación inversa)
                    $queryUpdate = "UPDATE eventos SET id_ubicacion = :id_ubi WHERE id = :id_evento";
                    $stmtUpdate = $this->db->prepare($queryUpdate);
                    $stmtUpdate->bindParam(":id_ubi", $ubicacionId);
                    $stmtUpdate->bindParam(":id_evento", $eventoId);
                    $stmtUpdate->execute();
                }
            }

            echo json_encode(["success" => true, "message" => "Creado correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error SQL al crear evento"]);
        }
    }

    public function update($id) {
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents("php://input"));
        if (!$data) return;

        $this->evento->id = $id;
        $this->evento->nombre = $data->titulo ?? $data->nombre;
        $this->evento->descripcion = $data->descripcion ?? '';
        $this->evento->fecha_inicio = $data->fecha_inicio;
        $this->evento->fecha_fin = $data->fecha_fin;
        $this->evento->config_marca = $data->configuracion ?? null;
        
        // GESTIÓN DE UBICACIÓN AL ACTUALIZAR
        // Primero verificamos si el evento ya tiene ubicación para actualizarla o crear una nueva
        if (!empty($data->ubicacion)) {
            // Buscamos si existe ubicación para este evento
            $checkQuery = "SELECT id FROM ubicaciones WHERE id_evento = :id_evento LIMIT 1";
            $stmtCheck = $this->db->prepare($checkQuery);
            $stmtCheck->bindParam(":id_evento", $id);
            $stmtCheck->execute();
            
            $nombreUbi = htmlspecialchars(strip_tags($data->ubicacion));

            if ($row = $stmtCheck->fetch(PDO::FETCH_ASSOC)) {
                // Actualizar existente
                $updateUbi = "UPDATE ubicaciones SET nombre = :nombre WHERE id = :id";
                $stmtU = $this->db->prepare($updateUbi);
                $stmtU->bindParam(":nombre", $nombreUbi);
                $stmtU->bindParam(":id", $row['id']);
                $stmtU->execute();
                $this->evento->id_ubicacion = $row['id'];
            } else {
                // Crear nueva vinculada
                $insertUbi = "INSERT INTO ubicaciones (nombre, id_evento) VALUES (:nombre, :id_evento)";
                $stmtI = $this->db->prepare($insertUbi);
                $stmtI->bindParam(":nombre", $nombreUbi);
                $stmtI->bindParam(":id_evento", $id);
                $stmtI->execute();
                $this->evento->id_ubicacion = $this->db->lastInsertId();
            }
        } else {
            $this->evento->id_ubicacion = null;
        }

        if ($this->evento->actualizar()) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false]);
        }
    }

    public function delete($id) {
        header("Content-Type: application/json");
        $this->evento->id = $id;
        if ($this->evento->borrar()) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false]);
        }
    }
}
?>