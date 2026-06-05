-- ============================================================
-- 032: PIPELINE CONTRACT ALIGNMENT
-- Fija los desajustes entre schema y funciones del pipeline.
-- ============================================================

alter table public.raw_articles
  add column if not exists status text not null default 'raw';

create index if not exists idx_raw_articles_status
  on public.raw_articles (status, ingested_at desc);

do $$
begin
  update public.raw_articles
  set status = coalesce(status, 'raw')
  where status is null;
end
$$;
