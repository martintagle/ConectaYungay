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
 * "traduccion" (opcional): el texto del cartel en inglés (en) y portugués (pt),
 * que el visitante elige con los botones de idioma del cartel.
 * "web" e "instagram" (opcionales): con web, el botón "Más información" del
 * cartel abre esa página; con Instagram, el cartel suma un botón de Instagram.
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
        descripcion: 'Estás frente al Cité Las Palmas. Un cité es un pasaje cerrado con viviendas agrupadas en torno a un espacio común, una forma de vivir en comunidad muy propia del barrio. Este se construyó en 1914 por encargo del español José Pastor y lo diseñó el arquitecto Julio Bertrand Vidal, con el refinamiento de la arquitectura parisina Beaux Arts. Tiene seis casas interiores y dos hacia la calle.',
        traduccion: {
            en: 'You are now standing in front of Cité Las Palmas. A cité is a closed alleyway featuring housing clustered around a shared common space, a way of community living very characteristic of this neighborhood. It was built in 1914, commissioned by José Pastor and designed by architect Julio Bertrand Vidal, reflecting the refinement of Parisian Beaux-Arts architecture. It consists of six interior houses and two facing the street.',
            pt: 'Você está agora diante da Cité Las Palmas. Uma cité é uma vila fechada com moradias agrupadas em torno de um espaço comum compartilhado, um modo de vida comunitário muito característico deste bairro. Foi construída em 1914, encomendada por José Pastor e projetada pelo arquiteto Julio Bertrand Vidal, refletindo o requinte da arquitetura Beaux-Arts parisiense. É composta por seis casas internas e duas voltadas para a rua.'
        }
    },
    "Pasaje Adriana Cousiño": {
        direccion: 'Adriana Cousiño 375', lat: -33.441865, lng: -70.677096,
        descripcion: 'Entras al pasaje Adriana. Nació a comienzos del siglo XX como el Gran Cité Modelo, obra de los arquitectos Cruz Montt y Larraín Bravo, y en los años treinta pasó a ser pasaje. Al centro hay un pequeño jardín con palmeras que separa las casas de uno y otro lado y les da intimidad; estaban pensadas para familias de clase media. Su estilo neorromántico es de los más notables de su tipo. Hoy es parte de una zona típica protegida desde el año 2000.',
        traduccion: {
            en: 'You enter pasaje Adriana. It was established at the beginning of the 20th century as the Gran Cité Modelo, designed by architects Cruz Montt and Larraín Bravo, and became a pasaje (pedestrian passage) in the 1930s. In the center, a small garden with palm trees separates the houses on either side and provides them with privacy; they were intended for middle-class families. Its Neo-Romantic style is among the most notable of its kind. Today, it is part of a heritage area (zona típica) protected since year 2000.',
            pt: 'Você entra no Pasaje Adriana. Ele foi estabelecido no início do século XX como o Gran Cité Modelo, projetado pelos arquitetos Cruz Montt e Larraín Bravo, e tornou-se um pasaje (passagem de pedestres) na década de 1930. No centro, um pequeno jardim com palmeiras separa as casas de ambos os lados e lhes proporciona privacidade; elas eram destinadas a famílias de classe média. Seu estilo neorromântico está entre os mais notáveis do seu tipo. Hoje, faz parte de uma área patrimonial (zona típica) protegida desde o ano 2000.'
        }
    },
    "Cité Lucrecia Valdés de Barros Borgoño": {
        direccion: 'Lucrecia Valdés de Barros Borgoño 343-367', lat: -33.441765, lng: -70.676035,
        descripcion: 'Entras al pasaje Lucrecia Valdés, en Huérfanos 2871. Lo impulsó en 1924 el político Luis Barros Borgoño, para que vivieran los ejecutivos de la Caja de Ahorros que él presidía, y lo bautizó con el nombre de su esposa, Lucrecia Valdés. Observa sus fachadas historicistas, que retoman estilos de otras épocas. Hoy el pasaje forma parte de una zona típica protegida desde el año 2000. En el número 370 vivió el escritor Alberto Romero, autor de «La viuda del conventillo».',
        traduccion: {
            en: 'You enter Pasaje Lucrecia Valdés, located at 2871 Huérfanos Street. It was spearheaded in 1924 by the politician Luis Barros Borgoño as housing for executives of the Caja de Ahorros (Saving Bank) that he chaired, and he named it after his wife, Lucrecia Valdés. Notice its Historicist facades, which revive styles from past eras. Today, the passage is part of a heritage area (zona típica) protected since year 2000. Writer Alberto Romero, author of “La Viuda del Conventillo” (The Tenement Widow), lived at number 370.',
            pt: 'Você entra no Pasaje Lucrecia Valdés, localizado na rua Huérfanos, número 2871. Ele foi promovido em 1924 pelo político Luis Barros Borgoño como moradia para os executivos da Caja de Ahorros (Banco de Poupança), instituição da qual era presidente, e recebeu esse nome em homenagem à sua esposa, Lucrecia Valdés. Observe suas fachadas historicistas, que resgatam estilos de épocas passadas. Hoje, a passagem faz parte de uma área patrimonial (zona típica) protegida desde o ano 2000. O escritor Alberto Romero, autor de “La Viuda del Conventillo” (A Viúva do Cortiço), morou no número 370.'
        }
    },

    // Historia y patrimonio
    "Casa de Ignacio Domeyko": {
        direccion: 'Cueto 572', lat: -33.438513, lng: -70.672721,
        acceso: { lat: -33.438513, lng: -70.672617 },
        descripcion: 'Estás frente a la casa de Ignacio Domeyko, Monumento Histórico. Es una construcción sencilla y austera, de adobe, y fue su hogar durante décadas. Este geólogo polaco llegó a Chile en 1838 a impulsar la minería, y fue rector de la Universidad de Chile entre 1867 y 1883. En esta casa se reunían jefes de Estado, ministros e intelectuales, y el propio Domeyko diseñó el patio. En 1888, de regreso de Polonia, dejó allí un saco con tierra de su patria. Murió aquí en 1889.',
        traduccion: {
            en: 'You are now standing in front of the house of Ignacio Domeyko, a National Historic Monument. It is a simple and austere adobe building that served as his home for decades. This Polish geologist arrived in Chile in 1838 to boost the mining industry and served as the Chancellor (Rector) of the University of Chile between 1867 and 1883. Heads of state, government ministers, and intellectuals gathered in this house, and Domeyko himself designed the courtyard. In 1888, upon returning from Poland, he left a sack of soil from his homeland there. He passed away here, in 1889.',
            pt: 'Você está agora diante da casa de Ignacio Domeyko, um Monumento Histórico Nacional. É uma construção de adobe simples e austera que serviu de moradia para ele durante décadas. Este geólogo polonês chegou ao Chile em 1838 para impulsionar a indústria mineira e atuou como reitor da Universidade do Chile entre 1867 e 1883. Chefes de Estado, ministros de governo e intelectuais se reuniam nesta casa, e o próprio Domeyko projetou o pátio. Em 1888, ao retornar da Polônia, ele deixou ali um saco de terra de sua terra natal. Ele faleceu aqui, em 1889.'
        }
    },
    "Plaza Yungay": {
        direccion: 'Santo Domingo 2745-2799', lat: -33.437687, lng: -70.674019,
        acceso: { lat: -33.438024, lng: -70.674019 },
        descripcion: 'Estás en la Plaza Yungay, el corazón del primer barrio republicano de Chile, planificado por Jacinto Cueto y Juan de la Cruz Sotomayor. Su nombre recuerda la batalla del 20 de enero de 1839, ganada contra la Confederación Perú-boliviana; el presidente Prieto decretó que el barrio la llevara. Mira al centro: el Monumento al Roto Chileno, obra de Virginio Arias, inaugurado en 1888 en honor al soldado popular. Y en 1842, el exiliado argentino Domingo Faustino Sarmiento ya escribía sobre este barrio recién nacido.',
        traduccion: {
            en: 'You are in Plaza Yungay, the heart of Chile’s first republican neighborhood, planned by Jacinto Cueto and Juan de la Cruz Sotomayor. Its name commemorates the Battle of Yungay on January 20th, 1839, won against the Peru-Bolivian Confederation; President Prieto decreed that the neighborhood should bear its name. Look at the center: that is the Monument to the Roto Chileno, sculpted by Virginio Arias and inaugurated in 1888 to honor the everyday Chilean soldier. And in 1842, exiled Argentine writer and politician Domingo Faustino Sarmiento was already writing about this newly born neighborhood.',
            pt: 'Você está na Plaza Yungay, o coração do primeiro bairro republicano do Chile, planejado por Jacinto Cueto e Juan de la Cruz Sotomayor. Seu nome comemora a Batalha de Yungay, ocorrida em 20 de janeiro de 1839, vencida contra a Confederação Peruano-Boliviana; o presidente Prieto decretou que o bairro deveria levar esse nome. Olhe para o centro: aquele é o Monumento ao Roto Chileno, esculpido por Virginio Arias e inaugurado em 1888 para homenagear o soldado chileno comum. E em 1842, o escritor e político argentino exilado Domingo Faustino Sarmiento já escrevia sobre este bairro recém-nascido.'
        }
    },
    "Peluquería Francesa": {
        direccion: 'Compañía de Jesús 2789', lat: -33.440873, lng: -70.674105,
        acceso: { lat: -33.440940, lng: -70.674105 },
        descripcion: 'Frente a la Plaza Yungay, en 1868, el francés Victorino Tauzán abrió una barbería que atendía al Consulado de Francia y a los vecinos: la Peluquería Francesa. Con los años pasó a la familia Lavaud, hoy en su cuarta generación. Aún conserva su aire de salón europeo, y hoy tiene también el restaurante Boulevard Lavaud. A pocos pasos, en Libertad 444, funciona la Casa Museo, con unos cinco mil objetos del oficio del peluquero y del cuidado personal: navajas, tijeras y un sillón de barbero. Este lugar es uno de los comercios históricos del barrio.',
        traduccion: {
            en: 'Facing Plaza Yungay, French hairdresser Victorino Tauzán opened a barbershop in 1868 that served both the French Consulate and local neighbors: the Peluquería Francesa (French Barbershop). Over the years, ownership passed to the Lavaud family, now in its fourth generation. It still preserves its European salon ambiance and today also houses the Boulevard Lavaud restaurant. Just a few steps away, at 444 Libertad Street, is the House Museum (Casa Museo), featuring around five thousand barbering and personal care artifacts, including razors, scissors, and a vintage barber chair. This location is one of the neighborhood’s most iconic historic businesses.',
            pt: 'De frente para a Plaza Yungay, o cabeleireiro francês Victorino Tauzán abriu uma barbearia em 1868 que atendia tanto o Consulado Francês quanto os vizinhos locais: a Peluquería Francesa (Barbearia Francesa). Ao longo dos anos, a propriedade passou para a família Lavaud, agora em sua quarta geração. O local ainda preserva seu ambiente de salão europeu e hoje também abriga o restaurante Boulevard Lavaud. A poucos passos daqui, na rua Libertad, número 444, fica a Casa Museo (Casa Museu), que abriga cerca de cinco mil artefatos de barbearia e cuidados pessoais, incluindo navalhas, tesouras e uma cadeira de barbeiro vintage. Este local é um dos comércios históricos mais icônicos do bairro.'
        },
        web: 'https://peluqueriafrancesa.com/',
        instagram: 'https://www.instagram.com/peluqueriafrancesa/'
    },
    "Casa del Maestro": {
        direccion: 'Catedral 2395', lat: -33.439104, lng: -70.670165,
        acceso: { lat: -33.439320, lng: -70.670165 },
        descripcion: 'Frente a ti, la Casa del Maestro, sede del Colegio de Profesores. La construyó a comienzos del siglo XX el arquitecto Alberto Cruz Montt como Palacio de los Wightman. En 1958 la compró la Unión de Profesores de Chile y en 1977 pasó al Colegio de Profesores. Busca la placa en el exterior: recuerda que entre el 4 de septiembre y el 4 de noviembre de 1970 funcionó aquí el primer gabinete del presidente Salvador Allende, la llamada «Moneda Chica».',
        traduccion: {
            en: 'In front of you is the Casa del Maestro, headquarters of the “Colegio de Profesores”. It was built in the early 20th century by architect Alberto Cruz Montt as the Wightman Palace. In 1958, it was acquired by the Teachers’ Union of Chile, and in 1977, ownership passed to the “Colegio de Profesores”. Look for the plaque on the exterior: it commemorates that between September 4th and November 4th, 1970, President Salvador Allende’s first cabinet operated here, known as the “Moneda Chica” (Little Moneda).',
            pt: 'À sua frente está a Casa del Maestro, sede do “Colegio de Profesores”. Ela foi construída no início do século XX pelo arquiteto Alberto Cruz Montt como o Palácio Wightman. Em 1958, foi adquirida pelo Sindicato dos Professores do Chile e, em 1977, a propriedade passou para o “Colegio de Profesores”. Procure a placa na parte externa: ela comemora que, entre 4 de setembro e 4 de novembro de 1970, o primeiro gabinete do presidente Salvador Allende funcionou aqui, conhecido como a “Moneda Chica” (Pequena Moneda).'
        }
    },
    "Palacio Álamos": {
        direccion: 'Santo Domingo 2398', lat: -33.437954, lng: -70.670384,
        acceso: { lat: -33.437766, lng: -70.670384 },
        descripcion: 'Frente a ti, el Palacio Álamos, en Santo Domingo 2398. Lo construyeron entre 1921 y 1925 Ignacio Álamos Cuadra y Dolores Igualt, con los arquitectos Alberto Álamos y Humberto Bravo. Mira su fachada: el estilo es ecléctico y mezcla elementos neoclásicos, Art Nouveau y Beaux Arts. La familia vivió aquí hasta 1946, cuando se subastó su colección de arte. Hoy es el Centro Comunitario Palacio Álamos.',
        traduccion: {
            en: 'In front of you is Palacio Álamos, located at 2398 Santo Domingo Street. It was built between 1921 and 1925 by Ignacio Álamos Cuadra and Dolores Igualt, alongside architects Alberto Álamos and Humberto Bravo. Look at its facade: its style is eclectic, blending Neoclassical, Art Nouveau, and Beaux-Arts elements. The family lived here until 1946, when their art collection was auctioned off. Today, it serves as the Palacio Álamos Community Center.',
            pt: 'À sua frente está o Palacio Álamos, localizado na rua Santo Domingo, número 2398. Ele foi construído entre 1921 e 1925 por Ignacio Álamos Cuadra e Dolores Igualt, junto com os arquitetos Alberto Álamos e Humberto Bravo. Olhe para a sua fachada: seu estilo é eclético, misturando elementos neoclássicos, Art Nouveau e Beaux-Arts. A família viveu aqui até 1946, quando sua coleção de arte foi leiloada. Hoje, funciona como o Centro Comunitário Palacio Álamos.'
        }
    },

    // Iglesias
    "Parroquia San Saturnino": {
        direccion: 'Santo Domingo 2772', lat: -33.438271, lng: -70.674251,
        acceso: { lat: -33.438040, lng: -70.674251 },
        descripcion: 'Estás frente a la Iglesia San Saturnino, en la esquina de la plaza. Aquí, hace casi dos siglos, había una cárcel; en 1844 se levantó en el lugar una humilde capilla de adobe y madera. Levanta la vista: el templo gótico que ves lo diseñó el arquitecto Teodoro Burchard y se inauguró en 1887. Si puedes entrar, busca el cielo celeste con estrellas doradas, los vitrales de los apóstoles y el órgano de los años veinte.',
        traduccion: {
            en: 'You are standing in front of San Saturnino Church, on the corner of the square. Almost two centuries ago, a prison stood on this site; in 1844, a humble adobe and timber chapel was erected here. Look up: the Gothic church you see was designed by architect Teodoro Burchard and inaugurated in 1887. If you are able to go inside, look for the sky-blue ceiling painted with golden stars, the stained-glass windows depicting the apostles, and the organ dating back to the 1920s.',
            pt: 'Você está em frente à Igreja San Saturnino, na esquina da praça. Há quase dois séculos, havia uma prisão neste local; em 1844, uma humilde capela de adobe e madeira foi erguida aqui. Olhe para cima: a igreja gótica que você vê foi projetada pelo arquiteto Teodoro Burchard e inaugurada em 1887. Se puder entrar, procure o teto azul-celeste pintado com estrelas douradas, os vitrais que retratam os apóstolos e o órgão que remonta à década de 1920.'
        }
    },
    "Iglesia de San Antonio de Padua": {
        direccion: 'Catedral 2345', lat: -33.439132, lng: -70.669391,
        acceso: { lat: -33.439240, lng: -70.669391 },
        descripcion: 'Frente a ti está la Iglesia de los Capuchinos, cuyo nombre oficial es San Antonio de Padua. Los frailes capuchinos llegaron a Chile en 1848 y pocos años después empezaron a levantar este templo. Se construyó entre 1853 y 1861, según el proyecto del arquitecto italiano Eusebio Chelli, que admiraba al maestro renacentista Palladio. Hoy sigue recibiendo a muchos fieles, sobre todo devotos del Padre Pío. Y si caminas unos pasos, llegarás al Palacio Álamos, cuyo dueño ayudó a los capuchinos.',
        traduccion: {
            en: 'In front of you is the Capuchin Church, officially named Saint Anthony of Padua. The Capuchin friars arrived in Chile in 1848 and began constructing this church just a few years later. It was built between 1853 and 1861 based on a design by Italian architect Eusebio Chelli, who greatly admired the Renaissance master Andrea Palladio. Today, it continues to welcome many worshippers, particularly devotees of Padre Pio. And if you walk just a few steps, you will reach Palacio Álamos, whose owner was a benefactor to the Capuchins.',
            pt: 'À sua frente está a Igreja dos Capuchinhos, cujo nome oficial é Santo Antônio de Pádua. Os frades capuchinhos chegaram ao Chile em 1848 e começaram a construir esta igreja poucos anos depois. Foi construída entre 1853 e 1861 com base em um projeto do arquiteto italiano Eusebio Chelli, que admirava profundamente o mestre renascentista Andrea Palladio. Hoje, ela continua a acolher muitos fiéis, especialmente devotos do Padre Pio. E, se você caminhar apenas alguns passos, chegará ao Palacio Álamos, cujos proprietários foram benfeitores dos capuchinhos.'
        }
    },

    // Museos y espacios culturales
    "Museo de la Memoria y los Derechos Humanos": {
        direccion: 'Av. Matucana 501', lat: -33.439744, lng: -70.679405,
        acceso: { lat: -33.440280, lng: -70.679405 },
        descripcion: 'Estás frente al Museo de la Memoria y los Derechos Humanos, en Matucana 501. Aquí puedes recorrer, con calma, la historia de Chile entre 1973 y 1990. En el primer piso encontrarás los hechos del 11 de septiembre y los testimonios de quienes vivieron la dictadura; en el segundo, el exilio, la búsqueda de justicia y el plebiscito de 1988; y en el tercero, las arpilleras, bordados comunitarios que cuentan la búsqueda de familiares. Te invitamos a entrar: abre de martes a domingo, de 10 a 18 horas, y la entrada es gratuita.',
        traduccion: {
            en: 'You are standing in front of the Museum of Memory and Human Rights, located at 501 Matucana Street. Here, you can calmly explore the history of Chile between 1973 and 1990. On the first floor, you will find the events of September 11th and testimonies from those who lived through the dictatorship; on the second, the experience of exile, the pursuit of justice, and the 1988 plebiscite; and on the third, arpilleras, community embroideries that tell the story of the search for missing family members. We invite you to step inside: it is open Tuesday through Sunday from 10:00 AM to 6:00 PM, and admission is free.',
            pt: 'Você está em frente ao Museu da Memória e dos Direitos Humanos, localizado na rua Matucana, número 501. Aqui, você pode explorar com calma a história do Chile entre 1973 e 1990. No primeiro andar, você encontrará os acontecimentos de 11 de setembro e depoimentos daqueles que viveram a ditadura; no segundo, a experiência do exílio, a busca por justiça e o plebiscito de 1988; e no terceiro, as arpilleras, bordados comunitários que contam a história da busca por familiares desaparecidos. Convidamos você a entrar: o museu fica aberto de terça a domingo, das 10h00 às 18h00, e a entrada é gratuita.'
        }
    },
    "Museo de la Educación Gabriela Mistral": {
        direccion: 'Compañía de Jesús 3150', lat: -33.441749, lng: -70.678280,
        acceso: { lat: -33.441405, lng: -70.678280 },
        descripcion: 'Estás frente al Museo de la Educación Gabriela Mistral. Este edificio fue la Escuela Normal N°1 de Niñas, donde se formaron maestras entre 1886 y 1973. Y aquí mismo, en 1910, Gabriela Mistral obtuvo su habilitación como profesora primaria. Hoy el museo lleva su nombre en homenaje a la maestra que ganó el Nobel de Literatura en 1945. Adentro se cuenta la historia de la educación en Chile, con pupitres, cuadernos, material de laboratorio y fotografías. Entra: la visita es gratuita, de lunes a viernes hasta las cinco de la tarde y los sábados hasta las cuatro.',
        traduccion: {
            en: 'You are standing in front of the Museum of Education Gabriela Mistral. This building was formerly the N°1 Girls’ Normal School, where female teachers were trained between 1886 and 1973. Right there, in 1910, Gabriela Mistral earned her qualification as an elementary school teacher. Today, the museum bears her name as a tribute to the educator who won the Nobel Prize in Literature in 1945. Inside, it tells the history of education in Chile through old desks, notebooks, laboratory equipment, and photographs. Step inside: admission is free, open Monday through Friday until 5:00 PM and Saturdays until 4:00 PM.',
            pt: 'Você está em frente ao Museu da Educação Gabriela Mistral. Este edifício era antigamente a Escola Normal de Meninas Nº 1, onde professoras eram formadas entre 1886 e 1973. Bem ali, em 1910, Gabriela Mistral obteve sua qualificação como professora primária. Hoje, o museu leva o seu nome como uma homenagem à educadora que ganhou o Prêmio Nobel de Literatura em 1945. No interior, ele conta a história da educação no Chile através de antigas carteiras, cadernos, equipamentos de laboratório e fotografias. Entre: a entrada é gratuita, aberto de segunda a sexta-feira até as 17h00 e aos sábados até as 16h00.'
        }
    },
    "Museo del Sonido": {
        direccion: 'Huérfanos 2919', lat: -33.442190, lng: -70.675806,
        acceso: { lat: -33.442353, lng: -70.675806 },
        descripcion: 'Estás frente al Museo del Sonido, que funciona en una casona de 1922. Perteneció a la familia Préndez, y la Corporación Patrimonio Cultural de Chile la recuperó para convertirla en museo. Se presenta como único en su especie en Latinoamérica: cuenta la historia de cómo grabamos y escuchamos música, con fonógrafos, gramófonos y algunos de los primeros aparatos de registro de sonido. Entra: abre de martes a domingo, de 10:00 a 18:00. La entrada cuesta 2.000 pesos, y los domingos es gratis.',
        traduccion: {
            en: 'You are standing in front of the Museum of Sound, which operates inside a historic 1922 mansion. It once belonged to the Préndez family, and the Cultural Heritage Corporation of Chile restored it to turn it into a museum. It describes itself as one of a kind in Latin America, telling the history of how we record and listen to music with phonographs, gramophones, and some of the earliest sound-recording devices. Step inside: it is open Tuesday to Sunday from 10:00 AM to 6:00 PM. Admission costs $2.000 CLP, and it is free on Sundays.',
            pt: 'Você está em frente ao Museu do Som, que funciona dentro de um casarão histórico de 1922. Ele pertenceu à família Préndez, e a Corporação do Patrimônio Cultural do Chile o restaurou para transformá-lo em um museu. Ele se define como único em seu tipo na América Latina, contando a história de como gravamos e ouvimos música com fonógrafos, gramofones e alguns dos primeiros dispositivos de gravação de som. Entre: ele está aberto de terça a domingo, das 10h00 às 18h00. A entrada custa $2.000 CLP, sendo gratuita aos domingos.'
        }
    },
    "Espacio 330": {
        direccion: 'Maipú 330', lat: -33.441964, lng: -70.676637,
        acceso: { lat: -33.441964, lng: -70.676500 },
        descripcion: 'Estás frente a Espacio 330, en Maipú 330, entre Huérfanos y Compañía. Dentro de este espacio funciona una asociación cultural sin fines de lucro, fundada en 2019, que opera como sala de exposiciones. Aquí se hacen muestras de arte, performance, micro-conciertos, lanzamientos de libros y proyecciones, siempre a escala de barrio y junto a los vecinos. Te invitamos a pasar para que descubras la exposición disponible.',
        traduccion: {
            en: 'You are standing in front of Espacio 330, located at 330 Maipú Street, between Huérfanos and Compañía. Inside this venue operates a non-profit cultural association, founded in 2019, which functions as an exhibition hall. It hosts art exhibitions, performances, micro-concerts, book launches, and screenings, always on a neighborhood scale and in close connection with local residents. We invite you to step inside and discover the current exhibition.',
            pt: 'Você está em frente ao Espacio 330, localizado na rua Maipú, número 330, entre as ruas Huérfanos e Compañía. Dentro deste espaço funciona uma associação cultural sem fins lucrativos, fundada em 2019, que atua como sala de exposições. O local abriga mostras de arte, performances, microconcertos, lançamentos de livros e exibições audiovisuais, sempre em escala de bairro e em estreita conexão com os moradores locais. Convidamos você a entrar e descobrir a exposição em cartaz.'
        },
        instagram: 'https://www.instagram.com/espacio330/'
    },
    "Museo Taller": {
        direccion: 'Compañía de Jesús 2784', lat: -33.441109, lng: -70.674051,
        acceso: { lat: -33.440934, lng: -70.674051 },
        descripcion: 'Estás frente al Museo Taller, en Compañía de Jesús 2784. Esta casona es museo, escuela y taller de oficios manuales. Su fundador, Francisco Dittborn, lleva más de treinta años reuniendo herramientas y máquinas: ya son más de cinco mil. Y en sus terrenos crece un bosque plantado con el método Miyawaki. ¿Te animas a pasar? Abre de martes a domingo, de 10 a 18 horas, y el último tour sale a las 17:10. Dura 90 minutos, cuesta cinco mil pesos, y te llevas lo que armas: una locomotora, un vagón o un telar de cintura.',
        traduccion: {
            en: 'You are standing in front of Museo Taller, located at 2784 Compañia de Jesús Street. This historic mansion serves as a museum, school, and handcraft workshop. Its founder, Francisco Dittborn, has spent more than thirty years collecting tools and machines: there are now more than five thousand. On its grounds, a forest planted using the Miyawaki method grows. Would you like to go inside? It is open Tuesday through Sunday from 10:00 AM to 6:00 PM, with the last tour starting at 5:10 PM. The tour lasts 90 minutes, costs $5.000 CLP, and you get to take home what you build: a locomotive, a train car, or a backstrap loom.',
            pt: 'Você está em frente ao Museo Taller, localizado na rua Compañía de Jesús, número 2784. Esta mansão histórica serve como museu, escola e oficina artesanal. Seu fundador, Francisco Dittborn, dedicou mais de trinta anos a reunir ferramentas e máquinas: já são mais de cinco mil. Em seus terrenos, cresce uma floresta plantada segundo o método Miyawaki. Gostaria de entrar? Ele está aberto de terça a domingo, das 10h00 às 18h00, com a última visita guiada começando às 17h10. O tour dura 90 minutos, custa $5.000 CLP, e você leva para casa o que construir: uma locomotiva, um vagão de trem ou um tear de cintura.'
        },
        web: 'https://www.museotaller.cl/',
        instagram: 'https://www.instagram.com/museotaller/'
    },
    "Yungay Histórico": {
        direccion: 'Huérfanos 2896', lat: -33.442414, lng: -70.675240,
        acceso: { lat: -33.442300, lng: -70.675240 },
        descripcion: 'Estás frente a Yungay Histórico, en Huérfanos 2896. Esta casona se construyó en 1924, obra del arquitecto Alberto Cruz Montt, uno de los mismos que diseñó el pasaje Adriana Cousiño, a pocas cuadras de aquí. Fíjate en su estilo, una mezcla de neoclásico y art déco, y en sus detalles decorativos. Tiene tres pisos y hoy se usa para eventos y actividades culturales. Más de cien años después, sigue siendo parte de la historia del barrio.',
        traduccion: {
            en: 'You are standing in front of Yungay Histórico, located at 2896 Huérfanos street. This historic mansion was built in 1924, designed by architect Alberto Cruz Montt (one of the same architects who designed the Adriana Cousiño passage just a few blocks away). Notice its style, a blend of neoclassical and Art Deco, as well as its decorative details. It has three floors and is currently used for events and cultural activities. More than a hundred years later, it remains an integral part of the neighborhood’s history.',
            pt: 'Você está em frente ao Yungay Histórico, localizado na rua Huérfanos, número 2896. Este casarão histórico foi construído em 1924, projetado pelo arquiteto Alberto Cruz Montt (um dos mesmos arquitetos que projetaram a passagem Adriana Cousiño a poucas quadras dali). Note o seu estilo, uma mistura de neoclássico e Art Déco, bem como os seus detalhes decorativos. Possui três andares e atualmente é utilizado para eventos e atividades culturais. Mais de cem anos depois, ele continua sendo parte integrante da história do bairro.'
        },
        web: 'https://yungayhistorico.cl/'
    },
    "DecoCalen": {
        direccion: 'Compañía de Jesús 2858', lat: -33.441140, lng: -70.674933,
        acceso: { lat: -33.441033, lng: -70.674933 },
        descripcion: 'Estás frente a DecoCalen, en Compañía 2858. Aquí se reúne un colectivo de 107 artesanos de las regiones de Los Lagos y Santiago, enfocados en el reciclaje. Si entras, vas a encontrar lana de oveja hilada, maderas nativas, cosmética vegetal, ropa y productos gourmet, como ajo chilote y mermeladas de murta o de rosa mosqueta. Arriba, en el altillo, hay una galería de arte llamada La Palomera, con exposiciones de artistas locales. Anímate a pasar: abre miércoles, jueves y domingo de 11 a 19 horas, y viernes y sábado de 12 a 20.',
        traduccion: {
            en: 'You are standing in front of DecoCalen, located at 2858 Compañía street. Here, a collective of 107 artisans from the Los Lagos and Santiago Regions focuses on recycling and sustainability. If you go inside, you will find spun sheep’s wool, native woods, herbal cosmetics, clothing, and gourmet products, such as Chiloé garlic and murta or sweet brier (dog rose) jams. Upstairs in the loft, there is an art gallery called La Palomera featuring exhibitions by local artists. Feel free to step inside; it is open Wednesday, Thursday, and Sunday from 11:00 AM to 7:00 PM, and Friday and Saturday from 12:00 PM to 8:00 PM.',
            pt: 'Você está em frente à DecoCalen, localizada na rua Compañía, número 2858. Aqui, um coletivo de 107 artesãos das regiões de Los Lagos e de Santiago foca na reciclagem e na sustentabilidade. Se entrar, você encontrará lã de ovelha fiada, madeiras nativas, cosméticos de ervas, roupas e produtos gourmet, como alho de Chiloé e geleias de murtilha ou rosa-silvestre. No mezanino, há uma galeria de arte chamada La Palomera, que apresenta exposições de artistas locais. Sinta-se à vontade para entrar; o local está aberto às quartas, quintas e domingos, das 11h00 às 19h00, e às sextas e sábados, das 12h00 às 20h00.'
        },
        instagram: 'https://www.instagram.com/decocalen/'
    },
    "Casona Compañía": {
        direccion: 'Compañía de Jesús 2820', lat: -33.441143, lng: -70.674440,
        acceso: { lat: -33.440978, lng: -70.674440 },
        descripcion: 'Estás frente a Casona Compañía, en Compañía de Jesús 2820, y a un costado te espera un mural: «Despertar», del artista ROMOKO. La casona es un espacio patrimonial de 600 metros cuadrados, abierto desde 2019 a la creación y la colaboración, con exposiciones, ferias y shows. Fíjate en su fachada, de aire gótico o neocolonial. Anímate a entrar al Café Cité, de lunes a viernes de 8:30 a 21 horas y fines de semana de 9 a 19:30.',
        traduccion: {
            en: 'You are standing in front of Casona Compañía, located at 2820 Compañía de Jesús Street, where a mural titled “Awakening” (Despertar) by artist ROMOKO awaits you right alongside it. The historic mansion is a 600-square-meter heritage space open since 2019 for creation and collaboration, hosting exhibitions, fairs, and shows. Notice its facade, featuring a Gothic or neo-Colonial flair. Feel free to step inside Café Cité, open Monday through Friday from 8:30 AM to 9:00 PM and on weekends from 9:00 AM to 7:30 PM.',
            pt: 'Você está em frente à Casona Compañía, localizada na rua Compañía de Jesús, número 2820, onde um mural intitulado “Despertar” (Despertar), do artista ROMOKO, espera por você bem ao lado. O casarão histórico é um espaço patrimonial de 600 metros quadrados, aberto desde 2019 para criação e colaboração, acolhendo exposições, feiras e espetáculos. Note a sua fachada, que exibe um toque gótico ou neocolonial. Sinta-se à vontade para entrar no Café Cité, aberto de segunda a sexta-feira, das 08h30 às 21h00, e aos fins de semana, das 09h00 às 19h30.'
        },
        instagram: 'https://www.instagram.com/casonacompania/'
    },
    "Museo de Arte Contemporáneo (MAC)": {
        direccion: 'Av. Matucana 464', lat: -33.442137, lng: -70.680588,
        acceso: { lat: -33.442137, lng: -70.679750 },
        descripcion: 'Estás frente al MAC Quinta Normal, en Matucana 464, dentro del Parque Quinta Normal. Este edificio neoclásico, de estilo francés, lo diseñó el arquitecto Alberto Cruz Montt para la Sociedad Nacional de Agricultura. Más tarde fue la Facultad de Agronomía de la Universidad de Chile. Desde 2005 es sede del Museo de Arte Contemporáneo, que se presenta como el primero de Latinoamérica. Anímate a entrar: abre de martes a domingo, de 10:30 a 17:30, y la entrada es gratuita.',
        traduccion: {
            en: 'You are standing in front of the Museum of Contemporary Art, specifically the Quinta Normal branch located at 464 Matucana Avenue, inside Quinta Normal Park. This neoclassical, French-style building was designed by architect Alberto Cruz Montt for the National Agriculture Society. Later, it served as the Faculty of Agronomy of the University of Chile. Since 2005, it has been home to the Museum of Contemporary Art, which presents itself as the first of its kind in Latin America. Feel free to step inside: it is open Tuesday through Sunday from 10:30 AM to 5:30 PM, and admission is free.',
            pt: 'Você está em frente ao Museu de Arte Contemporânea, especificamente na sede de Quinta Normal, localizada na avenida Matucana, número 464, dentro do Parque Quinta Normal. Este edifício neoclássico de estilo francês foi projetado pelo arquiteto Alberto Cruz Montt para a Sociedade Nacional de Agricultura. Mais tarde, serviu como Faculdade de Agronomia da Universidade do Chile. Desde 2005, abriga o Museu de Arte Contemporânea, que se apresenta como o primeiro de seu tipo na América Latina. Sinta-se à vontade para entrar: ele está aberto de terça a domingo, das 10h30 às 17h30, e a entrada é gratuita.'
        }
    },
    "Club Yungay": {
        direccion: 'Av. Portales 2601', lat: -33.442769, lng: -70.672321,
        acceso: { lat: -33.442845, lng: -70.672321 },
        descripcion: 'Estás frente a Club Yungay, en Avenida Portales 2601. Empezó como un café, luego fue un bar de fútbol y hoy es también un museo de banderines: más de mil, de Chile y del mundo, reunidos por sus fundadores, Mariano y Leo. Aquí el número 10 de un club amateur vale lo mismo que el de la selección, porque se rinde homenaje al fútbol de todas las categorías. Anímate a entrar: abre de 18 a 23 horas, y puedes recorrer la colección con sus curiosidades.',
        traduccion: {
            en: 'You are standing in front of Club Yungay, located at 2601 Portales Avenue. It started out as a café, later became a football-themed bar, and today it also functions as a pennant museum, housing over a thousand pennants from Chile and around the world, gathered by its founders, Mariano and Leo. Here, a jersey number 10 from an amateur club is valued just as much as one from the national team, as a tribute to football across all levels. Feel free to step inside: it opens at 6:00 PM and you can explore the collection and its unique memorabilia.',
            pt: 'Você está em frente ao Club Yungay, localizado na avenida Portales, número 2601. Ele começou como um café, depois se transformou em um bar com temática de futebol e, hoje, também funciona como um museu de flâmulas, abrigando mais de mil flâmulas do Chile e de todo o mundo, reunidas por seus fundadores, Mariano e Leo. Aqui, uma camisa número 10 de um clube amador é valorizada tanto quanto a da seleção nacional, como uma homenagem ao futebol em todos os níveis. Sinta-se à vontade para entrar: ele abre às 18h00 e você pode explorar a coleção e suas recordações únicas.'
        },
        instagram: 'https://www.instagram.com/clubyungay/'
    }
};
