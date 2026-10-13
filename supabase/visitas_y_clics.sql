-- ConectaYungay — Tablas de visitas y clics en hitos del recorrido
-- Esquema ya creado en Supabase; se guarda aquí como referencia.

create table visitas (
  id            uuid primary key,
  creado_en     timestamptz not null default now(),
  edad          smallint not null check (edad between 0 and 120),
  nacionalidad  text not null check (char_length(nacionalidad) <= 60),
  comuna        text check (char_length(comuna) <= 60),
  motivo        text not null check (char_length(motivo) <= 60),
  -- ruta elegida; 'cumming' / 'quintanormal' son de visitas anteriores al 2026-10-13
  origen        text check (origen in ('cumming','quintanormal','ruta-a','ruta-b','ruta-c','ruta-d')),
  check (comuna is null or nacionalidad = 'Chile')
);

create table clics_info (
  id            bigint generated always as identity primary key,
  creado_en     timestamptz not null default now(),
  visita_id     uuid references visitas(id),
  punto_interes text not null check (char_length(punto_interes) <= 80),
  -- 'apertura': se abrió el cartel del hito · 'mas_info': se pulsó "Más información"
  accion        text not null default 'apertura' check (accion in ('apertura','mas_info'))
);

alter table visitas    enable row level security;
alter table clics_info enable row level security;

grant insert on visitas, clics_info to anon;
create policy "solo insertar" on visitas    for insert to anon with check (true);
create policy "solo insertar" on clics_info for insert to anon with check (true);
