-- ConectaYungay — Migración 2026-10-13: el origen de la visita pasa a ser la ruta elegida
-- Ejecutar UNA vez en el editor SQL de Supabase, ANTES de publicar la versión
-- de la app que elige ruta (A, B, C, D) en vez de estación de metro.
-- Sin esta migración, las visitas nuevas no se guardan (la columna rechaza el valor).
--
-- Las filas anteriores conservan 'cumming' / 'quintanormal'.

alter table visitas drop constraint if exists visitas_origen_check;

alter table visitas
  add constraint visitas_origen_check
  check (origen in ('cumming','quintanormal','ruta-a','ruta-b','ruta-c','ruta-d'));
