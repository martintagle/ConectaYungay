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
        letra: 'A',
        nombre: 'Memorias, educación y cités',
        paradas: [
            { orden: 1, lugar: "Cité Las Palmas" },
            { orden: 2, lugar: "Museo de la Memoria y los Derechos Humanos",
              via: [[-33.440328, -70.679903]],                                // Matucana / Catedral
              breaks: [
                  "Restaurant El Huaso Enrique",
                  "Restaurante Zarita",
                  "La Tetería Cleopatra"
              ] },
            { orden: 3, lugar: "Museo de la Educación Gabriela Mistral",
              via: [[-33.440218, -70.678785],                                 // Catedral / Chacabuco
                    [-33.441447, -70.678676]],                                // Chacabuco / Compañía
              breaks: [
                  "Restaurant El Huaso Enrique",
                  "Restaurante Zarita",
                  "La Tetería Cleopatra",
                  "Cafetería Popular",
                  "Restaurante La Gárgola",
                  "Espacio 330",
                  "El Chancho Seis",
                  "Restaurante El Verde"
              ] },
            { orden: 4, lugar: "Pasaje Adriana Cousiño",
              via: [[-33.441281, -70.677144]],                                // Compañía / Adriana Cousiño
              breaks: [
                  "Restaurante Zarita",
                  "La Tetería Cleopatra",
                  "Cafetería Popular",
                  "Restaurante La Gárgola",
                  "Espacio 330",
                  "El Chancho Seis",
                  "Restaurante El Verde"
              ] }
        ]
    },
    {
        id: 'ruta-b',
        letra: 'B',
        nombre: 'Identidad, Sonido y Vibra de barrio',
        paradas: [
            { orden: 1, lugar: "Espacio 330",
              breaks: [
                  "Planta Café",
                  "Cafetería Popular",
                  "Restaurante La Gárgola",
                  "Mingus Café"
              ] },
            { orden: 2, lugar: "Cité Lucrecia Valdés de Barros Borgoño",
              via: [[-33.441215, -70.676563],                                 // Maipú / Compañía
                    [-33.441163, -70.676089]],                                // Compañía / Lucrecia Valdés
              breaks: [
                  "Mingus Café",
                  "Darkolics Restobar",
                  "El Putamadre Restorant",
                  "Yungay Histórico",
                  "Cafetería Popular",
                  "Restaurante La Gárgola"
              ] },
            { orden: 3, lugar: "Museo del Sonido",
              via: [[-33.442368, -70.675980]],                                // Lucrecia Valdés / Huérfanos
              breaks: [
                  "Mingus Café",
                  "El Putamadre Restorant",
                  "Darkolics Restobar"
              ] },
            { orden: 4, lugar: "Yungay Histórico",
              breaks: [
                  "Mingus Café",
                  "El Putamadre Restorant",
                  "Darkolics Restobar"
              ] },
            { orden: 5, lugar: "Club Yungay",
              via: [[-33.442323, -70.675466],                                 // Huérfanos / Esperanza
                    [-33.443193, -70.675415]],                                // Esperanza / Portales
              breaks: [
                  "Selvaggio Panadería",
                  "Café Brunet",
                  "Boulevard Lavaud Restaurant"
              ] }
        ]
    },
    {
        id: 'ruta-c',
        letra: 'C',
        nombre: 'Historia, arquitectura y fé',
        paradas: [
            { orden: 1, lugar: "Iglesia de San Antonio de Padua",
              breaks: [
                  "Fuente Mardoqueo",
                  "Un Café y Algo Más",
                  "Café Brunet"
              ] },
            { orden: 2, lugar: "Casa del Maestro",
              breaks: [
                  "Fuente Mardoqueo",
                  "Un Café y Algo Más",
                  "Café Brunet",
                  "Boulevard Lavaud Restaurant"
              ] },
            { orden: 3, lugar: "Palacio Álamos",
              via: [[-33.439340, -70.670381],                                 // Catedral / Gral. Bulnes
                    [-33.437781, -70.670590]],                                // Gral. Bulnes / Santo Domingo
              breaks: [
                  "Fuente Mardoqueo",
                  "Un Café y Algo Más",
                  "Café Brunet",
                  "Boulevard Lavaud Restaurant"
              ] },
            { orden: 4, lugar: "Casa de Ignacio Domeyko",
              via: [[-33.437781, -70.670590],                                 // Santo Domingo / Gral. Bulnes
                    [-33.437928, -70.672672]],                                // Santo Domingo / Cueto
              breaks: [
                  "Fuente Mardoqueo",
                  "Un Café y Algo Más",
                  "Café Brunet",
                  "Boulevard Lavaud Restaurant"
              ] },
            { orden: 5, lugar: "Plaza Yungay",
              via: [[-33.437928, -70.672672]],                                // Cueto / Santo Domingo
              breaks: [
                  "Fuente Mardoqueo",
                  "Un Café y Algo Más",
                  "Boulevard Lavaud Restaurant"
              ] },
            { orden: 6, lugar: "Parroquia San Saturnino",
              breaks: [
                  "Fuente Mardoqueo",
                  "Un Café y Algo Más",
                  "Boulevard Lavaud Restaurant",
                  "Café Cité"
              ] },
            { orden: 7, lugar: "Peluquería Francesa",
              via: [[-33.438051, -70.674439],                                 // Santo Domingo / Libertad
                    [-33.439745, -70.674287],                                 // Libertad / Catedral
                    [-33.440949, -70.674180]],                                // Libertad / Compañía
              breaks: [
                  "Café Cité",
                  "Café Brunet",
                  "Un Café y Algo Más"
              ] }
        ]
    },
    {
        id: 'ruta-d',
        letra: 'D',
        nombre: 'Cultura, arte y oficios',
        paradas: [
            { orden: 1, lugar: "Museo de Arte Contemporáneo (MAC)",
              breaks: [
                  "Restaurant El Huaso Enrique",
                  "Restaurante Zarita",
                  "La Tetería Cleopatra",
                  "Cafetería Popular",
                  "Restaurante La Gárgola",
                  "Espacio 330",
                  "El Chancho Seis",
                  "Restaurante El Verde"
              ] },
            { orden: 2, lugar: "DecoCalen",
              via: [[-33.441578, -70.679792]],                                // Matucana / Compañía
              breaks: [
                  "Cafetería Popular",
                  "Restaurante La Gárgola",
                  "Espacio 330",
                  "Darkolics Restobar",
                  "Café Cité"
              ] },
            { orden: 3, lugar: "Casona Compañía",
              breaks: [
                  "Café Cité",
                  "Boulevard Lavaud Restaurant",
                  "Café Brunet"
              ] },
            { orden: 4, lugar: "Museo Taller",
              breaks: [
                  "Café Brunet",
                  "Café Cité",
                  "Selvaggio Panadería",
                  "Club Yungay"
              ] },
            { orden: 5, lugar: "Yungay Histórico",
              via: [[-33.440851, -70.673313],                                 // Compañía / Rafael Sotomayor
                    [-33.442048, -70.673201]],                                // Rafael Sotomayor / Huérfanos
              breaks: [
                  "El Putamadre Restorant",
                  "Mingus Café",
                  "El Chancho Seis",
                  "Restaurante El Verde",
                  "Darkolics Restobar"
              ] }
        ]
    }
];
