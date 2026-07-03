-- ============================================================
-- 036: Ownership category (normalizado) + related_topics
--
-- FACTUALIDAD ya existe en sources.factuality (enum ES) — el frontend la
-- normaliza a VERY_HIGH/HIGH/MIXED/LOW. Aquí añadimos la CATEGORÍA de
-- propiedad normalizada (teníamos solo el nombre del dueño), y una columna
-- related_topics en stories para los "temas relacionados" del pipeline.
--
-- El frontend ya deriva ownership_category en cliente (ownershipCategoryFrom
-- en supabaseService.js), así que esto es el respaldo canónico en BD +
-- backfill de los medios ya sembrados.
-- ============================================================

-- ── sources.ownership_category ──────────────────────────────────────────────
alter table public.sources
  add column if not exists ownership_category text;

-- Backfill por dueño conocido (catálogo 020). Orden: público → sin ánimo →
-- independiente → conglomerado → privado (por defecto).
update public.sources set ownership_category = 'PUBLIC'
  where ownership_category is null
    and (ownership ~* 'p[úu]blic|estatal|rtve|efe|france m[ée]dias|deutsche welle|al jazeera|corporaci[óo]n de radio');

update public.sources set ownership_category = 'NONPROFIT'
  where ownership_category is null
    and (ownership ~* 'sin [áa]nimo|asociaci[óo]n|episcopal|fundaci[óo]n|maldita|scott trust');

update public.sources set ownership_category = 'INDEPENDENT'
  where ownership_category is null
    and (ownership ~* 'cooperativa|independiente|titania|tinta libre|periodistas|topo tabernario');

update public.sources set ownership_category = 'CONGLOMERATE'
  where ownership_category is null
    and (ownership ~* 'grupo|conglomerad|prisa|vocento|planeta|atresmedia|prensa ib[ée]rica|unidad editorial|god[óo]|mediapro|guardian media|new york times');

update public.sources set ownership_category = 'PRIVATE'
  where ownership_category is null
    and ownership is not null and ownership <> '';

-- ── stories.related_topics ──────────────────────────────────────────────────
alter table public.stories
  add column if not exists related_topics jsonb default '[]'::jsonb;
