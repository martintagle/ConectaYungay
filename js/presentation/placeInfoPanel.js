/**
 * CAPA DE PRESENTACIÓN (Presentation Layer — Cartel de información del lugar)
 * ConectaYungay — Se abre al hacer clic en un hito del panel "Tu Ruta"
 *
 * Cada apertura registra una 'apertura' y el botón "Más información" registra
 * un 'mas_info' (una vez por apertura), para contrastar cuántas veces se abrió
 * el cartel de cada lugar y cuántas de ellas se pidió más información.
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.PlaceInfo = (function () {
    const DOM = {};
    let currentPlace = null;
    let moreRegistered = false;

    function cacheDOM() {
        if (DOM.dialog) return;
        DOM.dialog = document.getElementById('place-dialog');
        DOM.title = document.getElementById('place-dialog-title');
        DOM.text = document.getElementById('place-dialog-text');
        DOM.close = document.getElementById('place-dialog-close');
        DOM.more = document.getElementById('place-dialog-more');
        DOM.moreBtn = document.getElementById('place-dialog-more-btn');

        DOM.close.addEventListener('click', close);
        DOM.moreBtn.addEventListener('click', showMore);
        // Clic en el fondo oscurecido (fuera de la tarjeta) también cierra
        DOM.dialog.addEventListener('click', e => {
            if (e.target === DOM.dialog) close();
        });
    }

    /**
     * Abre el cartel de un lugar del recorrido.
     * @param {{name: string, description: string}} node - Hito del recorrido
     */
    function open(node) {
        cacheDOM();
        currentPlace = node.name;
        moreRegistered = false;

        DOM.title.textContent = node.name;
        // Lugares sin texto todavía (estaciones de metro, etc.): se oculta el párrafo
        DOM.text.textContent = node.description || '';
        DOM.text.classList.toggle('hidden', !node.description);
        DOM.more.classList.remove('expanded');
        DOM.moreBtn.classList.remove('hidden');

        if (!DOM.dialog.open) DOM.dialog.showModal();
        DOM.close.focus();
        ConectaYungay.VisitService.registrarClic(currentPlace, 'apertura');
    }

    function showMore() {
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
