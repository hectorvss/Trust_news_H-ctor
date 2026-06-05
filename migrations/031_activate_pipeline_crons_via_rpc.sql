-- ============================================================
-- 031: Helper RPC para verificar estado de crons (informativo)
-- NOTA: Migración 029 no se puede ejecutar vía SQL debido a permisos
-- de Supabase en cron.job. Usar Supabase UI en lugar de esto:
-- https://app.supabase.com/project/[ID]/database/crons
-- ============================================================

-- RPC que retorna el estado actual de los crons (solo lectura)
create or replace function public.check_pipeline_crons_status()
returns table(jobname text, active boolean, schedule text, status text) as $$
begin
  return query
  select
    j.jobname,
    j.active,
    j.schedule,
    case
      when j.active then '✓ ACTIVE'
      else '✗ INACTIVE'
    end as status
  from cron.job j
  where j.jobname in (
    'trust-news-ingest',
    'trust-news-embed',
    'trust-news-keyword-cluster',
    'trust-news-cluster',
    'trust-news-materialize',
    'trust-news-synthesize'
  )
  order by j.jobname;
end;
$$ language plpgsql;

-- Verificar estado actual
select * from public.check_pipeline_crons_status();
