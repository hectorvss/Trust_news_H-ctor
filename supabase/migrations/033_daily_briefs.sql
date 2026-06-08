-- ============================================================
-- 033: DAILY BRIEFS
-- Persisted editorial daily summary built from the analyzed corpus.
-- Reuses the existing DailySummary UI structure, but feeds it from
-- a real generated brief instead of a frontend-only aggregation.
-- ============================================================

create table if not exists public.daily_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_date date not null,
  scope text not null default 'es',
  status text not null default 'published'
    check (status in ('draft', 'published', 'archived')),
  title text not null,
  dek text,
  summary text not null default '',
  executive_summary jsonb default '[]'::jsonb,
  top_headlines jsonb default '[]'::jsonb,
  thematic_overview jsonb default '[]'::jsonb,
  coverage_stats jsonb default '{}'::jsonb,
  bias_distribution jsonb default '{}'::jsonb,
  consensus_notes jsonb default '{}'::jsonb,
  blind_spots jsonb default '[]'::jsonb,
  prospective_notes jsonb default '[]'::jsonb,
  methodology_note text,
  source_trace jsonb default '[]'::jsonb,
  evidence_quality jsonb default '{}'::jsonb,
  missing_evidence jsonb default '[]'::jsonb,
  generation_metadata jsonb default '{}'::jsonb,
  payload jsonb default '{}'::jsonb,
  source_count integer not null default 0,
  story_count integer not null default 0,
  article_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_daily_briefs_scope_date
  on public.daily_briefs (scope, brief_date desc);

create index if not exists idx_daily_briefs_status_date
  on public.daily_briefs (status, brief_date desc);

alter table public.daily_briefs enable row level security;

do $$
begin
  drop policy if exists "daily_briefs service_role all" on public.daily_briefs;
  create policy "daily_briefs service_role all" on public.daily_briefs
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

  drop policy if exists "daily_briefs public read published" on public.daily_briefs;
  create policy "daily_briefs public read published" on public.daily_briefs
    for select
    using (status = 'published');
end
$$;

grant select on public.daily_briefs to anon, authenticated;
