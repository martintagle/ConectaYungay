<?php
/**
 * ConectaYungay — Credenciales de MySQL (archivo de muestra)
 *
 * Copiar como config.php FUERA de public_html (en el directorio que contiene
 * public_html), para que api/registrar.php lo cargue con
 * require __DIR__ . '/../../config.php'. config.php nunca se sube al repo.
 */

return [
    'db_host' => 'localhost',
    'db_name' => 'nombre_de_la_base',
    'db_user' => 'usuario',
    'db_pass' => 'contraseña',
];
