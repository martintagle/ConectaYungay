/**
 * CAPA DE PRESENTACIÓN (Presentation Layer - UI Controller)
 * ConectaYungay - Controlador de Interfaz y Lógica del Cliente
 * 
 * NOTA: El mapa Leaflet se inicializa de forma diferida (lazy) cuando el usuario
 * elige un origen, NO durante el arranque de la UI. Esto evita que un error de
 * carga de la librería Leaflet bloquee los botones de la pantalla de bienvenida.
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.UI = (function () {
    let routeNodes = [];
    let discountsList = [];
    let discountsRequest = 0; // descarta respuestas de descuentos de un hito anterior
    let currentOrigin = null;
    let routeGenerated = false; // el recorrido actual ya se trazó: el próximo clic pasa al siguiente
    let mapInitialized = false;

    // Referencias al DOM — se llenan en init()
    const DOM = {};

    // ─────────────────────────────────────────────
    //  INICIALIZACIÓN PRINCIPAL
    // ─────────────────────────────────────────────
    function init() {
        // Cachear elementos del DOM
        DOM.welcomeScreen = document.getElementById('welcome-screen');
        DOM.appScreen = document.getElementById('app-screen');
        DOM.btnCumming = document.getElementById('btn-cumming');
        DOM.btnQuintaNormal = document.getElementById('btn-quintanormal');
        DOM.btnGenerate = document.getElementById('btn-generate');
        DOM.btnDownload = document.getElementById('btn-download');
        DOM.btnReset = document.getElementById('btn-reset');
        DOM.routeName = document.getElementById('route-name');
        DOM.nodesContainer = document.getElementById('nodes-container');
        DOM.discountsContainer = document.getElementById('discounts-container');
        DOM.selectedNodeLabel = document.getElementById('selected-node-label');

        // Registrar eventos — SIEMPRE, independiente del mapa
        DOM.btnCumming.addEventListener('click', () => selectOrigin('cumming'));
        DOM.btnQuintaNormal.addEventListener('click', () => selectOrigin('quintanormal'));
        DOM.btnGenerate.addEventListener('click', startRouteAnimation);
        DOM.btnDownload.addEventListener('click', triggerDownload);
        DOM.btnReset.addEventListener('click', resetToWelcome);

        // Cargar descuentos en segundo plano (no bloquea la UI)
        try {
            discountsList = ConectaYungay.Service.getDiscounts();
        } catch (e) {
            console.warn('No se pudieron cargar los descuentos.', e);
        }

        // Encuesta de visitante primero; al terminar (o si ya se respondió) se detecta el QR
        ConectaYungay.Survey.run(detectQRParams);
    }

    // ─────────────────────────────────────────────
    //  DETECCIÓN DE PARÁMETRO QR
    // ─────────────────────────────────────────────
    function detectQRParams() {
        const origin = new URLSearchParams(window.location.search).get('origin') || '';
        if (origin === 'cumming' || origin === 'metro-cumming') {
            selectOrigin('cumming');
        } else if (['quintanormal', 'quinta-normal', 'metro-quinta-normal'].includes(origin)) {
            selectOrigin('quintanormal');
        } else {
            showScreen('welcome');
        }
    }

    // ─────────────────────────────────────────────
    //  CONTROL DE PANTALLAS
    // ─────────────────────────────────────────────
    function showScreen(screen) {
        if (screen === 'welcome') {
            DOM.welcomeScreen.classList.remove('hidden');
            DOM.appScreen.classList.add('hidden');
        } else {
            DOM.welcomeScreen.classList.add('hidden');
            DOM.appScreen.classList.remove('hidden');
        }
    }

    // ─────────────────────────────────────────────
    //  SELECCIÓN DE ORIGEN
    // ─────────────────────────────────────────────
    async function selectOrigin(origin) {
        currentOrigin = origin;
        // Registra la visita con las respuestas de la encuesta (si las hubo)
        ConectaYungay.VisitService.iniciarVisita(origin);
        const displayName = origin === 'cumming' ? 'Metro Cumming' : 'Metro Quinta Normal';
        DOM.routeName.textContent = `Recorrido desde ${displayName}`;

        showScreen('app');

        // Inicializar el mapa Leaflet de forma diferida (solo la primera vez)
        // Se hace DESPUÉS de mostrar el contenedor, para que Leaflet calcule el tamaño correctamente
        setTimeout(() => {
            try {
                if (!mapInitialized) {
                    ConectaYungay.MapRenderer.init('map-container');
                    mapInitialized = true;
                } else {
                    ConectaYungay.MapRenderer.resetView();
                }
            } catch (err) {
                console.error('Error al inicializar el mapa:', err);
            }
        }, 150);

        // Cargar nodos de la ruta (la capa de negocio alterna los recorridos por estación)
        try {
            loadRoute(ConectaYungay.Service.elegirRecorrido(origin));
        } catch (e) {
            console.error('Error al cargar ruta:', e);
            DOM.nodesContainer.innerHTML = `<p class="error-text">No se pudo cargar la ruta para ${displayName}.</p>`;
        }
    }

    /**
     * Carga los hitos de un recorrido y deja la UI lista para trazarlo.
     * Detiene el recorrido que se esté animando y vacía sus datos.
     */
    function loadRoute(recorrido) {
        const displayName = currentOrigin === 'cumming' ? 'Metro Cumming' : 'Metro Quinta Normal';
        try { ConectaYungay.MapRenderer.clearRoute(); } catch (e) { }
        routeNodes = [];
        routeGenerated = false;

        DOM.routeName.textContent = `${recorrido.nombre} desde ${displayName}`;
        routeNodes = ConectaYungay.Service.getRoute(recorrido.id);
        if (!routeNodes.length) {
            throw new Error('La ruta no tiene hitos con coordenadas válidas.');
        }
        DOM.btnGenerate.removeAttribute('disabled');
        DOM.btnDownload.setAttribute('disabled', 'true');
        DOM.nodesContainer.innerHTML = '<p class="placeholder-text">Haz clic en "Generar Recorrido" para trazar la ruta en el mapa.</p>';
        discountsRequest++;
        DOM.discountsContainer.innerHTML = '<p class="placeholder-text">Los descuentos aparecerán al iniciar el recorrido.</p>';
        DOM.selectedNodeLabel.textContent = 'Ninguno';
    }

    // ─────────────────────────────────────────────
    //  ANIMACIÓN DEL RECORRIDO
    // ─────────────────────────────────────────────
    function startRouteAnimation() {
        // Si ya se trazó un recorrido, el botón pasa al siguiente de la estación (circular)
        if (routeGenerated) {
            try {
                loadRoute(ConectaYungay.Service.siguienteRecorrido(currentOrigin));
            } catch (e) {
                console.error('Error al cargar el siguiente recorrido:', e);
                DOM.nodesContainer.innerHTML = '<p class="error-text">No se pudo cargar el siguiente recorrido.</p>';
                return;
            }
        }
        if (!routeNodes.length) return;

        DOM.btnGenerate.setAttribute('disabled', 'true');
        DOM.nodesContainer.innerHTML = '';

        const started = ConectaYungay.MapRenderer.animateRoute(routeNodes, (node, index) => {
            appendNodeToList(node, index);
            selectActiveNode(index);

            if (index === routeNodes.length - 1) {
                DOM.btnDownload.removeAttribute('disabled');
                DOM.btnGenerate.removeAttribute('disabled');
            }
        }, 350);
        if (started) routeGenerated = true;

        // Si el mapa no está listo, no hay animación que reactive el botón: hacerlo aquí
        if (!started) {
            DOM.btnGenerate.removeAttribute('disabled');
            DOM.nodesContainer.innerHTML = '<p class="error-text">El mapa no está disponible. Revisa tu conexión e intenta de nuevo.</p>';
        }
    }

    function appendNodeToList(node, index) {
        const el = document.createElement('div');
        el.className = 'route-node-item fade-in';
        el.id = `ui-node-${index}`;
        // Security: escapeHTML previene XSS en caso de datos comprometidos del repositorio
        const safeName = ConectaYungay.Security.escapeHTML(node.name);
        el.innerHTML = `
            <div class="node-number">${index + 1}</div>
            <div class="node-details"><span class="node-name">${safeName}</span></div>
        `;
        // Las estaciones de metro no tienen cartel informativo: solo se seleccionan
        if (node.isStation) el.classList.add('is-station');
        el.addEventListener('click', () => {
            selectActiveNode(index);
            if (!node.isStation) ConectaYungay.PlaceInfo.open(node);
        });
        DOM.nodesContainer.appendChild(el);
        DOM.nodesContainer.scrollTop = DOM.nodesContainer.scrollHeight;
    }

    // ─────────────────────────────────────────────
    //  SELECCIÓN DE NODO ACTIVO Y DESCUENTOS
    // ─────────────────────────────────────────────
    function selectActiveNode(index) {
        const node = routeNodes[index];
        if (!node) return;

        DOM.selectedNodeLabel.textContent = `${index + 1}. ${node.name}`;

        // Marcar activo visualmente
        DOM.nodesContainer.querySelectorAll('.route-node-item').forEach(el => el.classList.remove('active'));
        const activeEl = document.getElementById(`ui-node-${index}`);
        if (activeEl) {
            activeEl.classList.add('active');
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Capa de Negocio: calcular descuentos más cercanos (distancia a pie)
        const request = ++discountsRequest;
        DOM.discountsContainer.innerHTML = '<p class="placeholder-text">Buscando los locales más cercanos...</p>';
        ConectaYungay.Service.getClosestDiscounts(node, discountsList)
            .then(recs => {
                // Si el visitante ya eligió otro hito, no pisar sus descuentos
                if (request === discountsRequest) renderDiscountsUI(recs);
            })
            .catch(e => console.error('Error al calcular descuentos:', e));
    }

    function formatDistance(meters, aproximada) {
        if (meters < 10) return 'A pasos';
        return aproximada ? `A ~${meters} metros en línea recta` : `A ${meters} metros a pie`;
    }

    // ─────────────────────────────────────────────
    //  RENDERIZAR TARJETAS DE DESCUENTO
    // ─────────────────────────────────────────────
    function renderDiscountsUI(recs) {
        DOM.discountsContainer.innerHTML = '';

        const categories = [
            { label: 'Cafetería', data: recs.cafeteria },
            { label: 'Restaurante', data: recs.restaurante },
            { label: 'Heladería', data: recs.heladeria }
        ];

        categories.forEach(cat => {
            if (!cat.data) return;

            // Security: sanitizar la URL antes de usarla en href
            const rawQuery = `${cat.data.name}, ${cat.data.address}, Barrio Yungay, Santiago, Chile`;
            const mapsUrl = ConectaYungay.Security.sanitizeURL(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawQuery)}`
            );

            // Security: escapar todos los datos del repositorio antes de inyectarlos
            const safeLabel = ConectaYungay.Security.escapeHTML(cat.label);
            const safeName = ConectaYungay.Security.escapeHTML(cat.data.name);
            const safeAddress = ConectaYungay.Security.escapeHTML(cat.data.address);
            const safeDistance = ConectaYungay.Security.escapeHTML(formatDistance(cat.data.distance, cat.data.aproximada));

            const card = document.createElement('div');
            card.className = 'discount-card fade-in';
            card.innerHTML = `
                <div class="discount-card-header">
                    <span class="discount-category">${safeLabel}</span>
                    <span class="discount-distance">${safeDistance}</span>
                </div>
                <div class="discount-card-body">
                    <h4 class="discount-name">${safeName}</h4>
                    <p class="discount-address">${safeAddress}</p>
                </div>
                <div class="discount-card-footer">
                    <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-map-link">
                        Ver dirección en el mapa
                    </a>
                </div>
            `;
            DOM.discountsContainer.appendChild(card);
        });
    }


    // ─────────────────────────────────────────────
    //  DESCARGA Y RESET
    // ─────────────────────────────────────────────
    function triggerDownload() {
        const name = currentOrigin === 'cumming' ? 'Metro Cumming' : 'Metro Quinta Normal';
        try {
            ConectaYungay.MapRenderer.downloadMap(name);
        } catch (e) {
            console.error('Error en descarga:', e);
        }
    }

    function resetToWelcome() {
        const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.history.pushState({ path: cleanUrl }, '', cleanUrl);
        currentOrigin = null;
        routeNodes = [];
        routeGenerated = false;
        try { ConectaYungay.MapRenderer.clearRoute(); } catch (e) { }
        ConectaYungay.PlaceInfo.close();
        showScreen('welcome');
    }

    return { init };
})();

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', ConectaYungay.UI.init);
