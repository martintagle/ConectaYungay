/**
 * CAPA DE SEGURIDAD (Security Utilities)
 * ConectaYungay — Sanitización de datos antes de insertarlos en el DOM
 *
 * Propósito:
 *   - Prevenir XSS (Cross-Site Scripting) escapando los strings que se
 *     insertan con innerHTML o en popups de Leaflet.
 *   - Validar las URLs que van a href.
 *
 * Alcance: el sitio es estático (GitHub Pages). La encuesta de visitantes
 *   envía datos a Supabase: sus campos se validan en surveyPanel.js y la
 *   tabla solo admite INSERT anónimo (RLS). Si se agregan datos de usuario
 *   que se muestren en el DOM, deben pasar por escapeHTML.
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.Security = (function () {

    /**
     * Escapa caracteres HTML especiales para prevenir XSS.
     * Usar SIEMPRE antes de insertar strings externos en el DOM con innerHTML.
     *
     * Ejemplo de uso:
     *   element.innerHTML = Security.escapeHTML(userInput);
     *
     * @param {string} str - El string a sanitizar
     * @returns {string} - El string con caracteres peligrosos escapados
     */
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Sanitiza una URL para prevenir inyección de javascript: o data: URIs.
     * Usar antes de asignar cualquier URL proveniente del usuario a href o src.
     *
     * @param {string} url - La URL a validar
     * @returns {string} - La URL si es segura, o '#' en caso contrario
     */
    function sanitizeURL(url) {
        if (!url) return '#';
        const sanitized = String(url).trim();
        // Solo permitir http, https y rutas relativas
        if (/^(https?:\/\/|\/|\.\/|#)/i.test(sanitized)) {
            return sanitized;
        }
        console.warn('[Security] URL bloqueada por política de seguridad:', sanitized);
        return '#';
    }

    // API pública del módulo
    return {
        escapeHTML,
        sanitizeURL
    };

})();
