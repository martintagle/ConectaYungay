/**
 * CAPA DE PRESENTACIÓN (Presentation Layer — Cartel de información del lugar)
 * ConectaYungay — Se abre al hacer clic en un hito del panel "Tu Ruta"
 *
 * Cada apertura registra una 'apertura' y el botón "Más información" registra
 * un 'mas_info' (una vez por apertura), para contrastar cuántas veces se abrió
 * el cartel de cada lugar y cuántas de ellas se pidió más información.
 * Si el lugar tiene página web (webUrl), el botón abre esa página; si tiene
 * Instagram (instagramUrl), se muestra además un botón de Instagram.
 * Los botones ES · EN · PT cambian el idioma del texto del cartel; el idioma
 * elegido se mantiene al abrir el cartel de otro lugar.
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.PlaceInfo = (function () {
    const DOM = {};
    let currentPlace = null;
    let currentNode = null;
    let currentUrl = null; // página web del lugar, si tiene
    let moreRegistered = false;
    let lang = 'es';

    // Textos fijos del cartel en cada idioma
    const UI = {
        es: { eyebrow: 'Historia del lugar', more: 'Más información', newTab: 'Se abre en una pestaña nueva', close: 'Cerrar' },
        en: { eyebrow: 'History of the place', more: 'More information', newTab: 'Opens in a new tab', close: 'Close' },
        pt: { eyebrow: 'História do lugar', more: 'Mais informações', newTab: 'Abre em uma nova aba', close: 'Fechar' }
    };

    function cacheDOM() {
        if (DOM.dialog) return;
        DOM.dialog = document.getElementById('place-dialog');
        DOM.eyebrow = document.getElementById('place-dialog-eyebrow');
        DOM.title = document.getElementById('place-dialog-title');
        DOM.text = document.getElementById('place-dialog-text');
        DOM.lang = document.getElementById('place-dialog-lang');
        DOM.langBtns = DOM.lang.querySelectorAll('[data-lang]');
        DOM.close = document.getElementById('place-dialog-close');
        DOM.more = document.getElementById('place-dialog-more');
        DOM.moreBtn = document.getElementById('place-dialog-more-btn');
        DOM.instagram = document.getElementById('place-dialog-instagram');

        DOM.close.addEventListener('click', close);
        DOM.moreBtn.addEventListener('click', showMore);
        DOM.langBtns.forEach(btn => btn.addEventListener('click', () => {
            lang = btn.dataset.lang;
            render();
        }));
        // Clic en el fondo oscurecido (fuera de la tarjeta) también cierra
        DOM.dialog.addEventListener('click', e => {
            if (e.target === DOM.dialog) close();
        });
    }

    /**
     * Abre el cartel de un lugar del recorrido.
     * @param {{name: string, description: string, translations: {en?: string, pt?: string}, webUrl: ?string, instagramUrl: ?string}} node - Hito del recorrido
     */
    function open(node) {
        cacheDOM();
        currentNode = node;
        currentPlace = node.name;
        currentUrl = safeUrl(node.webUrl);
        moreRegistered = false;

        const instagramUrl = safeUrl(node.instagramUrl);
        DOM.instagram.href = instagramUrl || '#';
        DOM.instagram.classList.toggle('hidden', !instagramUrl);
        DOM.instagram.setAttribute('aria-label', `Instagram de ${node.name}`);

        DOM.title.textContent = node.name;
        DOM.more.classList.remove('expanded');
        DOM.moreBtn.classList.remove('hidden');
        render();

        if (!DOM.dialog.open) DOM.dialog.showModal();
        DOM.close.focus();
        ConectaYungay.VisitService.registrarClic(currentPlace, 'apertura');
    }

    // Pinta el texto y las etiquetas del cartel en el idioma elegido
    function render() {
        const node = currentNode;
        const translations = node.translations || {};
        // Sin traducciones (lugar sin texto todavía): no se muestran los botones de idioma
        const hasTranslations = !!(node.description && (translations.en || translations.pt));
        const shown = hasTranslations && translations[lang] ? lang : 'es';
        const text = shown === 'es' ? node.description : translations[shown];
        const ui = UI[shown];

        DOM.lang.classList.toggle('hidden', !hasTranslations);
        DOM.langBtns.forEach(btn => {
            btn.setAttribute('aria-pressed', String(btn.dataset.lang === shown));
            btn.disabled = btn.dataset.lang !== 'es' && !translations[btn.dataset.lang];
        });

        // Lugares sin texto todavía (estaciones de metro, etc.): se oculta el párrafo
        DOM.text.textContent = text || '';
        DOM.text.lang = shown;
        DOM.text.classList.toggle('hidden', !text);
        DOM.eyebrow.textContent = ui.eyebrow;
        DOM.close.setAttribute('aria-label', ui.close);
        DOM.moreBtn.textContent = currentUrl ? `${ui.more} ↗` : ui.more;
        DOM.moreBtn.title = currentUrl ? ui.newTab : '';
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
