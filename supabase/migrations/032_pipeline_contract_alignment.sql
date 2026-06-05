-- ============================================================
-- 032: PIPELINE CONTRACT ALIGNMENT
-- Fija los desajustes entre schema y funciones del pipeline.
-- ============================================================

alter table public.raw_articles
  add column if not exists status text not null default 'raw';

alter table public.story_clusters
  add column if not exists source_ids jsonb not null default '[]'::jsonb;

create index if not exists idx_raw_articles_status
  on public.raw_articles (status, ingested_at desc);

do $$
begin
  update public.raw_articles
  set status = coalesce(status, 'raw')
  where status is null;

  update public.story_clusters sc
  set source_ids = coalesce(
    sc.source_ids,
    (
      select coalesce(jsonb_agg(distinct ra.source_id), '[]'::jsonb)
      from public.raw_articles ra
      where ra.cluster_id = sc.id
    )
  )
  where sc.source_ids is null or sc.source_ids = '[]'::jsonb;
end
$$;
