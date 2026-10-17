/**
 * CAPA DE PRESENTACIÓN (Presentation Layer - UI Controller)
 * ConectaYungay - Controlador de Interfaz y Lógica del Cliente
 *
 * NOTA: El mapa Leaflet se inicializa de forma diferida (lazy) cuando el usuario
 * elige una ruta, NO durante el arranque de la UI. Esto evita que un error de
 * carga de la librería Leaflet bloquee los botones de la pantalla de bienvenida.
 *
 * La pantalla de bienvenida pide permiso para usar la ubicación (GPS) del
 * visitante y ordena las rutas de la más cercana a la más lejana. Sin permiso,
 * las rutas se muestran en su orden de siempre (A, B, C, D).
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.UI = (function () {
    let routeNodes = [];
    let routeGeometry = null; // promesa con el trazado por las calles de la ruta actual
    let discountsList = [];
    let discountsRequest = 0; // descarta respuestas de descuentos de un hito anterior
    let locationRequest = 0;  // descarta ubicaciones pedidas antes de la última
    let currentRoute = null;  // { id, nombre } de la ruta elegida
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
        DOM.routesList = document.getElementById('routes-list');
        DOM.locationStatus = document.getElementById('location-status');
        DOM.btnLocate = document.getElementById('btn-locate');
        DOM.btnGenerate = document.getElementById('btn-generate');
        DOM.btnDownload = document.getElementById('btn-download');
        DOM.btnReset = document.getElementById('btn-reset');
        DOM.routeName = document.getElementById('route-name');
        DOM.nodesContainer = document.getElementById('nodes-container');
        DOM.discountsContainer = document.getElementById('discounts-container');
        DOM.selectedNodeLabel = document.getElementById('selected-node-label');

        // Registrar eventos — SIEMPRE, independiente del mapa
        DOM.routesList.addEventListener('click', e => {
            const btn = e.target.closest('[data-route-id]');
            if (btn) selectRoute(btn.dataset.routeId);
        });
        DOM.btnLocate.addEventListener('click', requestLocation);
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
    // Un QR puede abrir una ruta directamente: ?ruta=a (o ?ruta=ruta-a).
    // Cualquier otro valor (por ejemplo los QR antiguos con ?origin=) muestra la lista.
    function detectQRParams() {
        const ruta = (new URLSearchParams(window.location.search).get('ruta') || '').toLowerCase();
        const id = ruta.startsWith('ruta-') ? ruta : `ruta-${ruta}`;
        if (ruta && ConectaYungay.Service.listarRutas().some(r => r.id === id)) {
            selectRoute(id);
        } else {
            showWelcome();
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
        // La pantalla nueva parte desde arriba, aunque la anterior estuviera desplazada
        window.scrollTo(0, 0);
    }

    /**
     * Muestra la lista de rutas y pide la ubicación para ordenarla.
     * Si el visitante ya dio permiso, el navegador no vuelve a preguntar.
     */
    function showWelcome() {
        showScreen('welcome');
        try {
            renderRoutes(ConectaYungay.Service.listarRutas());
        } catch (e) {
            console.error('Error al cargar las rutas:', e);
            DOM.routesList.innerHTML = '<li class="error-text">No se pudieron cargar las rutas.</li>';
            return;
        }
        requestLocation();
    }

    // ─────────────────────────────────────────────
    //  UBICACIÓN DEL VISITANTE (GPS)
    // ─────────────────────────────────────────────
    function setLocationStatus(text, showButton, buttonLabel = 'Usar mi ubicación') {
        DOM.locationStatus.textContent = text;
        DOM.btnLocate.textContent = buttonLabel;
        DOM.btnLocate.classList.toggle('hidden', !showButton);
    }

    /**
     * Pide la ubicación al navegador (la primera vez muestra el aviso de
     * permiso) y reordena las rutas según la distancia al punto de partida.
     */
    function requestLocation() {
        // La geolocalización solo funciona en HTTPS (o localhost)
        if (!('geolocation' in navigator) || !window.isSecureContext) {
            setLocationStatus('Tu navegador no permite usar la ubicación. Elige la ruta que prefieras.', false);
            return;
        }

        const request = ++locationRequest;
        setLocationStatus('Buscando tu ubicación…', false);
        DOM.btnLocate.disabled = true;

        navigator.geolocation.getCurrentPosition(
            position => {
                if (request !== locationRequest) return;
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                setLocationStatus('Calculando la distancia a cada ruta…', false);
                ConectaYungay.Service.ordenarPorCercania(coords)
                    .then(rutas => {
                        if (request !== locationRequest) return;
                        renderRoutes(rutas);
                        setLocationStatus('Ordenadas de la más cercana a la más lejana de ti.', true, 'Actualizar ubicación');
                    })
                    .catch(e => {
                        console.error('Error al ordenar las rutas:', e);
                        setLocationStatus('No pudimos calcular las distancias. Elige la ruta que prefieras.', true, 'Reintentar');
                    })
                    .finally(() => { DOM.btnLocate.disabled = false; });
            },
            error => {
                if (request !== locationRequest) return;
                DOM.btnLocate.disabled = false;
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationStatus('Sin permiso de ubicación. Puedes activarlo en los ajustes del navegador para ver la ruta más cercana.', true, 'Reintentar');
                } else {
                    setLocationStatus('No pudimos obtener tu ubicación. Revisa que el GPS esté activo.', true, 'Reintentar');
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    }

    function formatMeters(meters) {
        if (meters < 1000) return `${meters} m`;
        return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
    }

    /**
     * Dibuja la lista de rutas. Cada ruta conserva su nombre aunque cambie de
     * posición; si se conoce la ubicación muestra la distancia al punto de partida.
     * @param {Array} rutas - ver Service.listarRutas / Service.ordenarPorCercania
     */
    function renderRoutes(rutas) {
        const esc = ConectaYungay.Security.escapeHTML;
        DOM.routesList.innerHTML = '';
        rutas.forEach((ruta, i) => {
            const detalles = [`${ruta.paradas} paradas`];
            if (Number.isFinite(ruta.metros)) detalles.push(`${formatMeters(ruta.metros)} a pie`);
            const chips = detalles.map(d => `<span class="route-option-chip">${esc(d)}</span>`).join('');

            let distancia = '';
            if (Number.isFinite(ruta.distance)) {
                const texto = ruta.distance < 30 ? 'Estás aquí'
                    : ruta.aproximada ? `~${formatMeters(ruta.distance)} en línea recta`
                        : `A ${formatMeters(ruta.distance)} de ti`;
                distancia = `<span class="route-option-distance${i === 0 ? ' is-closest' : ''}">${esc(texto)}</span>`;
            }

            // Letra de la ruta ("Ruta A" → "A") para el círculo de la izquierda
            const letra = ruta.nombre.replace(/^ruta\s+/i, '').charAt(0).toUpperCase();

            const li = document.createElement('li');
            li.innerHTML = `
                <button type="button" class="route-option fade-in${i === 0 && distancia ? ' is-closest' : ''}" data-route-id="${esc(ruta.id)}">
                    <span class="route-option-badge" aria-hidden="true">${esc(letra)}</span>
                    <span class="route-option-body">
                        <span class="route-option-top">
                            <span class="route-option-name">${esc(ruta.nombre)}</span>
                            ${distancia}
                        </span>
                        <span class="route-option-start">Parte en ${esc(ruta.inicio.name)}</span>
                        <span class="route-option-meta">${chips}</span>
                    </span>
                    <span class="route-option-cta" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </span>
                </button>
            `;
            DOM.routesList.appendChild(li);
        });
    }

    // ─────────────────────────────────────────────
    //  SELECCIÓN DE RUTA
    // ─────────────────────────────────────────────
    function selectRoute(routeId) {
        locationRequest++; // una ubicación que llegue tarde ya no reordena la lista
        const ruta = ConectaYungay.Service.listarRutas().find(r => r.id === routeId);
        if (!ruta) return;
        currentRoute = { id: ruta.id, nombre: ruta.nombre };
        // Registra la visita con las respuestas de la encuesta (si las hubo)
        ConectaYungay.VisitService.iniciarVisita(ruta.id);

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

        try {
            loadRoute(currentRoute);
        } catch (e) {
            console.error('Error al cargar ruta:', e);
            DOM.nodesContainer.innerHTML = `<p class="error-text">No se pudo cargar la ${ConectaYungay.Security.escapeHTML(ruta.nombre)}.</p>`;
        }
    }

    /**
     * Carga los hitos de un recorrido y deja la UI lista para trazarlo.
     * Detiene el recorrido que se esté animando y vacía sus datos.
     */
    function loadRoute(recorrido) {
        try { ConectaYungay.MapRenderer.clearRoute(); } catch (e) { }
        routeNodes = [];

        DOM.routeName.textContent = recorrido.nombre;
        routeNodes = ConectaYungay.Service.getRoute(recorrido.id);
        if (!routeNodes.length) {
            throw new Error('La ruta no tiene hitos con coordenadas válidas.');
        }
        // El trazado por las calles se pide ya, para tenerlo listo al pulsar "Generar Recorrido"
        routeGeometry = ConectaYungay.Service.getRouteGeometry(recorrido.id);
        DOM.btnGenerate.removeAttribute('disabled');
        DOM.btnDownload.setAttribute('disabled', 'true');
        DOM.nodesContainer.innerHTML = '<p class="placeholder-text">Haz clic en "Generar Recorrido" para trazar la ruta en el mapa.</p>';
        discountsRequest++;
        DOM.discountsContainer.innerHTML = '<p class="placeholder-text">Los descuentos aparecerán al iniciar el recorrido.</p>';
        DOM.selectedNodeLabel.textContent = 'ninguna todavía';
    }

    // ─────────────────────────────────────────────
    //  ANIMACIÓN DEL RECORRIDO
    // ─────────────────────────────────────────────
    // Pulsar de nuevo "Generar Recorrido" vuelve a trazar la misma ruta desde el inicio.
    async function startRouteAnimation() {
        if (!routeNodes.length || !routeGeometry) return;
        const route = currentRoute;

        DOM.btnGenerate.setAttribute('disabled', 'true');
        DOM.btnDownload.setAttribute('disabled', 'true');
        DOM.nodesContainer.innerHTML = '<p class="placeholder-text">Trazando el recorrido por las calles…</p>';

        const geometry = await routeGeometry; // nunca rechaza: sin servicio usa líneas rectas
        if (route !== currentRoute) return; // el visitante cambió de ruta mientras se esperaba
        DOM.nodesContainer.innerHTML = '';

        const started = ConectaYungay.MapRenderer.animateRoute(routeNodes, geometry, (node, index) => {
            appendNodeToList(node, index);
            selectActiveNode(index);

            if (index === routeNodes.length - 1) {
                DOM.btnDownload.removeAttribute('disabled');
                DOM.btnGenerate.removeAttribute('disabled');
            }
        });

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
        // Las paradas con cartel llevan una flecha: se pueden abrir para leer su historia
        el.innerHTML = `
            <div class="node-number">${index + 1}</div>
            <div class="node-details">
                <span class="node-name">${safeName}</span>
                ${node.isStation ? '<span class="node-tag">Estación de metro</span>' : ''}
            </div>
            ${node.isStation ? '' : `
            <svg class="node-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`}
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
            scrollNodeIntoList(activeEl);
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

    // Muestra el hito dentro de la lista "Tu Ruta" moviendo solo la lista, no la
    // página (scrollIntoView bajaba la pantalla y el visitante dejaba de ver el mapa)
    function scrollNodeIntoList(el) {
        const list = DOM.nodesContainer.getBoundingClientRect();
        const item = el.getBoundingClientRect();
        let delta = 0;
        if (item.top < list.top) delta = item.top - list.top;
        else if (item.bottom > list.bottom) delta = item.bottom - list.bottom;
        if (delta) DOM.nodesContainer.scrollBy({ top: delta, behavior: 'smooth' });
    }

    function formatDistance(meters, aproximada) {
        if (meters < 10) return 'A pasos';
        return aproximada ? `~${meters} m en línea recta` : `${meters} m a pie`;
    }

    // Íconos de los enlaces de un local (Instagram, web, carta...): botones
    // pequeños junto al del mapa para no recargar la tarjeta
    const LINK_TYPES = {
        instagram: { label: 'Instagram', icon: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/>' },
        web:       { label: 'Sitio web', icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>' },
        menu:      { label: 'Carta', icon: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>' },
        tour360:   { label: 'Recorrido virtual 360°', icon: '<ellipse cx="12" cy="12" rx="9" ry="4"/><path d="M12 3v18"/><path d="M17 15.5l2 1-1.2 1.9"/>' },
        enlaces:   { label: 'Todos sus enlaces', icon: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>' }
    };

    // Logo de Google Maps (pin) para el botón de la dirección, con el mismo trazo que los demás íconos
    const GOOGLE_MAPS_LOGO = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 21.5c-1-2.6-2.6-4.4-4.2-6.4C6.4 13.4 5 11.8 5 9.2a7 7 0 0 1 14 0c0 2.6-1.4 4.2-2.8 5.9-1.6 2-3.2 3.8-4.2 6.4z"/>
            <circle cx="12" cy="9.2" r="2.6"/>
        </svg>`;

    function renderPlaceLinks(links, placeName) {
        if (!links || !links.length) return '';
        const items = links.map(link => {
            const type = LINK_TYPES[link.tipo];
            const url = ConectaYungay.Security.sanitizeURL(link.url);
            if (!type || url === '#') return '';
            const safeLabel = ConectaYungay.Security.escapeHTML(`${type.label} de ${placeName}`);
            return `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn-place-link"
                   aria-label="${safeLabel}" title="${ConectaYungay.Security.escapeHTML(type.label)}">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${type.icon}</svg>
                </a>`;
        }).join('');
        return items;
    }

    // Ícono de cada categoría (círculo de color a la izquierda de la tarjeta)
    const CATEGORY_ICONS = {
        cafeteria: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3.5c0 1.5 1 1.5 1 3M12 3.5c0 1.5 1 1.5 1 3"/>',
        restaurante: '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3"/><path d="M17 21V3c-2.2 1.6-3.3 4.2-3.3 7.5V14H17"/>',
        heladeria: '<path d="M8 12l4 9 4-9"/><path d="M7 12a5 5 0 0 1 10 0z"/>'
    };

    const WALK_ICON = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="13" cy="4" r="1.6"/><path d="M10 21l2-6 3 3v3"/><path d="M8 12l2.5-4 3 1.5 1.5 3 2.5 1"/><path d="M10.5 8l1.5 7"/>
        </svg>`;

    // ─────────────────────────────────────────────
    //  RENDERIZAR TARJETAS DE DESCUENTO
    // ─────────────────────────────────────────────
    function renderDiscountsUI(recs) {
        DOM.discountsContainer.innerHTML = '';

        const categories = [
            { key: 'cafeteria', label: 'Cafetería', data: recs.cafeteria },
            { key: 'restaurante', label: 'Restaurante', data: recs.restaurante },
            { key: 'heladeria', label: 'Heladería', data: recs.heladeria }
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

            const card = document.createElement('article');
            card.className = `discount-card discount-card--${cat.key} fade-in`;
            card.innerHTML = `
                <div class="discount-card-top">
                    <span class="discount-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${CATEGORY_ICONS[cat.key]}</svg>
                    </span>
                    <div class="discount-info">
                        <span class="discount-category">${safeLabel}</span>
                        <h4 class="discount-name">${safeName}</h4>
                        <p class="discount-address">${safeAddress}</p>
                    </div>
                </div>
                <div class="discount-card-divider" aria-hidden="true"></div>
                <div class="discount-card-bottom">
                    <span class="discount-distance">${WALK_ICON}${safeDistance}</span>
                    <div class="discount-actions">
                        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-map-link"
                           aria-label="Ver ${safeName} en Google Maps" title="Ver en Google Maps">
                            ${GOOGLE_MAPS_LOGO}
                        </a>
                        ${renderPlaceLinks(cat.data.links, cat.data.name)}
                    </div>
                </div>
            `;
            DOM.discountsContainer.appendChild(card);
        });
    }


    // ─────────────────────────────────────────────
    //  DESCARGA Y RESET
    // ─────────────────────────────────────────────
    function triggerDownload() {
        if (!currentRoute) return;
        try {
            ConectaYungay.MapRenderer.downloadMap(currentRoute.nombre);
        } catch (e) {
            console.error('Error en descarga:', e);
        }
    }

    function resetToWelcome() {
        const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.history.pushState({ path: cleanUrl }, '', cleanUrl);
        currentRoute = null;
        routeNodes = [];
        routeGeometry = null;
        try { ConectaYungay.MapRenderer.clearRoute(); } catch (e) { }
        ConectaYungay.PlaceInfo.close();
        showWelcome();
    }

    return { init };
})();

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', ConectaYungay.UI.init);
