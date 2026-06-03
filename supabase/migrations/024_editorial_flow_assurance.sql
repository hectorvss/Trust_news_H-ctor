-- ============================================================
-- 024: EDITORIAL FLOW ASSURANCE
-- End-to-end controls for extraction, refresh, validation, and
-- manager-only publication in the Supabase-first news pipeline.
-- ============================================================

create extension if not exists vector;

-- Source controls: Spain-first today, ready for international expansion later.
alter table public.sources
  add column if not exists country text default 'España',
  add column if not exists language text default 'es',
  add column if not exists allow_full_content boolean not null default false,
  add column if not exists editorial_weight numeric not null default 1,
  add column if not exists reliability_score numeric not null default 0.75,
  add column if not exists political_lean text,
  add column if not exists source_status text not null default 'active',
  add column if not exists last_checked_at timestamptz,
  add column if not exists last_error_at timestamptz,
  add column if not exists error_count integer not null default 0,
  add column if not exists articles_ingested integer not null default 0;

do $$
begin
  update public.sources
  set political_lean = coalesce(political_lean, bias),
      country = coalesce(country, pais, 'España'),
      source_status = case when activo then 'active' else 'paused' end
  where political_lean is null or country is null or source_status is null;
end
$$;

-- Raw article lifecycle and extraction metadata.
alter table public.raw_articles
  add column if not exists pipeline_status text not null default 'ingested',
  add column if not exists extraction_status text not null default 'pending',
  add column if not exists extracted_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists failure_reason text,
  add column if not exists structured_data jsonb default '{}'::jsonb;

create index if not exists idx_raw_articles_pipeline_status
  on public.raw_articles (pipeline_status, ingested_at desc);

create index if not exists idx_raw_articles_extraction_status
  on public.raw_articles (extraction_status, ingested_at desc);

-- Controlled full-text storage. Content can be skipped per source policy.
create table if not exists public.article_content (
  article_id uuid primary key references public.raw_articles(id) on delete cascade,
  extraction_status text not null default 'pending',
  extraction_method text,
  content_text text,
  content_excerpt text,
  word_count integer default 0,
  char_count integer default 0,
  extracted_entities jsonb default '[]'::jsonb,
  extracted_claims jsonb default '[]'::jsonb,
  extracted_figures jsonb default '[]'::jsonb,
  extracted_quotes jsonb default '[]'::jsonb,
  extracted_documents jsonb default '[]'::jsonb,
  extracted_location text,
  extracted_tone text,
  permission_basis text,
  robots_checked boolean default false,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_article_content_status
  on public.article_content (extraction_status, updated_at desc);

alter table public.article_content enable row level security;

do $$
begin
  drop policy if exists "article_content service_role all" on public.article_content;
  create policy "article_content service_role all" on public.article_content
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

  drop policy if exists "article_content managers read" on public.article_content;
  create policy "article_content managers read" on public.article_content
    for select
    using (public.is_manager());
end
$$;

-- Cluster readiness and refresh controls.
alter table public.story_clusters
  add column if not exists confidence_score numeric default 0,
  add column if not exists diversity_score numeric default 0,
  add column if not exists freshness_score numeric default 0,
  add column if not exists synthesis_score numeric default 0,
  add column if not exists refresh_needed boolean not null default false,
  add column if not exists refreshed_at timestamptz;

alter table public.story_clusters
  drop constraint if exists story_clusters_status_check;

alter table public.story_clusters
  add constraint story_clusters_status_check
  check (status in ('forming','ready','materialized','refresh_pending','promoted','dismissed'));

-- Story validation controls.
alter table public.stories
  add column if not exists editorial_validation jsonb default '{}'::jsonb,
  add column if not exists last_cluster_refresh_at timestamptz;

-- Manager review queue now includes draft/refresh visibility.
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
  sc.confidence_score,
  sc.diversity_score,
  sc.freshness_score,
  sc.synthesis_score,
  sc.refresh_needed,
  sc.window_start,
  sc.window_end,
  sc.last_seen_at,
  sc.status,
  sc.story_id,
  sc.created_at,
  sc.updated_at,
  s.title as story_title,
  s.status as story_status,
  s.review_status,
  s.editorial_validation
from public.story_clusters sc
left join public.stories s on sc.story_id = s.id
where sc.status in ('forming', 'ready', 'materialized', 'refresh_pending')
order by sc.refresh_needed desc, sc.article_count desc, sc.created_at desc;

grant select on public.manager_review_queue to authenticated;
