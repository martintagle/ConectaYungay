/**
 * CAPA DE PRESENTACIÓN (Presentation Layer — Cartel de información del lugar)
 * ConectaYungay — Se abre al hacer clic en un hito del panel "Tu Ruta"
 *
 * Cada apertura registra una 'apertura' y el botón "Más información" registra
 * un 'mas_info' (una vez por apertura), para contrastar cuántas veces se abrió
 * el cartel de cada lugar y cuántas de ellas se pidió más información.
 * Si el lugar tiene página web (webUrl), el botón abre esa página; si tiene
 * Instagram (instagramUrl), se muestra además un botón de Instagram.
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.PlaceInfo = (function () {
    const DOM = {};
    let currentPlace = null;
    let currentUrl = null; // página web del lugar, si tiene
    let moreRegistered = false;

    function cacheDOM() {
        if (DOM.dialog) return;
        DOM.dialog = document.getElementById('place-dialog');
        DOM.title = document.getElementById('place-dialog-title');
        DOM.text = document.getElementById('place-dialog-text');
        DOM.close = document.getElementById('place-dialog-close');
        DOM.more = document.getElementById('place-dialog-more');
        DOM.moreBtn = document.getElementById('place-dialog-more-btn');
        DOM.instagram = document.getElementById('place-dialog-instagram');

        DOM.close.addEventListener('click', close);
        DOM.moreBtn.addEventListener('click', showMore);
        // Clic en el fondo oscurecido (fuera de la tarjeta) también cierra
        DOM.dialog.addEventListener('click', e => {
            if (e.target === DOM.dialog) close();
        });
    }

    /**
     * Abre el cartel de un lugar del recorrido.
     * @param {{name: string, description: string, webUrl: ?string, instagramUrl: ?string}} node - Hito del recorrido
     */
    function open(node) {
        cacheDOM();
        currentPlace = node.name;
        currentUrl = safeUrl(node.webUrl);
        moreRegistered = false;

        const instagramUrl = safeUrl(node.instagramUrl);
        DOM.instagram.href = instagramUrl || '#';
        DOM.instagram.classList.toggle('hidden', !instagramUrl);
        DOM.instagram.setAttribute('aria-label', `Instagram de ${node.name}`);

        DOM.title.textContent = node.name;
        // Lugares sin texto todavía (estaciones de metro, etc.): se oculta el párrafo
        DOM.text.textContent = node.description || '';
        DOM.text.classList.toggle('hidden', !node.description);
        DOM.more.classList.remove('expanded');
        DOM.moreBtn.classList.remove('hidden');
        DOM.moreBtn.textContent = currentUrl ? 'Más información ↗' : 'Más información';
        DOM.moreBtn.title = currentUrl ? 'Se abre en una pestaña nueva' : '';

        if (!DOM.dialog.open) DOM.dialog.showModal();
        DOM.close.focus();
        ConectaYungay.VisitService.registrarClic(currentPlace, 'apertura');
    }

    // Security: solo URLs http(s) válidas; si no, null (no se usa el enlace)
    function safeUrl(url) {
        const safe = url ? ConectaYungay.Security.sanitizeURL(url) : '#';
        return safe !== '#' ? safe : null;
    }

    function showMore() {
        // Lugar con página propia: se abre en otra pestaña y el cartel queda igual
        if (currentUrl) {
            window.open(currentUrl, '_blank', 'noopener,noreferrer');
            if (!moreRegistered) {
                moreRegistered = true;
                ConectaYungay.VisitService.registrarClic(currentPlace, 'mas_info');
            }
            return;
        }
        DOM.more.classList.add('expanded');
        DOM.moreBtn.classList.add('hidden');
        DOM.close.focus(); // el botón desaparece: el foco no debe quedar perdido
        if (!moreRegistered) {
            moreRegistered = true;
            ConectaYungay.VisitService.registrarClic(currentPlace, 'mas_info');
        }
    }

    function close() {
        if (DOM.dialog && DOM.dialog.open) DOM.dialog.close();
    }

    return { open, close };
})();
