-- ConectaYungay — Migración 2026-11-04: pregunta "¿Cómo nos conociste?"
-- Ejecutar UNA vez en el editor SQL de Supabase, ANTES de publicar la versión
-- de la app que envía estas columnas (si no existen, las visitas no se guardan).
--
-- Las columnas admiten nulos: las visitas anteriores no tienen esta respuesta.

alter table visitas
  add column como_nos_conociste text
    check (como_nos_conociste in ('Instagram','Otros')),
  add column como_nos_conociste_otro text
    check (char_length(como_nos_conociste_otro) <= 60);

-- El texto libre solo se guarda cuando se eligió "Otros"
alter table visitas
  add constraint visitas_conociste_otro_check
  check (como_nos_conociste_otro is null or como_nos_conociste = 'Otros');


-- ─────────────────────────────────────────────────────────────
-- Consulta de análisis (ejecutar en el editor SQL cuando se quiera ver):
-- ─────────────────────────────────────────────────────────────
-- select
--   coalesce(como_nos_conociste_otro, como_nos_conociste, 'Sin respuesta') as canal,
--   count(*) as visitas
-- from visitas
-- group by 1
-- order by visitas desc;
