-- ============================================================
-- 022: COLA DE REVISIÓN PARA MANAGERSTUDIO (Fase A.11 del roadmap)
-- Vista de revisión, RPC get_pending_clusters y extensión
-- de stories con metadatos de generación automática.
-- ============================================================

-- ── 1. EXTENSIÓN DE STORIES ──────────────────────────────────
-- Vincula una story aprobada con el cluster del que proviene.

alter table public.stories
  add column if not exists cluster_id          uuid    references public.story_clusters(id) on delete set null,
  add column if not exists auto_generated      boolean default false,
  add column if not exists generation_metadata jsonb;   -- prompt usado, modelo, tokens, timestamp, etc.


-- ── 2. VISTA: COLA DE REVISIÓN ───────────────────────────────
-- Clusters activos (forming / ready) enriquecidos con el estado
-- de la story asociada cuando ya ha sido promovida.

create or replace view public.manager_review_queue as
select
  sc.id,
  sc.title,
  sc.topic_keywords,
  sc.article_ids,
  sc.article_count,
  sc.source_count,
  sc.bias_distribution,
  sc.window_start,
  sc.window_end,
  sc.status,
  sc.story_id,
  sc.created_at,
  sc.updated_at,
  s.title  as story_title,
  s.status as story_status
from public.story_clusters sc
left join public.stories s on sc.story_id = s.id
where sc.status in ('ready', 'forming')
order by sc.article_count desc, sc.created_at desc;

grant select on public.manager_review_queue to authenticated;


-- ── 3. RPC: get_pending_clusters ─────────────────────────────
-- Devuelve clusters pendientes con sus artículos expandidos
-- (título, url, fuente, fecha, sesgo) para que el manager
-- pueda previsualizar el contenido antes de aprobar.

create or replace function public.get_pending_clusters(
  p_limit  integer default 20,
  p_offset integer default 0
)
returns table (
  cluster_id        uuid,
  cluster_title     text,
  cluster_status    text,
  topic_keywords    text[],
  article_count     integer,
  source_count      integer,
  bias_distribution jsonb,
  window_start      timestamptz,
  window_end        timestamptz,
  cluster_created   timestamptz,
  articles          jsonb        -- array de objetos {id, title, url, source, published_at, bias}
)
language sql
security definer
stable
as $$
  select
    sc.id                                             as cluster_id,
    sc.title                                          as cluster_title,
    sc.status                                         as cluster_status,
    sc.topic_keywords,
    sc.article_count,
    sc.source_count,
    sc.bias_distribution,
    sc.window_start,
    sc.window_end,
    sc.created_at                                     as cluster_created,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id',           ra.id,
            'title',        ra.title,
            'url',          ra.url,
            'excerpt',      ra.excerpt,
            'author',       ra.author,
            'published_at', ra.published_at,
            'image_url',    ra.image_url,
            'source_name',  src.nombre,
            'source_bias',  src.bias
          )
          order by ra.published_at desc
        )
        from public.raw_articles ra
        left join public.sources src on src.id = ra.source_id
        where ra.cluster_id = sc.id
      ),
      '[]'::jsonb
    )                                                 as articles
  from public.story_clusters sc
  where sc.status in ('forming', 'ready')
  order by sc.article_count desc, sc.created_at desc
  limit  p_limit
  offset p_offset;
$$;

-- Solo managers (verificado por is_manager() dentro de RLS) pueden
-- invocar esta función; service_role siempre tiene bypass.
revoke execute on function public.get_pending_clusters(integer, integer) from public, anon;
grant  execute on function public.get_pending_clusters(integer, integer) to authenticated;
