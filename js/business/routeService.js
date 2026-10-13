/**
 * CAPA DE NEGOCIO (Business Logic Layer)
 * ConectaYungay - Servicios de Rutas y Distancias
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.Service = (function () {
    const { LUGARES, RECORRIDOS, DESCUENTOS, DISTANCIAS_A_PIE } = ConectaYungay.Data;
    const VISITAS_KEY = 'conectayungay_visitas_por_estacion';

    // Recorrido ya elegido en esta carga de la página, por estación. Así,
    // volver a elegir la misma estación con "Cambiar Origen" no salta de ruta.
    const elegidos = {};

    /**
     * Elige el recorrido para una estación, alternando entre los recorridos de
     * esa estación cada vez que el visitante abre la página (A, B, A, B…).
     * El conteo se guarda en el navegador del visitante (localStorage); si no
     * está disponible (modo incógnito, datos borrados) se entrega el primero.
     * @param {'cumming'|'quintanormal'} estacion
     * @returns {{id, estacion, nombre}}
     */
    function elegirRecorrido(estacion) {
        if (elegidos[estacion]) return elegidos[estacion];

        const opciones = RECORRIDOS.filter(r => r.estacion === estacion);
        if (!opciones.length) {
            throw new Error(`No hay recorridos para la estación "${estacion}".`);
        }

        const visitas = leerVisitas();
        const previas = visitas[estacion] || 0;
        const recorrido = opciones[previas % opciones.length];

        visitas[estacion] = previas + 1;
        guardarVisitas(visitas);

        elegidos[estacion] = { id: recorrido.id, estacion, nombre: recorrido.nombre };
        return elegidos[estacion];
    }

    /**
     * Pasa al recorrido siguiente de la estación, en forma circular (A, B, C, A…).
     * También avanza el conteo guardado, para que la próxima visita siga desde aquí.
     * @param {'cumming'|'quintanormal'} estacion
     * @returns {{id, estacion, nombre}}
     */
    function siguienteRecorrido(estacion) {
        const actual = elegirRecorrido(estacion);
        const opciones = RECORRIDOS.filter(r => r.estacion === estacion);
        const indice = opciones.findIndex(r => r.id === actual.id);
        const recorrido = opciones[(indice + 1) % opciones.length];

        const visitas = leerVisitas();
        visitas[estacion] = (visitas[estacion] || 0) + 1;
        guardarVisitas(visitas);

        elegidos[estacion] = { id: recorrido.id, estacion, nombre: recorrido.nombre };
        return elegidos[estacion];
    }

    function leerVisitas() {
        try {
            return JSON.parse(localStorage.getItem(VISITAS_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function guardarVisitas(visitas) {
        try {
            localStorage.setItem(VISITAS_KEY, JSON.stringify(visitas));
        } catch (e) { }
    }

    /**
     * Devuelve los hitos de un recorrido en orden, con sus coordenadas.
     * Un hito sin coordenadas se omite y se registra como error: no se dibuja
     * en un punto inventado que haría ver una ruta falsa.
     * @param {string} recorridoId - id del recorrido (ej. 'cumming-a')
     * @returns {Array<{name, address, description, isStation, lat, lng}>}
     */
    function getRoute(recorridoId) {
        const recorrido = RECORRIDOS.find(r => r.id === recorridoId);
        if (!recorrido) {
            throw new Error(`No existe el recorrido "${recorridoId}".`);
        }

        return recorrido.paradas
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .reduce((nodes, parada) => {
                const c = LUGARES[parada.lugar];
                if (!c) {
                    console.error(`[Service] Sin coordenadas para el hito: "${parada.lugar}". Se omite.`);
                    return nodes;
                }
                nodes.push({ name: parada.lugar, address: c.direccion, description: c.descripcion || '', isStation: !!c.esEstacion, lat: c.lat, lng: c.lng });
                return nodes;
            }, []);
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
        elegirRecorrido,
        siguienteRecorrido,
        getRoute,
        getDiscounts,
        calculateHaversineDistance,
        getClosestDiscounts
    };
})();
