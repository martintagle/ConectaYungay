/**
 * CAPA DE DATOS (Modelo — Recorridos)
 * ConectaYungay — Recorridos disponibles y sus paradas
 *
 * Estructura: recorrido → lista de paradas { orden, lugar, via? }.
 *   - "lugar" es la clave del lugar en places.js.
 *   - "via" (opcional) son esquinas [lat, lng] por las que pasa el trazado
 *     ANTES de llegar a esa parada. Fijan las calles del recorrido tal como
 *     aparecen en los mapas del documento "Barrio Yungay Histórico"; sin
 *     ellas, el trazado toma el camino a pie más corto.
 *
 * Las esquinas salen de las intersecciones de calles de OpenStreetMap.
 * Al cambiar paradas o esquinas, regenerar el trazado por las calles:
 *     node tools/generar-trazados.js
 *
 * El visitante elige la ruta en la pantalla de inicio, ordenada por cercanía
 * a su ubicación; el nombre de cada ruta no cambia con el orden.
 */

window.ConectaYungay = window.ConectaYungay || {};
ConectaYungay.Data = ConectaYungay.Data || {};

ConectaYungay.Data.RECORRIDOS = [
    {
        id: 'ruta-a',
        nombre: 'Ruta A',
        paradas: [
            { orden: 1, lugar: "Cité Las Palmas" },
            { orden: 2, lugar: "Museo de la Memoria y los Derechos Humanos",
              via: [[-33.440328, -70.679903]] },                              // Matucana / Catedral
            { orden: 3, lugar: "Pasaje Adriana Cousiño",
              via: [[-33.440218, -70.678785],                                 // Catedral / Chacabuco
                    [-33.441447, -70.678676],                                 // Chacabuco / Compañía
                    [-33.441281, -70.677144]] },                              // Compañía / Adriana Cousiño
            { orden: 4, lugar: "Museo de la Educación Gabriela Mistral",
              via: [[-33.441281, -70.677144]] }                               // Compañía / Adriana Cousiño
        ]
    },
    {
        id: 'ruta-b',
        nombre: 'Ruta B',
        paradas: [
            { orden: 1, lugar: "Espacio 330" },
            { orden: 2, lugar: "Museo del Sonido",
              via: [[-33.441215, -70.676563],                                 // Maipú / Compañía
                    [-33.441163, -70.676089],                                 // Compañía / Lucrecia Valdés
                    [-33.442368, -70.675980]] },                              // Lucrecia Valdés / Huérfanos
            { orden: 3, lugar: "Yungay Histórico" },
            { orden: 4, lugar: "Cité Lucrecia Valdés de Barros Borgoño",
              via: [[-33.442368, -70.675980]] },                              // Huérfanos / Lucrecia Valdés
            { orden: 5, lugar: "Club Yungay",
              via: [[-33.442368, -70.675980],                                 // Lucrecia Valdés / Huérfanos
                    [-33.442323, -70.675466],                                 // Huérfanos / Esperanza
                    [-33.443193, -70.675415]] }                               // Esperanza / Portales
        ]
    },
    {
        id: 'ruta-c',
        nombre: 'Ruta C',
        paradas: [
            { orden: 1, lugar: "Iglesia de San Antonio de Padua" },
            { orden: 2, lugar: "Casa del Maestro" },
            { orden: 3, lugar: "Palacio Álamos",
              via: [[-33.439340, -70.670381],                                 // Catedral / Gral. Bulnes
                    [-33.437781, -70.670590]] },                              // Gral. Bulnes / Santo Domingo
            { orden: 4, lugar: "Casa de Ignacio Domeyko",
              via: [[-33.437781, -70.670590],                                 // Santo Domingo / Gral. Bulnes
                    [-33.437928, -70.672672]] },                              // Santo Domingo / Cueto
            { orden: 5, lugar: "Plaza Yungay",
              via: [[-33.437928, -70.672672]] },                              // Cueto / Santo Domingo
            { orden: 6, lugar: "Parroquia San Saturnino" },
            { orden: 7, lugar: "Peluquería Francesa",
              via: [[-33.438051, -70.674439],                                 // Santo Domingo / Libertad
                    [-33.439745, -70.674287],                                 // Libertad / Catedral
                    [-33.440949, -70.674180]] }                               // Libertad / Compañía
        ]
    },
    {
        id: 'ruta-d',
        nombre: 'Ruta D',
        paradas: [
            { orden: 1, lugar: "Museo de Arte Contemporáneo (MAC)" },
            { orden: 2, lugar: "Museo Taller",
              via: [[-33.441578, -70.679792]] },                              // Matucana / Compañía
            { orden: 3, lugar: "Casona Compañía" },
            { orden: 4, lugar: "DecoCalen" },
            { orden: 5, lugar: "Yungay Histórico",
              via: [[-33.440851, -70.673313],                                 // Compañía / Rafael Sotomayor
                    [-33.442048, -70.673201]] }                               // Rafael Sotomayor / Huérfanos
        ]
    }
];
