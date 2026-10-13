/**
 * Genera js/data/routeGeometries.js: el trazado POR LAS CALLES de cada
 * recorrido de routes.js, de parada en parada y pasando por sus esquinas.
 *
 * Usa el servicio de rutas peatonales de OpenStreetMap (OSRM), con la misma
 * lógica que la app (ConectaYungay.Service.trazarRecorrido). Ejecutar desde la
 * raíz del proyecto cada vez que cambien paradas, accesos o esquinas:
 *
 *     node tools/generar-trazados.js
 *
 * Si no se regenera, la app lo nota (la huella no coincide) y pide el
 * trazado al servicio en línea cada vez que se abre una ruta.
 *
 * Requiere Node 18 o superior (usa fetch) y conexión a internet.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'js', 'data', 'routeGeometries.js');

function cargarServicio() {
    const ctx = { fetch, AbortController, setTimeout, clearTimeout, console };
    ctx.window = ctx;
    vm.createContext(ctx);
    const archivos = ['js/data/places.js', 'js/data/routes.js', 'js/data/discounts.js', 'js/business/routeService.js'];
    for (const file of archivos) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
    }
    return ctx.ConectaYungay;
}

async function main() {
    const { Data, Service } = cargarServicio();
    const trazados = {};
    for (const recorrido of Data.RECORRIDOS) {
        trazados[recorrido.id] = await Service.trazarRecorrido(recorrido.id);
        const t = trazados[recorrido.id];
        console.log(`${recorrido.nombre}: ${t.tramos.length} tramos, ${t.metros} m a pie`);
        await new Promise(r => setTimeout(r, 2000)); // pausa para no saturar el servicio
    }

    const redondear = n => Math.round(n * 1e6) / 1e6;
    const cuerpo = Object.entries(trazados).map(([id, t]) => {
        const tramos = t.tramos
            .map(tramo => `            ${JSON.stringify(tramo.map(([lat, lng]) => [redondear(lat), redondear(lng)]))}`)
            .join(',\n');
        return `    ${JSON.stringify(id)}: {\n        firma: ${JSON.stringify(t.firma)},\n        metros: ${t.metros},\n        tramos: [\n${tramos}\n        ]\n    }`;
    }).join(',\n');

    const contenido = `/**
 * CAPA DE DATOS (Modelo — Trazado de los recorridos)
 * ConectaYungay — Camino a pie por las calles de cada recorrido, tramo a tramo
 *
 * ARCHIVO GENERADO: no editar a mano. Para actualizarlo ejecutar
 *     node tools/generar-trazados.js
 * Fuente: rutas peatonales de OpenStreetMap (OSRM). Generado el ${new Date().toISOString().slice(0, 10)}.
 *
 * tramos[i] son los puntos [lat, lng] desde la parada i hasta la i+1.
 * "firma" identifica las paradas y esquinas con que se generó: si routes.js
 * o places.js cambian, la app deja de usar este trazado.
 */

window.ConectaYungay = window.ConectaYungay || {};
ConectaYungay.Data = ConectaYungay.Data || {};

ConectaYungay.Data.TRAZADOS = {
${cuerpo}
};
`;
    fs.writeFileSync(OUTPUT, contenido.replace(/\n/g, '\r\n'));
    console.log(`Listo: ${Object.keys(trazados).length} recorridos → ${path.relative(ROOT, OUTPUT)}`);
}

main().catch(e => {
    console.error('No se pudo generar el trazado:', e.message);
    process.exit(1);
});
