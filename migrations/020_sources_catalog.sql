-- ============================================================
-- 020: CATÁLOGO DE FUENTES (Fase 0.1-0.2 del roadmap)
-- Tabla sources con metadatos de sesgo para el núcleo español
-- y la ampliación internacional / sectorial del pipeline de ingesta.
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
  country     text        not null default 'España',
  language    text        not null default 'es',
  source_scope text       not null default 'national',
  region      text,
  media_type  text,
  fact_check_score numeric not null default 0.75,
  bias_confidence numeric not null default 0.75,
  economic_lean text,
  social_lean  text,
  translation_status text not null default 'native',
  allow_full_content boolean not null default false,
  editorial_weight numeric not null default 1,
  reliability_score numeric not null default 0.75,
  political_lean text,
  source_status text not null default 'active',
  last_checked_at timestamptz,
  last_error_at timestamptz,
  error_count integer not null default 0,
  articles_ingested integer not null default 0,
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

-- ============================================================
-- Supplemental expansion: international, sports, tech, economy
-- and lifestyle feeds to widen the operational news surface.
-- ============================================================
insert into public.sources (nombre, url, rss_url, bias, factuality, ownership) values

-- International / cross-border
('The Guardian - World',
 'https://www.theguardian.com/world',
 'https://www.theguardian.com/world/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('The Guardian - Politics',
 'https://www.theguardian.com/politics',
 'https://www.theguardian.com/politics/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('The Guardian - Business',
 'https://www.theguardian.com/business',
 'https://www.theguardian.com/us/business/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('The Guardian - Science',
 'https://www.theguardian.com/science',
 'https://www.theguardian.com/science/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('The Guardian - Football',
 'https://www.theguardian.com/football',
 'https://www.theguardian.com/football/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('The Guardian - Technology',
 'https://www.theguardian.com/technology',
 'https://www.theguardian.com/technology/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('The Guardian - Environment',
 'https://www.theguardian.com/environment',
 'https://www.theguardian.com/environment/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('The Guardian - Culture',
 'https://www.theguardian.com/culture',
 'https://www.theguardian.com/culture/rss',
 'centroizquierda', 'alta', 'Guardian Media Group'),

('France 24 - World',
 'https://www.france24.com/en',
 'https://www.france24.com/en/rss',
 'centro', 'alta', 'France Médias Monde'),

('France 24 - Español',
 'https://www.france24.com/es',
 'https://www.france24.com/es/rss',
 'centro', 'alta', 'France Médias Monde'),

('Al Jazeera English',
 'https://www.aljazeera.com',
 'https://www.aljazeera.com/xml/rss/all.xml',
 'centro', 'alta', 'Al Jazeera Media Network'),

('Deutsche Welle International',
 'https://www.dw.com/en',
 'https://rss.dw.com/rdf/rss-en-all',
 'centro', 'alta', 'Deutsche Welle'),

('The New York Times - World',
 'https://www.nytimes.com/section/world',
 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
 'centroizquierda', 'alta', 'The New York Times Company'),

('The New York Times - Business',
 'https://www.nytimes.com/section/business',
 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
 'centroizquierda', 'alta', 'The New York Times Company'),

('The New York Times - Technology',
 'https://www.nytimes.com/section/technology',
 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
 'centroizquierda', 'alta', 'The New York Times Company'),

('The New York Times - Sports',
 'https://www.nytimes.com/section/sports',
 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
 'centroizquierda', 'alta', 'The New York Times Company'),

-- Sports / current affairs / entertainment
('AS - Actualidad',
 'https://as.com/actualidad',
 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/actualidad/portada/',
 'centro', 'alta', 'PRISA / AS'),

('AS - Fútbol',
 'https://as.com/futbol',
 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/futbol/portada/',
 'centro', 'alta', 'PRISA / AS'),

('AS - Baloncesto',
 'https://as.com/baloncesto',
 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/baloncesto/portada/',
 'centro', 'alta', 'PRISA / AS'),

('AS - Tenis',
 'https://as.com/tenis',
 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/tenis/portada/',
 'centro', 'alta', 'PRISA / AS'),

('AS - Ciclismo',
 'https://as.com/ciclismo',
 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/ciclismo/portada/',
 'centro', 'alta', 'PRISA / AS'),

('AS - Más Deporte',
 'https://as.com/masdeporte',
 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/masdeporte/portada/',
 'centro', 'alta', 'PRISA / AS'),

('AS - Tikitakas',
 'https://as.com/tikitakas',
 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/tikitakas/portada/',
 'centro', 'media', 'PRISA / AS'),

-- Tech / economy / lifestyle
('Xataka',
 'https://www.xataka.com',
 'https://feeds.weblogssl.com/xataka2',
 'centro', 'alta', 'Weblogs SL'),

('Genbeta',
 'https://www.genbeta.com',
 'https://feeds.weblogssl.com/genbeta',
 'centro', 'alta', 'Weblogs SL'),

('Xataka Móvil',
 'https://www.xatakamovil.com',
 'https://feeds.weblogssl.com/xatakamovil',
 'centro', 'alta', 'Weblogs SL'),

('Xataka Android',
 'https://www.xatakandroid.com',
 'https://feeds.weblogssl.com/xatakandroid',
 'centro', 'alta', 'Weblogs SL'),

('Xataka Ciencia',
 'https://www.xatakaciencia.com',
 'https://feeds.weblogssl.com/xatakaciencia',
 'centro', 'alta', 'Weblogs SL'),

('Xataka Foto',
 'https://www.xatakafoto.com',
 'https://feeds.weblogssl.com/xatakafoto',
 'centro', 'alta', 'Weblogs SL'),

('El Blog Salmón',
 'https://www.elblogsalmon.com',
 'https://feeds.weblogssl.com/elblogsalmon2',
 'centro', 'alta', 'Weblogs SL'),

('Motorpasión',
 'https://www.motorpasion.com',
 'https://feeds.weblogssl.com/motorpasion',
 'centro', 'alta', 'Weblogs SL'),

('Motorpasión Moto',
 'https://www.motorpasionmoto.com',
 'https://feeds.weblogssl.com/motorpasionmoto',
 'centro', 'alta', 'Weblogs SL'),

('Motorpasión F1',
 'https://www.motorpasionf1.com',
 'https://feeds.weblogssl.com/motorpasionf1',
 'centro', 'alta', 'Weblogs SL'),

('Directo al Paladar',
 'https://www.directoalpaladar.com',
 'https://feeds.weblogssl.com/directoalpaladar',
 'centro', 'alta', 'Weblogs SL'),

('Vitónica',
 'https://www.vitonica.com',
 'https://feeds.weblogssl.com/vitonica',
 'centro', 'alta', 'Weblogs SL'),

('Decoesfera',
 'https://www.decoesfera.com',
 'https://feeds.weblogssl.com/decoesfera',
 'centro', 'alta', 'Weblogs SL'),

('Trendencias',
 'https://www.trendencias.com',
 'https://feeds.weblogssl.com/trendencias',
 'centro', 'media', 'Weblogs SL')

on conflict (url) do update set
  nombre      = excluded.nombre,
  rss_url     = excluded.rss_url,
  bias        = excluded.bias,
  factuality  = excluded.factuality,
  ownership   = excluded.ownership,
  updated_at  = now();

update public.sources
set
  country = 'United Kingdom',
  language = 'en',
  source_scope = 'international',
  region = 'Europe',
  media_type = 'newspaper',
  fact_check_score = 0.82,
  bias_confidence = 0.78,
  political_lean = 'centroizquierda',
  translation_status = 'native',
  reliability_score = 0.86
where nombre like 'The Guardian%';

update public.sources
set
  country = 'France',
  language = case when nombre = 'France 24 - Español' then 'es' else 'en' end,
  source_scope = 'international',
  region = 'Europe',
  media_type = 'broadcaster',
  fact_check_score = 0.83,
  bias_confidence = 0.75,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.86
where nombre like 'France 24%';

update public.sources
set
  country = 'Qatar',
  language = 'en',
  source_scope = 'international',
  region = 'Middle East',
  media_type = 'broadcaster',
  fact_check_score = 0.82,
  bias_confidence = 0.74,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.82
where nombre = 'Al Jazeera English';

update public.sources
set
  country = 'Germany',
  language = 'en',
  source_scope = 'international',
  region = 'Europe',
  media_type = 'public broadcaster',
  fact_check_score = 0.9,
  bias_confidence = 0.8,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.9
where nombre = 'Deutsche Welle International';

update public.sources
set
  country = 'United States',
  language = 'en',
  source_scope = 'international',
  region = 'North America',
  media_type = 'newspaper',
  fact_check_score = 0.86,
  bias_confidence = 0.8,
  political_lean = 'centroizquierda',
  translation_status = 'native',
  reliability_score = 0.88
where nombre like 'The New York Times%';

update public.sources
set
  country = 'España',
  language = 'es',
  source_scope = 'sports',
  region = 'Spain',
  media_type = 'sports portal',
  fact_check_score = 0.74,
  bias_confidence = 0.72,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.8
where nombre like 'AS - %';

update public.sources
set
  country = 'España',
  language = 'es',
  source_scope = 'technology',
  region = 'Spain',
  media_type = 'digital magazine',
  fact_check_score = 0.8,
  bias_confidence = 0.76,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.82
where nombre in ('Xataka', 'Genbeta', 'Xataka Móvil', 'Xataka Android', 'Xataka Ciencia', 'Xataka Foto');

update public.sources
set
  country = 'España',
  language = 'es',
  source_scope = 'economy',
  region = 'Spain',
  media_type = 'digital magazine',
  fact_check_score = 0.79,
  bias_confidence = 0.74,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.8
where nombre in ('El Blog Salmón');

update public.sources
set
  country = 'España',
  language = 'es',
  source_scope = 'automotive',
  region = 'Spain',
  media_type = 'digital magazine',
  fact_check_score = 0.78,
  bias_confidence = 0.72,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.8
where nombre in ('Motorpasión', 'Motorpasión Moto', 'Motorpasión F1');

update public.sources
set
  country = 'España',
  language = 'es',
  source_scope = 'lifestyle',
  region = 'Spain',
  media_type = 'digital magazine',
  fact_check_score = 0.77,
  bias_confidence = 0.72,
  political_lean = 'centro',
  translation_status = 'native',
  reliability_score = 0.79
where nombre in ('Directo al Paladar', 'Vitónica', 'Decoesfera', 'Trendencias');
