/**
 * SEGURIDAD — Redirección a HTTPS
 * ConectaYungay — Se carga en el <head> antes que cualquier otro recurso.
 *
 * En GitHub Pages la opción "Enforce HTTPS" del repositorio hace esto a nivel
 * de servidor; este script es una red de seguridad para otros hostings.
 * Está en un archivo propio (no inline) para que la CSP no necesite 'unsafe-inline'.
 */
(function enforceHTTPS() {
    var loc = window.location;
    // Solo redirigir fuera de localhost y de file://
    var isLocal = loc.hostname === 'localhost'
        || loc.hostname === '127.0.0.1'
        || loc.protocol === 'file:';
    if (!isLocal && loc.protocol !== 'https:') {
        loc.replace('https:' + loc.href.substring(loc.protocol.length));
    }
})();
