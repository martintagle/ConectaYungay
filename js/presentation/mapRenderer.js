/**
 * CAPA DE PRESENTACIÓN (Presentation Layer - Map Renderer)
 * ConectaYungay - Renderizador con Leaflet.js + OpenStreetMap
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.MapRenderer = (function () {
    let map = null;
    let routePolyline = null;
    let markers = [];
    let currentRoute = [];
    let accessLines = [];
    let animatedCount = 0;
    let animationRun = 0; // identifica la animación en curso

    // Centro del Barrio Yungay
    const CENTER = { lat: -33.4405, lng: -70.6745 };
    const ZOOM   = 16;

    // Colores de la paleta del proyecto
    const COLOR_CRIMSON = '#A7302A';
    const COLOR_GOLD    = '#C88A2A';
    const COLOR_CREAM   = '#F6EFE4';

    // Ritmo de la animación del recorrido
    const METERS_PER_SECOND = 300;  // velocidad con que avanza la línea
    const LEG_MIN_MS        = 300;  // un tramo muy corto igual se alcanza a ver
    const LEG_MAX_MS        = 1000; // un tramo muy largo no se hace eterno
    const STOP_PAUSE_MS     = 100;  // pausa en cada parada antes del tramo siguiente
    const FIRST_PAN_MS      = 400;  // desplazamiento inicial hasta la primera parada

    // Acelera al salir de una parada y frena al llegar a la siguiente
    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    /**
     * Crea el ícono SVG personalizado para los nodos del recorrido
     * @param {boolean} isActive - Si es el nodo activo (rojo) o pasado (dorado)
     * @param {number} number - Número del nodo en la ruta
     */
    function createNodeIcon(isActive, number) {
        const color  = isActive ? COLOR_CRIMSON : COLOR_GOLD;
        const size   = isActive ? 32 : 26;
        const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="${COLOR_CREAM}" stroke-width="2.5"/>
            <text x="16" y="21" text-anchor="middle" fill="${COLOR_CREAM}"
                  font-family="Outfit, sans-serif" font-size="${isActive ? 13 : 11}" font-weight="bold">${number}</text>
        </svg>`;
        return L.divIcon({
            html: svg,
            className: '',
            iconSize:   [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor:[0, -(size / 2)]
        });
    }

    /**
     * Inicializa el mapa Leaflet en el contenedor indicado
     * @param {string} containerId - ID del div contenedor del mapa
     */
    function init(containerId) {
        if (typeof L === 'undefined') {
            throw new Error('Leaflet (L) no está disponible. Verifica tu conexión a internet.');
        }
        if (map) { map.remove(); map = null; }
        markers = [];
        accessLines = [];
        currentRoute = [];
        animatedCount = 0;

        map = L.map(containerId, {
            center:         [CENTER.lat, CENTER.lng],
            zoom:           ZOOM,
            zoomControl:    true,
            scrollWheelZoom: true,
            renderer:       L.canvas() // Fuerza a Leaflet a dibujar líneas en Canvas, previniendo el bug de desplazamiento en html2canvas
        });

        // Tiles de Google Maps (capa de calles, lyrs=m) servidos por mt0..mt3, con nombres en español (hl=es).
        // En pantallas de alta densidad (teléfonos) se piden teselas al doble de resolución (scale=2)
        // para que calles y textos se vean nítidos en vez de borrosos.
        const tileScale = (window.devicePixelRatio || 1) > 1 ? 2 : 1;
        L.tileLayer(`https://mt{s}.google.com/vt/lyrs=m&hl=es&scale=${tileScale}&x={x}&y={y}&z={z}`, {
            subdomains:  '0123',
            tileSize:    256,
            minZoom:     0,
            maxZoom:     20,
            attribution: '© Google Maps'
        }).addTo(map);
    }

    /**
     * Limpia marcadores y líneas del mapa, sin destruir el mapa
     */
    function clearRoute() {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        accessLines.forEach(l => map.removeLayer(l));
        accessLines = [];
        if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
        animatedCount = 0;
        animationRun++; // los pasos pendientes de una animación anterior se descartan
    }

    /**
     * Anima el recorrido: pone el primer hito y luego dibuja cada tramo por las
     * calles hasta el hito siguiente, que aparece al terminar el tramo.
     * @param {Array}    routeNodes  - Hitos del recorrido (ver Service.getRoute)
     * @param {Object}   geometry    - { tramos, aproximada } (ver Service.getRouteGeometry);
     *                                 tramos[i] une el hito i con el i+1
     * @param {Function} onNodeAdded - Callback al agregar cada hito
     * @returns {boolean} true si la animación arrancó; false si el mapa no está listo
     */
    function animateRoute(routeNodes, geometry, onNodeAdded) {
        if (!map) return false;
        clearRoute();
        const run = animationRun;
        currentRoute  = routeNodes;
        animatedCount = 0;

        // Con líneas rectas (sin servicio de rutas) la línea va punteada: es aproximada
        routePolyline = L.polyline([], {
            color:     COLOR_CRIMSON,
            weight:    4,
            opacity:   0.85,
            lineJoin:  'round',
            lineCap:   'round',
            dashArray: geometry.aproximada ? '8 8' : null
        }).addTo(map);

        // El mapa sigue la punta de la línea mientras se dibuja; si el visitante
        // arrastra el mapa, deja de seguirla para no quitarle el control
        let follow = true;
        map.once('dragstart', () => { if (run === animationRun) follow = false; });

        function addNode() {
            if (run !== animationRun) return;

            const node    = currentRoute[animatedCount];
            const number  = animatedCount + 1;

            // Desmarcar el anterior como activo
            if (animatedCount > 0 && markers[animatedCount - 1]) {
                markers[animatedCount - 1].setIcon(createNodeIcon(false, animatedCount));
            }

            // Añadir marcador activo
            const marker = L.marker([node.lat, node.lng], {
                icon:      createNodeIcon(true, number),
                zIndexOffset: 1000
            }).addTo(map);

            // El popup acepta HTML: el nombre se escapa igual que en la lista
            marker.bindPopup(`
                <div style="font-family:'Outfit',sans-serif;text-align:center;min-width:140px">
                    <strong style="color:${COLOR_CRIMSON};font-size:14px">${number}. ${ConectaYungay.Security.escapeHTML(node.name)}</strong>
                </div>
            `);
            markers.push(marker);

            // Lugar retirado de la calle (dentro de un parque o pasaje): punteado hasta su acceso
            if (node.acceso) {
                accessLines.push(L.polyline([[node.lat, node.lng], [node.acceso.lat, node.acceso.lng]], {
                    color:     COLOR_GOLD,
                    weight:    3,
                    opacity:   0.9,
                    dashArray: '4 6'
                }).addTo(map));
            }

            const first = animatedCount === 0;
            if (first) map.panTo([node.lat, node.lng], { animate: true, duration: FIRST_PAN_MS / 1000 });

            animatedCount++;
            if (onNodeAdded) onNodeAdded(node, animatedCount - 1);

            // Sin acercar ni alejar: el mapa solo se desplaza con la ruta y queda en el último punto.
            // Tras una pausa breve en la parada (o al terminar el primer desplazamiento) sigue el tramo
            if (animatedCount < currentRoute.length) {
                const leg = geometry.tramos[animatedCount - 1] || [];
                setTimeout(() => drawLeg(leg, addNode), first ? FIRST_PAN_MS : STOP_PAUSE_MS);
            }
        }

        // Dibuja el tramo avanzando la punta de forma continua por la calle (no de
        // vértice en vértice), a velocidad pareja y frenando suave al llegar a la parada
        function drawLeg(points, done) {
            if (run !== animationRun) return;
            const latlngs = points.map(p => L.latLng(p));
            if (latlngs.length < 2) {
                latlngs.forEach(p => routePolyline.addLatLng(p));
                done();
                return;
            }

            // Distancia acumulada hasta cada vértice, en metros
            const acc = [0];
            for (let i = 1; i < latlngs.length; i++) acc.push(acc[i - 1] + latlngs[i - 1].distanceTo(latlngs[i]));
            const total = acc[acc.length - 1];
            const duration = Math.min(LEG_MAX_MS, Math.max(LEG_MIN_MS, total / METERS_PER_SECOND * 1000));

            const drawnBefore = routePolyline.getLatLngs().slice();
            const start = performance.now();
            let seg = 0;

            function step(now) {
                if (run !== animationRun) return;
                const t = Math.min(1, (now - start) / duration);
                const d = easeInOut(t) * total;
                while (seg < acc.length - 2 && acc[seg + 1] < d) seg++;

                // Punta interpolada dentro del segmento actual
                const a = latlngs[seg], b = latlngs[seg + 1];
                const segLen = acc[seg + 1] - acc[seg];
                const f = segLen ? (d - acc[seg]) / segLen : 1;
                const tip = L.latLng(a.lat + (b.lat - a.lat) * f, a.lng + (b.lng - a.lng) * f);

                routePolyline.setLatLngs(drawnBefore.concat(latlngs.slice(0, seg + 1), [tip]));
                if (follow) map.panTo(tip, { animate: false });

                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    routePolyline.setLatLngs(drawnBefore.concat(latlngs));
                    done();
                }
            }
            requestAnimationFrame(step);
        }

        addNode();
        return true;
    }

    /**
     * Descarga el mapa como imagen PNG usando html2canvas
     * @param {string} routeName - Nombre para el archivo
     */
    function downloadMap(routeName) {
        if (!map) return;
        const mapEl = map.getContainer();
        // allowTaint: true dejaba pasar un canvas contaminado, y toDataURL fallaba después.
        // Con useCORS, html2canvas omite las teselas que no den CORS y la descarga sigue funcionando.
        // html2canvas está cargado desde CDN en index.html
        if (typeof html2canvas === 'undefined') {
            alert('La librería de captura no está disponible. Asegúrate de tener conexión a internet.');
            return;
        }
        html2canvas(mapEl, {
            useCORS:    true,
            allowTaint: false,
            scale:      3
        }).then(canvas => {
            const link     = document.createElement('a');
            link.download  = `recorrido-${routeName.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href      = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(err => {
            console.error('Error al exportar el mapa:', err);
            alert('No se pudo exportar el mapa. Intenta de nuevo en unos segundos.');
        });
    }

    /**
     * Recentra el mapa en el Barrio Yungay
     */
    function resetView() {
        if (map) map.setView([CENTER.lat, CENTER.lng], ZOOM);
    }

    return { init, animateRoute, downloadMap, clearRoute, resetView };
})();
