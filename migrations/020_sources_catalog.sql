-- ============================================================
-- 020: CATÁLOGO DE FUENTES (Fase 0.1-0.2 del roadmap)
-- Tabla sources con metadatos de sesgo para los 35 medios
-- españoles del pipeline de ingesta.
-- ============================================================

create table if not exists public.sources (
  id          uuid        primary key default gen_random_uuid(),
  nombre      text        not null,
  url         text        not null unique,
  rss_url     text,
  bias        text        not null check (bias in ('izquierda','centroizquierda','centro','centroderecha','derecha')),
  factuality  text        not null check (factuality in ('muy_alta','alta','media','baja')),
  ownership   text,
  pais        text        not null default 'España',
  activo      boolean     not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.sources enable row level security;

do $$
begin
  drop policy if exists "sources service_role all" on public.sources;
  create policy "sources service_role all" on public.sources
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

  drop policy if exists "sources managers read" on public.sources;
  create policy "sources managers read" on public.sources
    for select
    using (public.is_manager() or auth.role() = 'service_role');
end
$$;

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sources_updated_at on public.sources;
create trigger sources_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();

-- ── SEED: 35 medios españoles ────────────────────────────────
insert into public.sources (nombre, url, rss_url, bias, factuality, ownership) values

-- Prensa generalista nacional
('El País',
 'https://elpais.com',
 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
 'centroizquierda', 'alta', 'Grupo Prisa'),

('El Mundo',
 'https://elmundo.es',
 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml',
 'centroderecha', 'alta', 'Unidad Editorial (RCS MediaGroup)'),

('ABC',
 'https://abc.es',
 'https://www.abc.es/rss/feeds/abc_EspanaEspana.xml',
 'derecha', 'alta', 'Vocento'),

('La Vanguardia',
 'https://lavanguardia.com',
 'https://www.lavanguardia.com/rss/home.xml',
 'centro', 'alta', 'Grupo Godó'),

('El Confidencial',
 'https://elconfidencial.com',
 'https://rss.elconfidencial.com/espana/',
 'centro', 'alta', 'Titania Compañía Editorial (independiente)'),

('elDiario.es',
 'https://eldiario.es',
 'https://www.eldiario.es/rss/',
 'izquierda', 'alta', 'Diario de Prensa Digital S.L. (cooperativa)'),

('El Español',
 'https://elespanol.com',
 'https://www.elespanol.com/rss/',
 'centroderecha', 'alta', 'El Español Publicaciones S.A. (Centenillo)'),

('La Razón',
 'https://larazon.es',
 'https://www.larazon.es/rss/',
 'derecha', 'media', 'Grupo Planeta'),

('Público',
 'https://publico.es',
 'https://www.publico.es/rss/',
 'izquierda', 'media', 'Mediapro'),

('20minutos',
 'https://20minutos.es',
 'https://www.20minutos.es/rss/',
 'centro', 'media', '20minutos Editora'),

-- Prensa económica
('Expansión',
 'https://expansion.com',
 'https://e00-expansion.uecdn.es/rss/portada.xml',
 'centroderecha', 'alta', 'Unidad Editorial (RCS MediaGroup)'),

('Cinco Días',
 'https://cincodias.elpais.com',
 'https://cincodias.elpais.com/rss/section/5datos/',
 'centro', 'alta', 'Grupo Prisa'),

('El Economista',
 'https://eleconomista.es',
 'https://www.eleconomista.es/rss/',
 'centroderecha', 'alta', 'Grupo El Economista'),

-- Medios progresistas / alternativos
('infoLibre',
 'https://infolibre.es',
 'https://www.infolibre.es/rss/',
 'izquierda', 'alta', 'infoLibre (cooperativa de periodistas)'),

('Libertad Digital',
 'https://libertaddigital.com',
 'https://www.libertaddigital.com/rss/',
 'derecha', 'media', 'Libertad Digital S.A.'),

('OKDiario',
 'https://okdiario.com',
 'https://okdiario.com/feed',
 'derecha', 'baja', 'Disseny Industrial 2015 S.L.'),

('CTXT — Contexto y Acción',
 'https://ctxt.es',
 null,
 'izquierda', 'alta', 'Tinta Libre Ediciones S.L.'),

('El Salto Diario',
 'https://elsaltodiario.com',
 'https://www.elsaltodiario.com/feed',
 'izquierda', 'alta', 'El Topo Tabernario Libros S.L.L. (cooperativa)'),

-- Prensa regional relevante
('Ara',
 'https://ara.cat',
 'https://www.ara.cat/rss.xml',
 'centroizquierda', 'alta', 'Premsa Independents S.A. (Grup Godó)'),

('El Periódico',
 'https://elperiodico.com',
 'https://www.elperiodico.com/es/rss/rss_portada.xml',
 'centroizquierda', 'alta', 'Prensa Ibérica'),

-- Televisión / medios audiovisuales (portales digitales)
('La Sexta Noticias',
 'https://lasexta.com/noticias',
 'https://www.lasexta.com/rss/noticias.xml',
 'centroizquierda', 'alta', 'Atresmedia'),

('Antena 3 Noticias',
 'https://antena3.com/noticias',
 'https://www.antena3.com/rss/noticias.xml',
 'centroderecha', 'alta', 'Atresmedia'),

('RTVE Noticias',
 'https://rtve.es/noticias',
 'https://api2.rtve.es/rss/temas_noticias.xml',
 'centro', 'alta', 'Corporación de Radio y Televisión Española (pública)'),

-- Agencias de noticias
('Europa Press',
 'https://europapress.es',
 'https://www.europapress.es/rss/rss.aspx',
 'centro', 'muy_alta', 'Europa Press Comunicaciones S.A.'),

('Agencia EFE',
 'https://efe.com',
 'https://www.efe.com/efe/espana/portada/rss_2.xml',
 'centro', 'muy_alta', 'Agencia EFE (pública, accionista mayoritario Estado)'),

-- Radio (portales digitales)
('Cadena SER',
 'https://cadenaser.com',
 'https://cadenaser.com/feed/',
 'centroizquierda', 'alta', 'Grupo Prisa'),

('COPE',
 'https://cope.es',
 'https://www.cope.es/rss',
 'derecha', 'alta', 'Conferencia Episcopal Española'),

('Onda Cero',
 'https://ondacero.es',
 'https://www.ondacero.es/feed/',
 'centroderecha', 'alta', 'Atresmedia'),

-- Nativos digitales / internacionales con edición ES
('El HuffPost',
 'https://huffingtonpost.es',
 'https://www.huffingtonpost.es/feeds/index.xml',
 'centroizquierda', 'alta', 'El HuffPost S.L. (Prisa / The Huffington Post)'),

-- Fact-checkers
('Newtral',
 'https://newtral.es',
 'https://www.newtral.es/feed/',
 'centro', 'muy_alta', 'Newtral Media S.L.'),

('Maldita.es',
 'https://maldita.es',
 'https://maldita.es/feed/',
 'centro', 'muy_alta', 'Maldita.es (asociación sin ánimo de lucro)'),

-- Más medios digitales
('Vozpópuli',
 'https://vozpopuli.com',
 'https://vozpopuli.com/feed/',
 'centroderecha', 'media', 'Vozpópuli Media S.L.'),

('Periodista Digital',
 'https://periodistadigital.com',
 'https://www.periodistadigital.com/feed/',
 'derecha', 'baja', 'Periodista Digital S.L.'),

-- Prensa regional (Vocento / Prensa Ibérica)
('El Diario Montañés',
 'https://eldiariomontanes.es',
 'https://www.eldiariomontanes.es/rss/feeds/noticias.xml',
 'centro', 'alta', 'Grupo Vocento'),

('La Nueva España',
 'https://lne.es',
 'https://www.lne.es/rss/feeds/noticias.xml',
 'centro', 'alta', 'Prensa Ibérica')

on conflict (url) do update set
  nombre      = excluded.nombre,
  rss_url     = excluded.rss_url,
  bias        = excluded.bias,
  factuality  = excluded.factuality,
  ownership   = excluded.ownership,
  updated_at  = now();
