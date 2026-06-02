-- ============================================================
-- 021: TABLAS DEL PIPELINE DE INGESTA (Fase 0.4 del roadmap)
-- raw_articles (con pgvector), ingestion_jobs, story_clusters.
-- Requiere la extensión vector (pgvector) habilitada en Supabase.
-- ============================================================

-- pgvector: debe estar habilitada en el proyecto Supabase
-- antes de ejecutar esta migración (Dashboard → Extensions → vector).
create extension if not exists vector;

-- ── 1. RAW_ARTICLES ─────────────────────────────────────────

create table if not exists public.raw_articles (
  id           uuid        primary key default gen_random_uuid(),
  source_id    uuid        references public.sources(id) on delete set null,
  url          text        not null unique,
  url_hash     text        not null,           -- SHA-256 para deduplicación O(1)
  title        text        not null,
  excerpt      text        check (length(excerpt) <= 300), -- cumplimiento legal
  author       text,
  published_at timestamptz,
  image_url    text,
  language     text        default 'es',
  embedding    vector(1536),                   -- OpenAI text-embedding-3-small
  cluster_id   uuid,                           -- FK diferida; se añade FK tras story_clusters
  ingested_at  timestamptz default now(),
  raw_metadata jsonb
);

create index if not exists idx_raw_articles_url_hash   on public.raw_articles (url_hash);
create index if not exists idx_raw_articles_source_id  on public.raw_articles (source_id);
create index if not exists idx_raw_articles_published  on public.raw_articles (published_at desc);
create index if not exists idx_raw_articles_cluster_id on public.raw_articles (cluster_id);

-- Índice IVFFlat para búsqueda vectorial por coseno (ANN).
-- lists=100 es razonable hasta ~1M vectores; ajustar si crece.
create index if not exists idx_raw_articles_embedding
  on public.raw_articles
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.raw_articles enable row level security;

do $$
begin
  drop policy if exists "raw_articles service_role write" on public.raw_articles;
  create policy "raw_articles service_role write" on public.raw_articles
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

  drop policy if exists "raw_articles managers read" on public.raw_articles;
  create policy "raw_articles managers read" on public.raw_articles
    for select
    using (public.is_manager());
end
$$;


-- ── 2. INGESTION_JOBS ────────────────────────────────────────

create table if not exists public.ingestion_jobs (
  id               uuid        primary key default gen_random_uuid(),
  source_id        uuid        references public.sources(id) on delete set null,
  status           text        not null check (status in ('pending','running','completed','failed')),
  started_at       timestamptz,
  completed_at     timestamptz,
  articles_found   integer     default 0,
  articles_new     integer     default 0,
  error_message    text,
  created_at       timestamptz default now()
);

create index if not exists idx_ingestion_jobs_source  on public.ingestion_jobs (source_id);
create index if not exists idx_ingestion_jobs_status  on public.ingestion_jobs (status, created_at desc);

alter table public.ingestion_jobs enable row level security;

do $$
begin
  drop policy if exists "ingestion_jobs service_role all" on public.ingestion_jobs;
  create policy "ingestion_jobs service_role all" on public.ingestion_jobs
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

  drop policy if exists "ingestion_jobs managers read" on public.ingestion_jobs;
  create policy "ingestion_jobs managers read" on public.ingestion_jobs
    for select
    using (public.is_manager());
end
$$;


-- ── 3. STORY_CLUSTERS ────────────────────────────────────────

create table if not exists public.story_clusters (
  id                  uuid        primary key default gen_random_uuid(),
  story_id            text        references public.stories(id) on delete set null,
  title               text,
  topic_keywords      text[],
  article_ids         uuid[],
  article_count       integer     default 0,
  source_count        integer     default 0,
  bias_distribution   jsonb,      -- {"izquierda": 0.3, "centro": 0.4, "derecha": 0.3}
  window_start        timestamptz,
  window_end          timestamptz,
  status              text        not null default 'forming'
                                  check (status in ('forming','ready','promoted','dismissed')),
  centroid_embedding  vector(1536),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_story_clusters_status     on public.story_clusters (status);
create index if not exists idx_story_clusters_story_id   on public.story_clusters (story_id);
create index if not exists idx_story_clusters_window     on public.story_clusters (window_start, window_end);

drop trigger if exists story_clusters_updated_at on public.story_clusters;
create trigger story_clusters_updated_at
  before update on public.story_clusters
  for each row execute function public.set_updated_at();

alter table public.story_clusters enable row level security;

do $$
begin
  drop policy if exists "story_clusters service_role all" on public.story_clusters;
  create policy "story_clusters service_role all" on public.story_clusters
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

  drop policy if exists "story_clusters managers read" on public.story_clusters;
  create policy "story_clusters managers read" on public.story_clusters
    for select
    using (public.is_manager());
end
$$;


-- ── 4. FK DIFERIDA: raw_articles.cluster_id → story_clusters ─

alter table public.raw_articles
  drop constraint if exists raw_articles_cluster_id_fkey;

alter table public.raw_articles
  add constraint raw_articles_cluster_id_fkey
  foreign key (cluster_id) references public.story_clusters(id) on delete set null;
