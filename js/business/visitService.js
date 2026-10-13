/**
 * CAPA DE NEGOCIO (Business Layer — Visitas y clics)
 * ConectaYungay — Registra la visita y los clics en los hitos del recorrido
 *
 * Flujo:
 *   1. La encuesta guarda sus respuestas en el navegador (guardarRespuestas).
 *   2. Al elegir una ruta (ruta-a … ruta-d) se crea una fila en "visitas"
 *      con esas respuestas y la ruta como origen (iniciarVisita).
 *   3. Abrir el cartel de un hito crea una fila en "clics_info" con
 *      accion = 'apertura'; pulsar "Más información" crea otra con
 *      accion = 'mas_info' (registrarClic). Si no hubo encuesta, el clic
 *      queda sin visita asociada.
 *
 * Los errores de red no bloquean la app: solo se registran en consola.
 *
 * Conexión a Supabase: la clave publicable (anon) es pública por diseño. La
 * protección real está en las tablas: RLS activo y una política que solo
 * permite INSERT a usuarios anónimos (ver supabase/visitas_y_clics.sql).
 * Nadie puede leer los datos desde el navegador.
 */

window.ConectaYungay = window.ConectaYungay || {};

ConectaYungay.VisitService = (function () {
    const RESPUESTAS_KEY = 'conectayungay_respuestas';

    const SUPABASE_URL = 'https://nsevebyyjlixehekoqxi.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_b1o9cpMZKk9uZu9Ov8gwqw_atm0K_HQ';
    const TIMEOUT_MS = 8000;

    // Promesa con el id de la visita en curso (null si no hay visita o no se guardó)
    let visitaPendiente = Promise.resolve(null);

    // ─────────────────────────────────────────────
    //  CATÁLOGOS DE LA ENCUESTA (países y comunas)
    // ─────────────────────────────────────────────
    function obtenerCatalogos() {
        const { PAISES, COMUNAS_POR_REGION } = ConectaYungay.SurveyCatalogs;
        return { PAISES, COMUNAS_POR_REGION };
    }

    // ─────────────────────────────────────────────
    //  RESPUESTAS DE LA ENCUESTA (guardadas en el navegador)
    // ─────────────────────────────────────────────
    function guardarRespuestas(respuestas) {
        try {
            localStorage.setItem(RESPUESTAS_KEY, JSON.stringify(respuestas));
        } catch (e) { }
    }

    function leerRespuestas() {
        try {
            const raw = localStorage.getItem(RESPUESTAS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    // ─────────────────────────────────────────────
    //  VISITA Y CLICS
    // ─────────────────────────────────────────────
    /**
     * Crea la fila de "visitas" para la ruta elegida, si el visitante respondió la encuesta.
     * @param {string} origen - id de la ruta (ej. 'ruta-a')
     */
    function iniciarVisita(origen) {
        const respuestas = leerRespuestas();
        if (!respuestas) {
            visitaPendiente = Promise.resolve(null);
            return;
        }

        const id = generarUUID();
        const fila = {
            id,
            edad: respuestas.edad,
            nacionalidad: respuestas.nacionalidad,
            comuna: respuestas.comuna,
            motivo: respuestas.motivo,
            origen
        };

        visitaPendiente = insertar('visitas', fila)
            .then(() => id)
            .catch(err => {
                console.warn('Visita no guardada:', err);
                return null;
            });
    }

    /**
     * Registra un clic en el cartel de un hito del recorrido. Espera a que la
     * visita esté guardada para poder asociarla (clave foránea).
     * @param {string} puntoInteres - nombre del hito
     * @param {'apertura'|'mas_info'} accion - se abrió el cartel / se pidió más información
     */
    function registrarClic(puntoInteres, accion) {
        visitaPendiente
            .then(visitaId => insertar('clics_info', {
                visita_id: visitaId,
                punto_interes: puntoInteres,
                accion
            }))
            .catch(err => console.warn('Clic no guardado:', err));
    }

    // ─────────────────────────────────────────────
    //  SUPABASE
    // ─────────────────────────────────────────────
    /**
     * Inserta una fila en una tabla de Supabase.
     * @param {'visitas'|'clics_info'} tabla
     * @param {object} fila
     * @returns {Promise<void>} rechaza si Supabase responde con error o no hay conexión
     */
    async function insertar(tabla, fila) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(fila),
                signal: controller.signal
            });
            if (!res.ok) {
                throw new Error(`Supabase respondió ${res.status} al insertar en ${tabla}`);
            }
        } finally {
            clearTimeout(timer);
        }
    }

    // ─────────────────────────────────────────────
    //  UTILIDADES
    // ─────────────────────────────────────────────
    function generarUUID() {
        if (window.crypto && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        // Fallback UUID v4 para navegadores sin randomUUID
        const b = crypto.getRandomValues(new Uint8Array(16));
        b[6] = (b[6] & 0x0f) | 0x40;
        b[8] = (b[8] & 0x3f) | 0x80;
        const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
        return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }

    return { obtenerCatalogos, guardarRespuestas, iniciarVisita, registrarClic };

})();
