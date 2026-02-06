<?php
// Archivo: backend/api-eventos/test_db.php
include_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<h1>Diagnóstico de Tablas</h1>";
    
    // Ver columnas de la tabla EVENTOS
    echo "<h2>Tabla: eventos</h2>";
    $stmt = $db->prepare("DESCRIBE eventos");
    $stmt->execute();
    $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5'><tr><th>Campo</th><th>Tipo</th></tr>";
    foreach ($columnas as $col) {
        $nombre = $col['Field'];
        // Resaltamos la columna clave en ROJO
        $color = ($nombre == 'id_organizacion' || $nombre == 'organizacion_id') ? "color:red; font-weight:bold; font-size:1.2em" : "color:black";
        echo "<tr><td style='$color'>$nombre</td><td>{$col['Type']}</td></tr>";
    }
    echo "</table>";

} catch(Exception $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>