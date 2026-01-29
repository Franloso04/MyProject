<?php
// index.php

// 1. CABECERAS CORS (Para que React no de error)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Si es una petición OPTIONS (pre-flight de React), terminamos aquí
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. ROUTING SIMPLE
// Obtener la URL solicitada. Ej: /api-eventos/eventos
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Limpiar la URL para quedarnos con la ruta relativa
// Cambia '/api-eventos' por el nombre de tu carpeta real
$base_path = '/api-eventos'; 
$route = str_replace($base_path, '', $request_uri);

// 3. DESPACHADOR (Switch)
switch ($route) {
    case '/eventos':
        include_once 'controllers/EventoController.php';
        $controller = new EventoController();
        
        if ($request_method == 'GET') {
            $controller->index();
        } elseif ($request_method == 'POST') {
            $controller->store();
        } else {
            http_response_code(405); // Method Not Allowed
            echo json_encode(["message" => "Método no permitido"]);
        }
        break;

    // Aquí añadirías más casos:
    // case '/asistentes':
    //    ...
    
    default:
        http_response_code(404);
        echo json_encode(["message" => "Ruta no encontrada: " . $route]);
        break;
}
?>