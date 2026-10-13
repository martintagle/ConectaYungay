/**
 * CAPA DE DATOS (Modelo — Lugares)
 * ConectaYungay — Hitos que pueden formar parte de un recorrido
 *
 * Solo estructura: cada lugar tiene su dirección, coordenadas GPS (lat/lng) y
 * el texto que se muestra en su cartel informativo (descripcion). Las estaciones
 * de metro (esEstacion) no abren cartel.
 * Las coordenadas se obtuvieron geocodificando la dirección en OpenStreetMap
 * (Nominatim/Overpass) y apuntan al edificio o a la cuadra del lugar.
 * "acceso" (opcional) es el punto de la calle frente al lugar por donde pasa el
 * trazado del recorrido; sin él, el trazado usa las coordenadas del lugar.
 * Los textos vienen del documento "Barrio Yungay Histórico" (guiones informativos).
 * El nombre es la clave que usan los recorridos (ver routes.js).
 */

window.ConectaYungay = window.ConectaYungay || {};
ConectaYungay.Data = ConectaYungay.Data || {};

ConectaYungay.Data.LUGARES = {
    // Estaciones de metro (punto de partida de los recorridos)
    "Metro Quinta Normal": {
        direccion: 'Av. Matucana 501', lat: -33.440368, lng: -70.680291,
        esEstacion: true, descripcion: ''
    },
    "Metro Cumming": {
        direccion: 'Catedral con Av. Ricardo Cumming', lat: -33.439144, lng: -70.668534,
        esEstacion: true, descripcion: ''
    },

    // Cités y pasajes
    "Cité Las Palmas": {
        direccion: 'Av. Matucana 524', lat: -33.439760, lng: -70.680384,
        acceso: { lat: -33.439760, lng: -70.679960 },
        descripcion: 'Estás frente al Cité Las Palmas. Un cité es un pasaje cerrado con viviendas agrupadas en torno a un espacio común, una forma de vivir en comunidad muy propia del barrio. Este se construyó en 1914 por encargo del español José Pastor y lo diseñó el arquitecto Julio Bertrand Vidal, con el refinamiento de la arquitectura parisina Beaux Arts. Tiene seis casas interiores y dos hacia la calle.'
    },
    "Pasaje Adriana Cousiño": {
        direccion: 'Adriana Cousiño 375', lat: -33.441865, lng: -70.677096,
        descripcion: 'Entras al pasaje Adriana. Nació a comienzos del siglo XX como el Gran Cité Modelo, obra de los arquitectos Cruz Montt y Larraín Bravo, y en los años treinta pasó a ser pasaje. Al centro hay un pequeño jardín con palmeras que separa las casas de uno y otro lado y les da intimidad; estaban pensadas para familias de clase media. Su estilo neorromántico es de los más notables de su tipo. Hoy es parte de una zona típica protegida desde el año 2000.'
    },
    "Cité Lucrecia Valdés de Barros Borgoño": {
        direccion: 'Lucrecia Valdés de Barros Borgoño 343-367', lat: -33.441765, lng: -70.676035,
        descripcion: 'Entras al pasaje Lucrecia Valdés, en Huérfanos 2871. Lo impulsó en 1924 el político Luis Barros Borgoño, para que vivieran los ejecutivos de la Caja de Ahorros que él presidía, y lo bautizó con el nombre de su esposa, Lucrecia Valdés. Observa sus fachadas historicistas, que retoman estilos de otras épocas. Hoy el pasaje forma parte de una zona típica protegida desde el año 2000. En el número 370 vivió el escritor Alberto Romero, autor de «La viuda del conventillo».'
    },

    // Historia y patrimonio
    "Casa de Ignacio Domeyko": {
        direccion: 'Cueto 572', lat: -33.438513, lng: -70.672721,
        acceso: { lat: -33.438513, lng: -70.672617 },
        descripcion: 'Estás frente a la casa de Ignacio Domeyko, Monumento Histórico. Es una construcción sencilla y austera, de adobe, y fue su hogar durante décadas. Este geólogo polaco llegó a Chile en 1838 a impulsar la minería, y fue rector de la Universidad de Chile entre 1867 y 1883. En esta casa se reunían jefes de Estado, ministros e intelectuales, y el propio Domeyko diseñó el patio. En 1888, de regreso de Polonia, dejó allí un saco con tierra de su patria. Murió aquí en 1889.'
    },
    "Plaza Yungay": {
        direccion: 'Santo Domingo 2745-2799', lat: -33.437687, lng: -70.674019,
        acceso: { lat: -33.438024, lng: -70.674019 },
        descripcion: 'Estás en la Plaza Yungay, el corazón del primer barrio republicano de Chile, planificado por Jacinto Cueto y Juan de la Cruz Sotomayor. Su nombre recuerda la batalla del 20 de enero de 1839, ganada contra la Confederación Perú-boliviana; el presidente Prieto decretó que el barrio la llevara. Mira al centro: el Monumento al Roto Chileno, obra de Virginio Arias, inaugurado en 1888 en honor al soldado popular. Y en 1842, el exiliado argentino Domingo Faustino Sarmiento ya escribía sobre este barrio recién nacido.'
    },
    "Peluquería Francesa": {
        direccion: 'Compañía de Jesús 2789', lat: -33.440873, lng: -70.674105,
        acceso: { lat: -33.440940, lng: -70.674105 },
        descripcion: 'Frente a la Plaza Yungay, en 1868, el francés Victorino Tauzán abrió una barbería que atendía al Consulado de Francia y a los vecinos: la Peluquería Francesa. Con los años pasó a la familia Lavaud, hoy en su cuarta generación. Aún conserva su aire de salón europeo, y hoy tiene también el restaurante Boulevard Lavaud. A pocos pasos, en Libertad 444, funciona la Casa Museo, con unos cinco mil objetos del oficio del peluquero y del cuidado personal: navajas, tijeras y un sillón de barbero. Este lugar es uno de los comercios históricos del barrio.'
    },
    "Casa del Maestro": {
        direccion: 'Catedral 2395', lat: -33.439104, lng: -70.670165,
        acceso: { lat: -33.439320, lng: -70.670165 },
        descripcion: 'Frente a ti, la Casa del Maestro, sede del Colegio de Profesores. La construyó a comienzos del siglo XX el arquitecto Alberto Cruz Montt como Palacio de los Wightman. En 1958 la compró la Unión de Profesores de Chile y en 1977 pasó al Colegio de Profesores. Busca la placa en el exterior: recuerda que entre el 4 de septiembre y el 4 de noviembre de 1970 funcionó aquí el primer gabinete del presidente Salvador Allende, la llamada «Moneda Chica».'
    },
    "Palacio Álamos": {
        direccion: 'Santo Domingo 2398', lat: -33.437954, lng: -70.670384,
        acceso: { lat: -33.437766, lng: -70.670384 },
        descripcion: 'Frente a ti, el Palacio Álamos, en Santo Domingo 2398. Lo construyeron entre 1921 y 1925 Ignacio Álamos Cuadra y Dolores Igualt, con los arquitectos Alberto Álamos y Humberto Bravo. Mira su fachada: el estilo es ecléctico y mezcla elementos neoclásicos, Art Nouveau y Beaux Arts. La familia vivió aquí hasta 1946, cuando se subastó su colección de arte. Hoy es el Centro Comunitario Palacio Álamos.'
    },

    // Iglesias
    "Parroquia San Saturnino": {
        direccion: 'Santo Domingo 2772', lat: -33.438271, lng: -70.674251,
        acceso: { lat: -33.438040, lng: -70.674251 },
        descripcion: 'Estás frente a la Iglesia San Saturnino, en la esquina de la plaza. Aquí, hace casi dos siglos, había una cárcel; en 1844 se levantó en el lugar una humilde capilla de adobe y madera. Levanta la vista: el templo gótico que ves lo diseñó el arquitecto Teodoro Burchard y se inauguró en 1887. Si puedes entrar, busca el cielo celeste con estrellas doradas, los vitrales de los apóstoles y el órgano de los años veinte.'
    },
    "Iglesia de San Antonio de Padua": {
        direccion: 'Catedral 2345', lat: -33.439132, lng: -70.669391,
        acceso: { lat: -33.439240, lng: -70.669391 },
        descripcion: 'Frente a ti está la Iglesia de los Capuchinos, cuyo nombre oficial es San Antonio de Padua. Los frailes capuchinos llegaron a Chile en 1848 y pocos años después empezaron a levantar este templo. Se construyó entre 1853 y 1861, según el proyecto del arquitecto italiano Eusebio Chelli, que admiraba al maestro renacentista Palladio. Hoy sigue recibiendo a muchos fieles, sobre todo devotos del Padre Pío. Y si caminas unos pasos, llegarás al Palacio Álamos, cuyo dueño ayudó a los capuchinos.'
    },

    // Museos y espacios culturales
    "Museo de la Memoria y los Derechos Humanos": {
        direccion: 'Av. Matucana 501', lat: -33.439744, lng: -70.679405,
        acceso: { lat: -33.440280, lng: -70.679405 },
        descripcion: 'Estás frente al Museo de la Memoria y los Derechos Humanos, en Matucana 501. Aquí puedes recorrer, con calma, la historia de Chile entre 1973 y 1990. En el primer piso encontrarás los hechos del 11 de septiembre y los testimonios de quienes vivieron la dictadura; en el segundo, el exilio, la búsqueda de justicia y el plebiscito de 1988; y en el tercero, las arpilleras, bordados comunitarios que cuentan la búsqueda de familiares. Te invitamos a entrar: abre de martes a domingo, de 10 a 18 horas, y la entrada es gratuita.'
    },
    "Museo de la Educación Gabriela Mistral": {
        direccion: 'Compañía de Jesús 3150', lat: -33.441749, lng: -70.678280,
        acceso: { lat: -33.441405, lng: -70.678280 },
        descripcion: 'Estás frente al Museo de la Educación Gabriela Mistral. Este edificio fue la Escuela Normal N°1 de Niñas, donde se formaron maestras entre 1886 y 1973. Y aquí mismo, en 1910, Gabriela Mistral obtuvo su habilitación como profesora primaria. Hoy el museo lleva su nombre en homenaje a la maestra que ganó el Nobel de Literatura en 1945. Adentro se cuenta la historia de la educación en Chile, con pupitres, cuadernos, material de laboratorio y fotografías. Entra: la visita es gratuita, de lunes a viernes hasta las cinco de la tarde y los sábados hasta las cuatro.'
    },
    "Museo del Sonido": {
        direccion: 'Huérfanos 2919', lat: -33.442190, lng: -70.675806,
        acceso: { lat: -33.442353, lng: -70.675806 },
        descripcion: 'Estás frente al Museo del Sonido, que funciona en una casona de 1922. Perteneció a la familia Préndez, y la Corporación Patrimonio Cultural de Chile la recuperó para convertirla en museo. Se presenta como único en su especie en Latinoamérica: cuenta la historia de cómo grabamos y escuchamos música, con fonógrafos, gramófonos y algunos de los primeros aparatos de registro de sonido. Entra: abre de martes a domingo, de 10:00 a 18:00. La entrada cuesta 2.000 pesos, y los domingos es gratis.'
    },
    "Espacio 330": {
        direccion: 'Maipú 330', lat: -33.441964, lng: -70.676637,
        acceso: { lat: -33.441964, lng: -70.676500 },
        descripcion: 'Estás frente a Espacio 330, en Maipú 330, entre Huérfanos y Compañía. Dentro de este espacio funciona una asociación cultural sin fines de lucro, fundada en 2019, que opera como sala de exposiciones. Aquí se hacen muestras de arte, performance, micro-conciertos, lanzamientos de libros y proyecciones, siempre a escala de barrio y junto a los vecinos. Te invitamos a pasar para que descubras la exposición disponible.'
    },
    "Museo Taller": {
        direccion: 'Compañía de Jesús 2784', lat: -33.441109, lng: -70.674051,
        acceso: { lat: -33.440934, lng: -70.674051 },
        descripcion: 'Estás frente al Museo Taller, en Compañía de Jesús 2784. Esta casona es museo, escuela y taller de oficios manuales. Su fundador, Francisco Dittborn, lleva más de treinta años reuniendo herramientas y máquinas: ya son más de cinco mil. Y en sus terrenos crece un bosque plantado con el método Miyawaki. ¿Te animas a pasar? Abre de martes a domingo, de 10 a 18 horas, y el último tour sale a las 17:10. Dura 90 minutos, cuesta cinco mil pesos, y te llevas lo que armas: una locomotora, un vagón o un telar de cintura.'
    },
    "Yungay Histórico": {
        direccion: 'Huérfanos 2896', lat: -33.442414, lng: -70.675240,
        acceso: { lat: -33.442300, lng: -70.675240 },
        descripcion: 'Estás frente a Yungay Histórico, en Huérfanos 2896. Esta casona se construyó en 1924, obra del arquitecto Alberto Cruz Montt, uno de los mismos que diseñó el pasaje Adriana Cousiño, a pocas cuadras de aquí. Fíjate en su estilo, una mezcla de neoclásico y art déco, y en sus detalles decorativos. Tiene tres pisos y hoy se usa para eventos y actividades culturales. Más de cien años después, sigue siendo parte de la historia del barrio.'
    },
    "DecoCalen": {
        direccion: 'Compañía de Jesús 2858', lat: -33.441140, lng: -70.674933,
        acceso: { lat: -33.441033, lng: -70.674933 },
        descripcion: 'Estás frente a DecoCalen, en Compañía 2858. Aquí se reúne un colectivo de 107 artesanos de las regiones de Los Lagos y Santiago, enfocados en el reciclaje. Si entras, vas a encontrar lana de oveja hilada, maderas nativas, cosmética vegetal, ropa y productos gourmet, como ajo chilote y mermeladas de murta o de rosa mosqueta. Arriba, en el altillo, hay una galería de arte llamada La Palomera, con exposiciones de artistas locales. Anímate a pasar: abre miércoles, jueves y domingo de 11 a 19 horas, y viernes y sábado de 12 a 20.'
    },
    "Casona Compañía": {
        direccion: 'Compañía de Jesús 2820', lat: -33.441143, lng: -70.674440,
        acceso: { lat: -33.440978, lng: -70.674440 },
        descripcion: 'Estás frente a Casona Compañía, en Compañía de Jesús 2820, y a un costado te espera un mural: «Despertar», del artista ROMOKO. La casona es un espacio patrimonial de 600 metros cuadrados, abierto desde 2019 a la creación y la colaboración, con exposiciones, ferias y shows. Fíjate en su fachada, de aire gótico o neocolonial. Anímate a entrar al Café Cité, de lunes a viernes de 8:30 a 21 horas y fines de semana de 9 a 19:30.'
    },
    "Museo de Arte Contemporáneo (MAC)": {
        direccion: 'Av. Matucana 464', lat: -33.442137, lng: -70.680588,
        acceso: { lat: -33.442137, lng: -70.679750 },
        descripcion: 'Estás frente al MAC Quinta Normal, en Matucana 464, dentro del Parque Quinta Normal. Este edificio neoclásico, de estilo francés, lo diseñó el arquitecto Alberto Cruz Montt para la Sociedad Nacional de Agricultura. Más tarde fue la Facultad de Agronomía de la Universidad de Chile. Desde 2005 es sede del Museo de Arte Contemporáneo, que se presenta como el primero de Latinoamérica. Anímate a entrar: abre de martes a domingo, de 10:30 a 17:30, y la entrada es gratuita.'
    },
    "Club Yungay": {
        direccion: 'Av. Portales 2601', lat: -33.442769, lng: -70.672321,
        acceso: { lat: -33.442845, lng: -70.672321 },
        descripcion: 'Estás frente a Club Yungay, en Avenida Portales 2601. Empezó como un café, luego fue un bar de fútbol y hoy es también un museo de banderines: más de mil, de Chile y del mundo, reunidos por sus fundadores, Mariano y Leo. Aquí el número 10 de un club amateur vale lo mismo que el de la selección, porque se rinde homenaje al fútbol de todas las categorías. Anímate a entrar: abre de 18 a 23 horas, y puedes recorrer la colección con sus curiosidades.'
    }
};
