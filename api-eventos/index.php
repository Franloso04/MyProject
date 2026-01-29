<?php
// index.php

// 1. CONFIGURACIÓN DE CABECERAS (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. PARSEO DE URL INTELIGENTE
// Esto convierte "/api-eventos/asistentes/15" en:
// $resource = "asistentes"
// $id = 15
$base_path = '/api-eventos'; 
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route_clean = str_replace($base_path, '', $request_uri);
$parts = explode('/', trim($route_clean, '/'));

$resource = $parts[0] ?? null; // Ej: 'eventos', 'asistentes'
$id = $parts[1] ?? null;       // Ej: '1', 'scan', 'login'
$request_method = $_SERVER['REQUEST_METHOD'];

// 3. SISTEMA DE ENRUTAMIENTO (SWITCH)
switch ($resource) {

    // --- MÓDULO DE AUTENTICACIÓN ---
    case 'auth':
        include_once 'controllers/AuthController.php';
        $controller = new AuthController();
        if ($id == 'login' && $request_method == 'POST') {
            $controller->login();
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Ruta de auth no válida"]);
        }
        break;

    // --- MÓDULO DE EVENTOS ---
    case 'eventos':
        include_once 'controllers/EventoController.php';
        $controller = new EventoController();
        processRequest($request_method, $controller, $id);
        break;

    // --- MÓDULO DE ASISTENTES (CRUD) ---
    case 'asistentes':
        include_once 'controllers/AsistenteController.php';
        $controller = new AsistenteController();
        processRequest($request_method, $controller, $id);
        break;

    // --- MÓDULO DE PONENTES ---
    case 'ponentes':
        include_once 'controllers/PonenteController.php';
        $controller = new PonenteController();
        processRequest($request_method, $controller, $id);
        break;

    // --- MÓDULO DE SESIONES ---
    case 'sesiones':
        include_once 'controllers/SesionController.php';
        $controller = new SesionController();
        processRequest($request_method, $controller, $id);
        break;
        
    // --- MÓDULO DE UBICACIONES ---
    case 'ubicaciones':
        include_once 'controllers/UbicacionController.php';
        $controller = new UbicacionController();
        processRequest($request_method, $controller, $id);
        break;

    // --- MÓDULO DE CHECK-IN (Acción especial) ---
    // Ruta: POST /checkin/scan
    case 'checkin':
        include_once 'controllers/CheckinController.php';
        $controller = new CheckinController();
        
        if ($id == 'scan' && $request_method == 'POST') {
            $controller->scanQr(); // Función específica para validar QR
        } elseif ($id == 'historial' && $request_method == 'GET') {
            $controller->obtenerHistorial();
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Acción de checkin no válida"]);
        }
        break;

    // --- MÓDULO DE CONFIGURACIÓN (Organización/Usuarios) ---
    case 'config':
         // Podrías agrupar organizaciones y usuarios aquí si prefieres
         // o crear cases separados como arriba.
         http_response_code(501);
         echo json_encode(["message" => "Módulo en construcción"]);
         break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Recurso no encontrado: " . $resource]);
        break;
}

// 4. FUNCIÓN HELPER PARA EVITAR REPETIR CÓDIGO
// Procesa las peticiones estándar (GET lista, GET uno, POST crear, PUT actualizar, DELETE borrar)
function processRequest($method, $controller, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Si hay ID, llamamos a show($id) (Toca crearlo en el controlador)
                if (method_exists($controller, 'show')) {
                    $controller->show($id);
                } else {
                    http_response_code(501);
                    echo json_encode(["message" => "Ver detalle no implementado"]);
                }
            } else {
                // Si no hay ID, listamos todo
                $controller->index();
            }
            break;
        case 'POST':
            $controller->store();
            break;
        case 'PUT':
            if ($id && method_exists($controller, 'update')) {
                $controller->update($id);
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Se requiere ID para actualizar"]);
            }
            break;
        case 'DELETE':
            if ($id && method_exists($controller, 'delete')) {
                $controller->delete($id);
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Se requiere ID para eliminar"]);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(["message" => "Método no permitido"]);
            break;
    }
}
?>