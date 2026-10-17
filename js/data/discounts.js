/**
 * CAPA DE DATOS (Modelo — Locales con descuento)
 * ConectaYungay — Cafeterías y restaurantes asociados
 *
 * Solo estructura: categoría, nombre, dirección, coordenadas GPS y enlaces.
 * Coordenadas geocodificadas desde la dirección en OpenStreetMap.
 * Categorías válidas: 'cafeterias' | 'restaurantes' | 'heladerias'.
 * "links" (opcional): Instagram, sitio web, carta, etc. del local.
 * Tipos válidos: 'instagram' | 'web' | 'menu' | 'tour360' | 'enlaces'.
 */

window.ConectaYungay = window.ConectaYungay || {};
ConectaYungay.Data = ConectaYungay.Data || {};

ConectaYungay.Data.DESCUENTOS = [
    { category: 'cafeterias',   name: 'La Tetería Cleopatra',          address: 'Adriana Cousiño 383',             lat: -33.441485, lng: -70.677138,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/teteriacleopatrachile/' }] },
    { category: 'cafeterias',   name: 'Planta Café',                   address: 'Maipú 330',                       lat: -33.441969, lng: -70.676742,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/plantacafe__/' },
              { tipo: 'menu',      url: 'https://menu.fu.do/plantacaf%C3%A9/qr-menu' }] },
    { category: 'cafeterias',   name: 'Cafetería Popular',             address: 'Maipú 363',                       lat: -33.441584, lng: -70.676377,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/cafeteria.popular/' },
              { tipo: 'web',       url: 'https://www.cafeteriapopularoficial.cl/' }] },
    { category: 'cafeterias',   name: 'Mingus Café',                   address: 'Huérfanos 2919',                  lat: -33.442168, lng: -70.675866,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/mingus.coffee/' },
              { tipo: 'menu',      url: 'https://minguscoffee.ola.click/products' }] },
    { category: 'cafeterias',   name: 'Café Cité',                     address: 'Compañía de Jesús 2820',          lat: -33.441143, lng: -70.674440,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/cite.scl/' },
              { tipo: 'menu',      url: 'https://menu.fu.do/cit%C3%A9/qr-menu' }] },
    { category: 'cafeterias',   name: 'Un Café y Algo Más',            address: 'Catedral 2802',                   lat: -33.439860, lng: -70.674550,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/1cafeyalgomas/' },
              { tipo: 'tour360',   url: 'https://www.vicel.cl/360_uncafeyalgomas/' }] },
    { category: 'cafeterias',   name: 'Selvaggio Panadería',           address: 'Huérfanos 2744',                  lat: -33.442170, lng: -70.673601,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/pizzeriaselvaggio/' },
              { tipo: 'web',       url: 'https://www.selvaggio.cl/' }] },
    { category: 'cafeterias',   name: 'Café Brunet',                   address: 'Compañía de Jesús 2695',          lat: -33.440731, lng: -70.673192,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/cafe.brunet/' },
              { tipo: 'web',       url: 'https://cafebrunet.cl/' }] },
    { category: 'restaurantes', name: 'Restaurante El Verde',          address: 'Huérfanos 3020',                  lat: -33.442250, lng: -70.676650,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/el_verde/' }] },
    { category: 'restaurantes', name: 'Restaurante Zarita',            address: 'Compañía de Jesús 3023',          lat: -33.441186, lng: -70.676866,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/zaritarestaurante/' },
              { tipo: 'web',       url: 'https://zarita.cl/' }] },
    { category: 'restaurantes', name: 'El Chancho Seis',               address: 'Huérfanos 3025',                  lat: -33.442316, lng: -70.676703,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/elchanchoseis.restorant/' },
              { tipo: 'web',       url: 'https://restoranelchanchoseis.cl/' }] },
    { category: 'restaurantes', name: 'Restaurant El Huaso Enrique',   address: 'Maipú 462',                       lat: -33.440495, lng: -70.676784,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/elhuasoenriqueoficial/' },
              { tipo: 'enlaces',   url: 'https://linktr.ee/elhuasoenriqueoficial' }] },
    { category: 'restaurantes', name: 'Restaurante La Gárgola',        address: 'Maipú 357',                       lat: -33.441660, lng: -70.676344,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/espaciogargola/' },
              { tipo: 'web',       url: 'https://lagargola.cl/' }] },
    { category: 'restaurantes', name: 'Darkolics Restobar',            address: 'Esperanza 320',                   lat: -33.441921, lng: -70.675644,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/darkolicsbeer/' },
              { tipo: 'web',       url: 'https://darkolicsbeer.cl/' }] },
    { category: 'restaurantes', name: 'El Putamadre Restorant',        address: 'Huérfanos 2897',                  lat: -33.442150, lng: -70.675650,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/el_putamadre_bar_restaurante/' },
              { tipo: 'menu',      url: 'https://menu.fu.do/restaurantelputamadre/qr-menu' }] },
    { category: 'restaurantes', name: 'Fuente Mardoqueo',              address: 'Libertad 551',                    lat: -33.438930, lng: -70.674224,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/fuentemardoqueo/' },
              { tipo: 'web',       url: 'https://fuentemardoqueo.cl/' }] },
    { category: 'restaurantes', name: 'Boulevard Lavaud Restaurant',   address: 'Compañía de Jesús 2789',          lat: -33.440880, lng: -70.674021,
      links: [{ tipo: 'instagram', url: 'https://www.instagram.com/peluqueriafrancesa/' },
              { tipo: 'web',       url: 'https://peluqueriafrancesa.com/' }] },
    { category: 'restaurantes', name: 'La Trova',                      address: 'Av. Portales 2683',               lat: -33.442842, lng: -70.673005,
      links: [{ tipo: 'web',       url: 'https://www.boulevardpatioyungay.cl/bar-la-trova/' }] }
];
