-- ============================================================
-- 023: SUPABASE-FIRST NEWS PIPELINE
-- Alinea el contrato de datos con el motor Supabase:
-- raw_articles -> story_clusters -> stories -> manager review.
-- ============================================================

create extension if not exists vector;

-- ── RAW ARTICLES ─────────────────────────────────────────────
alter table public.raw_articles
  add column if not exists content_hash text,
  add column if not exists embedded boolean not null default false,
  add column if not exists clustered boolean not null default false,
  add column if not exists lang text default 'es';

create unique index if not exists idx_raw_articles_content_hash
  on public.raw_articles (content_hash)
  where content_hash is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'raw_articles_cluster_id_fkey'
  ) then
    alter table public.raw_articles
      add constraint raw_articles_cluster_id_fkey
      foreign key (cluster_id) references public.story_clusters(id) on delete set null;
  end if;
end
$$;

-- ── STORY CLUSTERS ───────────────────────────────────────────
alter table public.story_clusters
  add column if not exists topic_summary text,
  add column if not exists coverage_left numeric default 0,
  add column if not exists coverage_center numeric default 0,
  add column if not exists coverage_right numeric default 0,
  add column if not exists left_pct numeric default 0,
  add column if not exists center_pct numeric default 0,
  add column if not exists right_pct numeric default 0,
  add column if not exists last_seen_at timestamptz,
  add column if not exists analysis jsonb,
  add column if not exists materialized_at timestamptz;

create index if not exists idx_story_clusters_last_seen_at
  on public.story_clusters (last_seen_at desc);

-- ── STORIES ──────────────────────────────────────────────────
alter table public.stories
  add column if not exists pipeline_cluster_id uuid references public.story_clusters(id) on delete set null,
  add column if not exists is_auto_generated boolean not null default false,
  add column if not exists review_status text default 'draft',
  add column if not exists cluster_status text,
  add column if not exists pipeline_generated_at timestamptz,
  add column if not exists generated_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists pipeline_rejected_reason text,
  add column if not exists consensus_narrative text,
  add column if not exists coverage_left numeric default 0,
  add column if not exists coverage_center numeric default 0,
  add column if not exists coverage_right numeric default 0,
  add column if not exists source_ids jsonb default '[]'::jsonb,
  add column if not exists medios_analizados jsonb default '[]'::jsonb,
  add column if not exists generation_metadata jsonb;

create index if not exists idx_stories_pipeline_cluster_id
  on public.stories (pipeline_cluster_id);

create index if not exists idx_stories_review_status
  on public.stories (review_status, status);

-- ── PIPELINE RUNS / OBSERVABILITY ────────────────────────────
create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  stage text not null,
  status text not null check (status in ('running', 'completed', 'failed')),
  source_id uuid references public.sources(id) on delete set null,
  cluster_id uuid references public.story_clusters(id) on delete set null,
  story_id text references public.stories(id) on delete set null,
  items_in integer default 0,
  items_out integer default 0,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  started_at timestamptz default now(),
  finished_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_pipeline_runs_stage_created_at
  on public.pipeline_runs (stage, created_at desc);

alter table public.pipeline_runs enable row level security;

do $$
begin
  drop policy if exists "pipeline_runs service_role all" on public.pipeline_runs;
  create policy "pipeline_runs service_role all" on public.pipeline_runs
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

  drop policy if exists "pipeline_runs managers read" on public.pipeline_runs;
  create policy "pipeline_runs managers read" on public.pipeline_runs
    for select
    using (public.is_manager());
end
$$;

-- ── MANAGER REVIEW QUEUE ────────────────────────────────────
create or replace view public.manager_review_queue as
select
  sc.id,
  sc.title,
  sc.topic_summary,
  sc.topic_keywords,
  sc.article_ids,
  sc.article_count,
  sc.source_count,
  sc.bias_distribution,
  sc.coverage_left,
  sc.coverage_center,
  sc.coverage_right,
  sc.left_pct,
  sc.center_pct,
  sc.right_pct,
  sc.window_start,
  sc.window_end,
  sc.last_seen_at,
  sc.status,
  sc.story_id,
  sc.created_at,
  sc.updated_at,
  s.title as story_title,
  s.status as story_status,
  s.review_status
from public.story_clusters sc
left join public.stories s on sc.story_id = s.id
where sc.status in ('forming', 'ready')
order by sc.article_count desc, sc.created_at desc;

grant select on public.manager_review_queue to authenticated;

-- ── PENDING CLUSTERS RPC ────────────────────────────────────
create or replace function public.get_pending_clusters(
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  cluster_id uuid,
  cluster_title text,
  cluster_status text,
  topic_summary text,
  topic_keywords text[],
  article_count integer,
  source_count integer,
  bias_distribution jsonb,
  coverage_left numeric,
  coverage_center numeric,
  coverage_right numeric,
  window_start timestamptz,
  window_end timestamptz,
  last_seen_at timestamptz,
  cluster_created timestamptz,
  articles jsonb
)
language sql
security definer
stable
as $$
  select
    sc.id as cluster_id,
    sc.title as cluster_title,
    sc.status as cluster_status,
    sc.topic_summary,
    sc.topic_keywords,
    sc.article_count,
    sc.source_count,
    sc.bias_distribution,
    sc.coverage_left,
    sc.coverage_center,
    sc.coverage_right,
    sc.window_start,
    sc.window_end,
    sc.last_seen_at,
    sc.created_at as cluster_created,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', ra.id,
            'title', ra.title,
            'url', ra.url,
            'excerpt', ra.excerpt,
            'author', ra.author,
            'published_at', ra.published_at,
            'image_url', ra.image_url,
            'source_name', src.nombre,
            'source_bias', src.bias
          )
          order by ra.published_at desc
        )
        from public.raw_articles ra
        left join public.sources src on src.id = ra.source_id
        where ra.cluster_id = sc.id
      ),
      '[]'::jsonb
    ) as articles
  from public.story_clusters sc
  where sc.status in ('forming', 'ready')
  order by sc.article_count desc, sc.created_at desc
  limit p_limit
  offset p_offset;
$$;

revoke execute on function public.get_pending_clusters(integer, integer) from public, anon;
grant execute on function public.get_pending_clusters(integer, integer) to authenticated;
