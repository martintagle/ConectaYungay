/**
 * CAPA DE DATOS (Modelo — Recorridos)
 * ConectaYungay — Recorridos disponibles y sus paradas
 *
 * Estructura: recorrido → lista de paradas { orden, lugar }.
 *   - "lugar" es la clave del lugar en places.js.
 *   - "estacion" es la estación de metro desde donde parte (la que llega por
 *     el QR: ?origin=cumming | quintanormal).
 *
 * Cada estación puede tener varios recorridos: al volver a abrir la página
 * desde la misma estación, el visitante recibe el siguiente de la lista
 * (A, B, C, A…). Para agregar uno nuevo basta con sumar un objeto aquí.
 */

window.ConectaYungay = window.ConectaYungay || {};
ConectaYungay.Data = ConectaYungay.Data || {};

ConectaYungay.Data.RECORRIDOS = [
    {
        id: 'quintanormal-a',
        estacion: 'quintanormal',
        nombre: 'Recorrido A',
        paradas: [
            { orden: 1, lugar: "Metro Quinta Normal" },
            { orden: 2, lugar: "Cité Las Palmas" },
            { orden: 3, lugar: "Museo de la Memoria y los Derechos Humanos" },
            { orden: 4, lugar: "Pasaje Adriana Cousiño" },
            { orden: 5, lugar: "Museo de la Educación Gabriela Mistral" }
        ]
    },
    {
        id: 'quintanormal-b',
        estacion: 'quintanormal',
        nombre: 'Recorrido B',
        paradas: [
            { orden: 1, lugar: "Metro Quinta Normal" },
            { orden: 2, lugar: "Espacio 330" },
            { orden: 3, lugar: "Museo del Sonido" },
            { orden: 4, lugar: "Yungay Histórico" },
            { orden: 5, lugar: "Cité Lucrecia Valdés de Barros Borgoño" },
            { orden: 6, lugar: "Club Yungay" }
        ]
    },
    {
        id: 'quintanormal-c',
        estacion: 'quintanormal',
        nombre: 'Recorrido C',
        paradas: [
            { orden: 1, lugar: "Metro Quinta Normal" },
            { orden: 2, lugar: "Museo de Arte Contemporáneo (MAC)" },
            { orden: 3, lugar: "Museo Taller" },
            { orden: 4, lugar: "Casona Compañía" },
            { orden: 5, lugar: "DecoCalen" },
            { orden: 6, lugar: "Yungay Histórico" }
        ]
    },
    {
        id: 'cumming-a',
        estacion: 'cumming',
        nombre: 'Recorrido A',
        paradas: [
            { orden: 1, lugar: "Metro Cumming" },
            { orden: 2, lugar: "Iglesia de San Antonio de Padua" },
            { orden: 3, lugar: "Casa del Maestro" },
            { orden: 4, lugar: "Palacio Álamos" },
            { orden: 5, lugar: "Casa de Ignacio Domeyko" },
            { orden: 6, lugar: "Plaza Yungay" },
            { orden: 7, lugar: "Parroquia San Saturnino" },
            { orden: 8, lugar: "Peluquería Francesa" }
        ]
    }
];
