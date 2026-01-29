<?php
// MOSTRAR ERRORES EN DESARROLLO
ini_set('display_errors', 1);
error_reporting(E_ALL);

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

// 2. PARSEO DE URL INTELIGENTE - CORREGIDO PARA MAMP
$base_path = '/MyProject/api-eventos';  // ← CAMBIAR ESTO
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route_clean = str_replace($base_path, '', $request_uri);
$parts = explode('/', trim($route_clean, '/'));

$resource = $parts[0] ?? null;
$id = $parts[1] ?? null;
$request_method = $_SERVER['REQUEST_METHOD'];

// DEBUG: Ver qué se recibe
error_log("Resource: " . $resource . " | ID: " . $id);

// 3. SISTEMA DE ENRUTAMIENTO
switch ($resource) {
    case 'eventos':
        include_once 'controllers/EventoController.php';
        $controller = new EventoController();
        if ($request_method == 'GET' && !$id) {
            $controller->index();
        } elseif ($request_method == 'GET' && $id) {
            $controller->show($id);
        } elseif ($request_method == 'POST') {
            $controller->store();
        }
        break;

    case 'asistentes':
        include_once 'controllers/AsistenteController.php';
        $controller = new AsistenteController();
        if ($request_method == 'GET' && !$id) {
            $controller->index();
        } elseif ($request_method == 'GET' && $id) {
            $controller->show($id);
        } elseif ($request_method == 'POST') {
            $controller->store();
        } elseif ($request_method == 'PUT' && $id) {
            $controller->update($id);
        } elseif ($request_method == 'DELETE' && $id) {
            $controller->delete($id);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Recurso no encontrado: " . $resource]);
        break;
}
?>