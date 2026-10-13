# supabase/

Esta carpeta **no es una capa de la aplicación** ni un controlador. Contiene el
script SQL que crea las tablas de la base de datos en Supabase
(`visitas` y `clics_info`) y sus políticas de seguridad (RLS: solo INSERT anónimo).

- No se carga desde `index.html`; se ejecuta una vez en el editor SQL de Supabase.
- `2026-10-10_accion_clics.sql`: migración que agrega la columna `accion`
  (`apertura` / `mas_info`) a `clics_info`, más la consulta para comparar
  aperturas del cartel contra clics en "Más información" por lugar.
- `2026-10-13_origen_rutas.sql`: migración que permite guardar como `origen`
  la ruta elegida (`ruta-a` … `ruta-d`) en vez de la estación de metro.
- La conexión a la base (URL + clave publicable) vive en la capa de negocio:
  `js/business/visitService.js`.
