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
include_once 'config/database.php';
$request_method = $_SERVER["REQUEST_METHOD"];
$base_path = '/MyProject/backend/api-eventos';  // ← CAMBIAR ESTO SI CAMBIA TU CARPETA
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
    // --- 1. EVENTOS ---
    case 'eventos':
    include_once 'controllers/EventoController.php';
    $controller = new EventoController();
    if ($request_method == 'GET' && !$id) {
        $controller->index();
    } elseif ($request_method == 'GET' && $id) {
        $controller->show($id);
    } elseif ($request_method == 'POST') {
        $controller->store();
    } elseif ($request_method == 'PUT' && $id) { // <--- AÑADIR ESTO
        $controller->update($id);
    } elseif ($request_method == 'DELETE' && $id) { // <-- NUEVO: BORRAR
            $controller->delete($id);
    }
    break;

    // --- 2. ASISTENTES ---
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

    // --- 3. ORGANIZACIONES ---
    case 'organizaciones':
        include_once 'controllers/OrganizacionController.php';
        $controller = new OrganizacionController();
        if ($request_method == 'GET' && !$id) {
            $controller->index();
        } elseif ($request_method == 'GET' && $id) {
            $controller->show($id);
        }
        break;

    // --- 4. CATEGORÍAS DE ASISTENTES ---
    case 'categorias_asistentes': // Nombre exacto BD
    case 'categorias':            // Alias corto
        include_once 'controllers/CategoriaAsistentesController.php';
        $controller = new CategoriaAsistenteController();
        if ($request_method == 'GET') {
            $controller->index();
        }
        break;

    // --- 5. UBICACIONES ---
    case 'ubicaciones':
        include_once 'controllers/UbicacionController.php';
        $controller = new UbicacionController();
        if ($request_method == 'GET') {
            $controller->index();
        }
        break;

    // --- 6. SESIONES (AGENDA) ---
    case 'sessions': // Alias Frontend
    case 'sesiones': // Nombre BD
        include_once 'controllers/SesionController.php';
        $controller = new SesionController();
        if ($request_method == 'GET') {
            $controller->index(); // Filtra por ?event_id=X
        } elseif ($request_method == 'POST') {
            $controller->store();
        } elseif ($request_method == 'PUT' && $id) $controller->update($id);
        elseif ($request_method == 'DELETE' && $id) $controller->delete($id);
        break;

    // --- 7. PONENTES ---
    case 'ponentes':
        include_once 'controllers/PonenteController.php';
        $controller = new PonenteController();
        if ($request_method == 'GET') {
            $controller->index();
     } elseif ($request_method == 'POST') { // AÑADIR ESTA CONDICIÓN
           $controller->store();
     }
         break;

    // --- 8. DASHBOARD (ESTADÍSTICAS) ---
    case 'dashboard':
        include_once 'controllers/DashboardController.php';
        $controller = new DashboardController();
        if ($id == 'stats') {
            $controller->getStats();
        }
        break;

    // --- 9. USUARIOS (LOGIN/ADMIN) ---
    case 'usuarios':
        include_once 'controllers/UsuarioController.php';
        $controller = new UsuarioController();
        if ($request_method == 'GET') {
            $controller->index();
        } elseif ($request_method == 'POST' && $id == 'login') {
            $controller->login();
        } elseif($request_method == 'POST' && $id == 'register') {
            $controller->register() ;
    ;
        }
        break;

    // --- 10. PUNTOS DE ACCESO ---
    case 'puntos_acceso':
        include_once 'controllers/PuntoAccesoController.php';
        $controller = new PuntoAccesoController();
        if ($request_method == 'GET') {
            $controller->index();
        }
        break;

    // --- 11. REGISTROS DE ACCESO (SCAN LOGS) ---
    case 'registros_acceso':
        include_once 'controllers/RegistroAccesoController.php';
        $controller = new RegistroAccesoController();
        if ($request_method == 'POST' && $id == 'scan') {
            $controller->scan();
        } elseif ($request_method == 'GET') {
            $controller->index();
        } elseif ($request_method == 'POST') {
            $controller->store();
        }
        break;

    // --- 12. RELACIÓN SESIONES-PONENTES ---
    case 'sesiones_ponentes':
        include_once 'controllers/SesionPonenteController.php';
        $controller = new SesionPonenteController();
        if ($request_method == 'POST') {
            $controller->asignar();
        } elseif ($request_method == 'POST') $controller->store();
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Recurso no encontrado: " . $resource]);
        break;
}
?>   



