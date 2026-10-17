/**
 * CAPA DE NEGOCIO (Business Logic Layer)
 * ConectaYungay - Servicios de Rutas y Distancias
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.Service = (function () {
    const { LUGARES, RECORRIDOS, DESCUENTOS, DISTANCIAS_A_PIE, TRAZADOS } = ConectaYungay.Data;

    /**
     * Devuelve los recorridos con su punto de partida (la primera parada).
     * "metros" es el largo a pie del recorrido, o null si no está precalculado.
     * @returns {Array<{id, nombre, paradas, metros, inicio: {name, lat, lng}}>}
     */
    function listarRutas() {
        return RECORRIDOS.reduce((rutas, r) => {
            const paradas = paradasConLugar(r.id);
            if (!paradas.length) return rutas;
            const { parada, lugar } = paradas[0];
            rutas.push({
                id: r.id,
                nombre: r.nombre,
                paradas: paradas.length,
                metros: getRouteLength(r.id),
                inicio: { name: parada.lugar, lat: lugar.lat, lng: lugar.lng }
            });
            return rutas;
        }, []);
    }

    /**
     * Ordena los recorridos de más cercano a más lejano según la distancia
     * desde el visitante hasta el punto de partida de cada uno.
     * Usa la distancia CAMINANDO; si el servicio de rutas no responde, usa la
     * línea recta y marca "aproximada: true" para que la vista lo indique.
     * @param {{lat, lng}} coords - ubicación del visitante
     * @returns {Promise<Array<{id, nombre, paradas, inicio, distance, aproximada}>>}
     */
    async function ordenarPorCercania(coords) {
        const rutas = listarRutas();
        const inicios = rutas.map(r => r.inicio);
        let distances;
        try {
            distances = await fetchWalkingDistances(coords, inicios);
        } catch (e) {
            console.warn('Distancia a pie no disponible; se usa línea recta.', e);
            distances = [];
        }
        return rutas
            .map((r, i) => {
                const aPie = Number.isFinite(distances[i]);
                const metros = aPie ? distances[i]
                    : calculateHaversineDistance(coords.lat, coords.lng, r.inicio.lat, r.inicio.lng);
                return { ...r, distance: Math.round(metros), aproximada: !aPie };
            })
            .sort((a, b) => a.distance - b.distance);
    }

    /**
     * Paradas de un recorrido en orden, cada una con su lugar de places.js.
     * Una parada sin coordenadas se omite y se registra como error: no se dibuja
     * en un punto inventado que haría ver una ruta falsa.
     */
    function paradasConLugar(recorridoId) {
        const recorrido = RECORRIDOS.find(r => r.id === recorridoId);
        if (!recorrido) {
            throw new Error(`No existe el recorrido "${recorridoId}".`);
        }

        return recorrido.paradas
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .filter(parada => {
                if (LUGARES[parada.lugar]) return true;
                console.error(`[Service] Sin coordenadas para el hito: "${parada.lugar}". Se omite.`);
                return false;
            })
            .map(parada => ({ parada, lugar: LUGARES[parada.lugar] }));
    }

    /**
     * Devuelve los hitos de un recorrido en orden, con sus coordenadas.
     * @param {string} recorridoId - id del recorrido (ej. 'ruta-a')
     * @returns {Array<{name, address, description, webUrl, instagramUrl, isStation, lat, lng, acceso}>}
     */
    function getRoute(recorridoId) {
        return paradasConLugar(recorridoId).map(({ parada, lugar: c }) => ({
            name: parada.lugar,
            address: c.direccion,
            description: c.descripcion || '',
            webUrl: c.web || null,
            instagramUrl: c.instagram || null,
            isStation: !!c.esEstacion,
            lat: c.lat,
            lng: c.lng,
            acceso: c.acceso || null
        }));
    }

    // ─────────────────────────────────────────────
    //  TRAZADO POR LAS CALLES
    // ─────────────────────────────────────────────
    const WALKING_ROUTE_URL = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/';

    /**
     * Puntos [lat, lng] de cada tramo del recorrido: de una parada a la
     * siguiente, pasando por sus esquinas "via". Cada parada aporta su punto
     * de acceso a la calle (o sus coordenadas si no tiene).
     * @returns {Array<Array<[number, number]>>} un tramo menos que paradas
     */
    function puntosDeTramos(recorridoId) {
        const paradas = paradasConLugar(recorridoId);
        const punto = c => {
            const p = c.acceso || c;
            return [p.lat, p.lng];
        };
        const tramos = [];
        for (let i = 1; i < paradas.length; i++) {
            tramos.push([
                punto(paradas[i - 1].lugar),
                ...(paradas[i].parada.via || []),
                punto(paradas[i].lugar)
            ]);
        }
        return tramos;
    }

    /**
     * Huella corta de los puntos de un recorrido. Si cambian las paradas, sus
     * accesos o las esquinas, la huella cambia y el trazado precalculado deja
     * de usarse (ver tools/generar-trazados.js).
     */
    function firmaDeTramos(tramos) {
        const texto = JSON.stringify(tramos);
        let h = 5381;
        for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
        return h.toString(36);
    }

    /**
     * Pide al servicio de rutas el camino a pie por las calles que une los
     * puntos de un tramo, en orden.
     * @returns {Promise<{puntos: Array<[number, number]>, metros: number}>}
     */
    async function fetchTramo(puntos) {
        const coords = puntos.map(([lat, lng]) => `${lng},${lat}`).join(';');
        const url = `${WALKING_ROUTE_URL}${coords}?overview=full&geometries=geojson`;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), WALKING_TIMEOUT_MS);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`Servicio de rutas respondió ${res.status}`);
            const json = await res.json();
            const ruta = json.code === 'Ok' && json.routes && json.routes[0];
            if (!ruta || !ruta.geometry || !ruta.geometry.coordinates.length) {
                throw new Error('Respuesta inválida del servicio de rutas');
            }
            return {
                puntos: ruta.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
                metros: ruta.distance
            };
        } finally {
            clearTimeout(timer);
        }
    }

    /**
     * Calcula en línea el trazado por las calles de un recorrido.
     * También lo usa tools/generar-trazados.js para precalcularlo.
     * @returns {Promise<{firma, metros, tramos: Array<Array<[number, number]>>}>}
     */
    async function trazarRecorrido(recorridoId) {
        const puntos = puntosDeTramos(recorridoId);
        // De a uno: el servicio rechaza (429) muchas consultas simultáneas
        const tramos = [];
        for (const p of puntos) tramos.push(await fetchTramo(p));
        return {
            firma: firmaDeTramos(puntos),
            metros: Math.round(tramos.reduce((total, t) => total + t.metros, 0)),
            tramos: tramos.map(t => t.puntos)
        };
    }

    /**
     * Trazado por las calles de un recorrido, listo para dibujar.
     * Orden de fuentes: trazado precalculado → servicio de rutas → líneas rectas
     * entre paradas y esquinas. Con líneas rectas marca "aproximada: true".
     * @returns {Promise<{tramos: Array<Array<[number, number]>>, aproximada: boolean}>}
     *   tramos[i] une la parada i con la i+1
     */
    async function getRouteGeometry(recorridoId) {
        const puntos = puntosDeTramos(recorridoId);
        const guardado = TRAZADOS && TRAZADOS[recorridoId];
        if (guardado && guardado.firma === firmaDeTramos(puntos)) {
            return { tramos: guardado.tramos, aproximada: false };
        }
        try {
            const trazado = await trazarRecorrido(recorridoId);
            return { tramos: trazado.tramos, aproximada: false };
        } catch (e) {
            console.warn('Trazado por las calles no disponible; se usan líneas rectas.', e);
            return { tramos: puntos, aproximada: true };
        }
    }

    /**
     * Metros a pie de un recorrido completo, según el trazado precalculado.
     * @returns {number|null} null si no hay trazado vigente
     */
    function getRouteLength(recorridoId) {
        const guardado = TRAZADOS && TRAZADOS[recorridoId];
        if (!guardado || guardado.firma !== firmaDeTramos(puntosDeTramos(recorridoId))) return null;
        return guardado.metros;
    }

    /**
     * Devuelve los locales con descuento que tienen coordenadas válidas,
     * para que ninguno aparezca con una distancia falsa.
     * @returns {Array<{category, name, address, lat, lng}>}
     */
    function getDiscounts() {
        return DESCUENTOS.filter(d => {
            const ok = Number.isFinite(d.lat) && Number.isFinite(d.lng);
            if (!ok) console.error(`[Service] Sin coordenadas para el descuento: "${d.name}". Se omite.`);
            return ok;
        }).map(d => ({ ...d }));
    }

    /**
     * Calcula la distancia en metros entre dos puntos geográficos usando la fórmula de Haversine
     * @param {number} lat1 - Latitud punto 1
     * @param {number} lon1 - Longitud punto 1
     * @param {number} lat2 - Latitud punto 2
     * @param {number} lon2 - Longitud punto 2
     * @returns {number} Distancia en metros
     */
    function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Radio de la Tierra en metros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en metros
    }

    // Servicio de rutas a pie de OpenStreetMap (OSRM, perfil peatonal). Responde
    // con CORS abierto y no necesita clave. Solo se usa para lugares que todavía
    // no están en la tabla precalculada (js/data/walkingDistances.js).
    const WALKING_TABLE_URL = 'https://routing.openstreetmap.de/routed-foot/table/v1/foot/';
    const WALKING_TIMEOUT_MS = 10000;

    /**
     * Busca en la tabla precalculada los metros a pie desde un lugar a cada local.
     * @returns {number[]|null} null si falta el lugar o algún local en la tabla
     */
    function lookupWalkingDistances(placeName, discountsList) {
        const row = DISTANCIAS_A_PIE && DISTANCIAS_A_PIE[placeName];
        if (!row) return null;
        const distances = discountsList.map(d => row[d.name]);
        return distances.every(Number.isFinite) ? distances : null;
    }

    // Distancias a pie ya consultadas: "lat,lng" del hito → [metros a cada local]
    const walkingCache = {};

    /**
     * Pide al servicio de rutas la distancia caminando por las calles desde un
     * punto a cada local (una sola consulta para todos los locales).
     * @returns {Promise<number[]>} metros a cada local, en el mismo orden de la lista
     */
    async function fetchWalkingDistances(coords, discountsList) {
        const key = `${coords.lat},${coords.lng}|${discountsList.length}`;
        if (walkingCache[key]) return walkingCache[key];

        const points = [coords, ...discountsList]
            .map(p => `${p.lng},${p.lat}`)
            .join(';');
        const destinations = discountsList.map((_, i) => i + 1).join(';');
        const url = `${WALKING_TABLE_URL}${points}?sources=0&destinations=${destinations}&annotations=distance`;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), WALKING_TIMEOUT_MS);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`Servicio de rutas respondió ${res.status}`);
            const json = await res.json();
            const row = json.code === 'Ok' && json.distances && json.distances[0];
            if (!row || row.length !== discountsList.length) {
                throw new Error('Respuesta inválida del servicio de rutas');
            }
            walkingCache[key] = row;
            return row;
        } finally {
            clearTimeout(timer);
        }
    }

    /**
     * Elige la cafetería, el restaurante y la heladería más cercanos a un hito,
     * según la distancia CAMINANDO por las calles (no en línea recta).
     * Orden de fuentes: tabla precalculada → servicio de rutas → línea recta.
     * Con línea recta marca "aproximada: true" para que la vista lo indique.
     * @param {Object} node - Hito { name, lat, lng }
     * @param {Array} discountsList - Lista de locales (ver getDiscounts)
     * @returns {Promise<{cafeteria, restaurante, heladeria}>} cada uno con "distance" en metros
     */
    async function getClosestDiscounts(node, discountsList) {
        let distances = lookupWalkingDistances(node.name, discountsList);
        let aproximada = false;
        if (!distances) {
            try {
                distances = await fetchWalkingDistances(node, discountsList);
            } catch (e) {
                console.warn('Distancia a pie no disponible; se usa línea recta.', e);
                aproximada = true;
                distances = discountsList.map(p =>
                    calculateHaversineDistance(node.lat, node.lng, p.lat, p.lng));
            }
        }

        const closest = { cafeterias: null, restaurantes: null, heladerias: null };
        discountsList.forEach((place, i) => {
            // El servicio devuelve null si no encuentra camino a pie hacia ese local
            if (distances[i] === null || !(place.category in closest)) return;
            const distance = Math.round(distances[i]);
            if (!closest[place.category] || distance < closest[place.category].distance) {
                closest[place.category] = { ...place, distance, aproximada };
            }
        });

        return {
            cafeteria: closest.cafeterias,
            restaurante: closest.restaurantes,
            heladeria: closest.heladerias
        };
    }

    return {
        listarRutas,
        ordenarPorCercania,
        getRoute,
        getRouteGeometry,
        getRouteLength,
        trazarRecorrido,
        getDiscounts,
        calculateHaversineDistance,
        getClosestDiscounts
    };
})();
