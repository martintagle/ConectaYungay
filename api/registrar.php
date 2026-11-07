<?php
/**
 * ConectaYungay — Registro de visitas y clics en MySQL
 *
 * Recibe un POST con JSON { "tabla": "visitas" | "clics_info", "fila": {...} }
 * desde js/business/visitService.js y lo inserta con una consulta preparada.
 * Las validaciones replican los CHECK de supabase/visitas_y_clics.sql y sus
 * migraciones.
 *
 * Respuestas: 204 guardado · 400 datos no válidos · 405 método no permitido
 * · 500 error de la base. Nunca se devuelven datos ni detalles del error.
 *
 * Credenciales: config.php fuera de public_html (ver config.example.php).
 */

declare(strict_types=1);

ini_set('display_errors', '0');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const MAX_BODY_BYTES = 4096;
const UUID_RE = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';

function responder(int $codigo): void
{
    http_response_code($codigo);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405);
}

// ─────────────────────────────────────────────
//  VALIDACIÓN
// ─────────────────────────────────────────────
function esTexto($v, int $max): bool
{
    return is_string($v) && mb_check_encoding($v, 'UTF-8') && mb_strlen($v, 'UTF-8') <= $max;
}

function esTextoOpcional($v, int $max): bool
{
    return $v === null || esTexto($v, $max);
}

function esUUID($v): bool
{
    return is_string($v) && preg_match(UUID_RE, $v) === 1;
}

/** Comprueba que la fila tenga solo las columnas permitidas (las que falten quedan en null). */
function normalizarColumnas(array $fila, array $columnas): ?array
{
    if (array_diff(array_keys($fila), $columnas)) {
        return null;
    }
    $resultado = [];
    foreach ($columnas as $c) {
        $resultado[$c] = $fila[$c] ?? null;
    }
    return $resultado;
}

function validarVisita(array $fila): ?array
{
    $f = normalizarColumnas($fila, [
        'id', 'edad', 'nacionalidad', 'comuna', 'motivo', 'origen',
        'como_nos_conociste', 'como_nos_conociste_otro',
    ]);
    if ($f === null) return null;

    $ok = esUUID($f['id'])
        && is_int($f['edad']) && $f['edad'] >= 0 && $f['edad'] <= 120
        && esTexto($f['nacionalidad'], 60)
        && esTextoOpcional($f['comuna'], 60)
        && esTexto($f['motivo'], 60)
        && ($f['origen'] === null || in_array($f['origen'], ['ruta-a', 'ruta-b', 'ruta-c', 'ruta-d'], true))
        && ($f['como_nos_conociste'] === null || in_array($f['como_nos_conociste'], ['Instagram', 'Otros'], true))
        && esTextoOpcional($f['como_nos_conociste_otro'], 60)
        && ($f['comuna'] === null || $f['nacionalidad'] === 'Chile')
        && ($f['como_nos_conociste_otro'] === null || $f['como_nos_conociste'] === 'Otros');
    if (!$ok) return null;

    $f['id'] = strtolower($f['id']);
    return $f;
}

function validarClic(array $fila): ?array
{
    $f = normalizarColumnas($fila, ['visita_id', 'punto_interes', 'accion']);
    if ($f === null) return null;

    $ok = ($f['visita_id'] === null || esUUID($f['visita_id']))
        && esTexto($f['punto_interes'], 80)
        && in_array($f['accion'], ['apertura', 'mas_info'], true);
    if (!$ok) return null;

    if ($f['visita_id'] !== null) {
        $f['visita_id'] = strtolower($f['visita_id']);
    }
    return $f;
}

// ─────────────────────────────────────────────
//  LECTURA DE LA PETICIÓN
// ─────────────────────────────────────────────
$cuerpo = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($cuerpo === false || $cuerpo === '' || strlen($cuerpo) > MAX_BODY_BYTES) {
    responder(400);
}

$datos = json_decode($cuerpo, true);
if (!is_array($datos) || !isset($datos['tabla'], $datos['fila'])
    || !is_string($datos['tabla']) || !is_array($datos['fila'])) {
    responder(400);
}

switch ($datos['tabla']) {
    case 'visitas':
        $fila = validarVisita($datos['fila']);
        break;
    case 'clics_info':
        $fila = validarClic($datos['fila']);
        break;
    default:
        responder(400);
}
if ($fila === null) {
    responder(400);
}

// Nombres de tabla y columnas salen de las listas fijas de arriba, nunca del cliente
$tabla = $datos['tabla'];
$columnas = array_keys($fila);
$sql = sprintf(
    'INSERT INTO %s (%s) VALUES (%s)',
    $tabla,
    implode(', ', $columnas),
    implode(', ', array_map(fn($c) => ':' . $c, $columnas))
);

// ─────────────────────────────────────────────
//  INSERCIÓN
// ─────────────────────────────────────────────
// Un require fallido es un error fatal que no se puede capturar: se comprueba antes
$rutaConfig = __DIR__ . '/../../config.php';
if (!is_readable($rutaConfig)) {
    error_log('registrar.php: no se encuentra config.php');
    responder(500);
}

try {
    $config = require $rutaConfig;

    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']),
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $stmt = $pdo->prepare($sql);
    foreach ($fila as $columna => $valor) {
        $tipo = is_int($valor) ? PDO::PARAM_INT : ($valor === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':' . $columna, $valor, $tipo);
    }
    $stmt->execute();
} catch (Throwable $e) {
    error_log('registrar.php: ' . $e->getMessage());
    responder(500);
}

responder(204);
