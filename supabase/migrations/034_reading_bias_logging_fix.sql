-- FASE C — "Mi Sesgo de Lectura": arreglar el logging de bias por lectura.
--
-- Diagnóstico: toda la infraestructura (tabla bias_logs, clasificador dominantLean,
-- tracking en App.jsx via pingUsage, UI BiasAnalysis, getBiasStats/getBiasTrend) ya
-- existía y estaba cableada, pero bias_logs quedaba SIEMPRE a 0 filas por dos
-- bloqueos apilados en el RPC log_bias_read:
--   1) El overload que llama el frontend (named args p_user_id/p_bias_category…)
--      declaraba p_story_id UUID, pero los story_id son TEXT ("ley-vivienda-2024",
--      "auto-…") → cada escritura moría con "invalid input syntax for type uuid",
--      y el overload la tragaba (EXCEPTION WHEN OTHERS THEN NULL).
--   2) La columna legacy bias_leido era NOT NULL + CHECK (left|center|right) en
--      minúscula, y article_bias CHECK (left|center|right|unknown); nadie las
--      rellenaba con el valor/caja correctos.
--
-- Fix: redefinir el overload de usuario con p_story_id TEXT, poblar las tres
-- columnas de bias con la caja que espera cada una (bias_category MAYÚSCULA para
-- getBiasStats; bias_leido/article_bias minúscula para los CHECK), relajar el
-- NOT NULL de bias_leido, y endurecer también el overload legacy.

alter table public.bias_logs alter column bias_leido drop not null;

drop function if exists public.log_bias_read(text, uuid, uuid, text, text, integer);

-- Overload de usuario (el que llama pingUsage → log_bias_read en el frontend).
create or replace function public.log_bias_read(
  p_session_id text default null,
  p_user_id uuid default null,
  p_story_id text default null,
  p_bias_category text default null,
  p_source_name text default null,
  p_seconds_read integer default 0
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_up text := upper(coalesce(nullif(p_bias_category,''), 'CENTER'));
  v_lo text;
begin
  if v_up not in ('LEFT','CENTER','RIGHT') then v_up := 'CENTER'; end if;
  v_lo := lower(v_up);
  insert into bias_logs (
    session_id, user_id, story_id,
    bias_category, bias_leido, article_bias, source_name, seconds_read
  )
  values (
    p_session_id, coalesce(p_user_id, auth.uid()), p_story_id,
    v_up, v_lo, v_lo, p_source_name, coalesce(p_seconds_read, 0)
  );
end;
$$;

grant execute on function public.log_bias_read(text, uuid, text, text, text, integer) to anon, authenticated;

-- Overload legacy (article-level) — normaliza caja para no romper los CHECK.
create or replace function public.log_bias_read(
  p_session_id text default null,
  p_story_id text default null,
  p_article_bias text default 'unknown',
  p_source_name text default null,
  p_source_bias text default null,
  p_read_duration integer default 0
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_lo text := lower(coalesce(nullif(p_article_bias,''),'unknown'));
begin
  if v_lo not in ('left','center','right','unknown') then v_lo := 'unknown'; end if;
  insert into bias_logs (
    user_id, session_id, story_id, article_bias, bias_category, bias_leido,
    source_name, source_bias, read_duration_seconds, seconds_read
  )
  values (
    auth.uid(), p_session_id, p_story_id, v_lo,
    case when v_lo='unknown' then 'CENTER' else upper(v_lo) end,
    case when v_lo='unknown' then 'center' else v_lo end,
    p_source_name, p_source_bias, coalesce(p_read_duration,0), coalesce(p_read_duration,0)
  );
end;
$$;

-- Backfill: convierte el reading_history existente en bias_logs, calculando el
-- sesgo dominante de cada story desde coverage_left/center/right (o el bias jsonb),
-- con created_at = read_at para respetar los filtros de periodo de la UI.
insert into bias_logs (user_id, story_id, bias_category, bias_leido, article_bias, source_name, seconds_read, read_duration_seconds, created_at)
select b.user_id, b.story_id, upper(b.lo), b.lo, b.lo, 'Cobertura agregada', 30, 30, b.read_at
from (
  select rh.user_id, rh.story_id, rh.read_at,
    case
      when (coalesce(s.coverage_left,0)+coalesce((s.bias->>'left')::numeric,0))
         >= (coalesce(s.coverage_center,0)+coalesce((s.bias->>'center')::numeric,0))
       and (coalesce(s.coverage_left,0)+coalesce((s.bias->>'left')::numeric,0))
         >= (coalesce(s.coverage_right,0)+coalesce((s.bias->>'right')::numeric,0))
       and (coalesce(s.coverage_left,0)+coalesce(s.coverage_center,0)+coalesce(s.coverage_right,0)
          + coalesce((s.bias->>'left')::numeric,0)+coalesce((s.bias->>'center')::numeric,0)+coalesce((s.bias->>'right')::numeric,0)) > 0
        then 'left'
      when (coalesce(s.coverage_right,0)+coalesce((s.bias->>'right')::numeric,0))
         >= (coalesce(s.coverage_center,0)+coalesce((s.bias->>'center')::numeric,0))
       and (coalesce(s.coverage_left,0)+coalesce(s.coverage_center,0)+coalesce(s.coverage_right,0)
          + coalesce((s.bias->>'left')::numeric,0)+coalesce((s.bias->>'center')::numeric,0)+coalesce((s.bias->>'right')::numeric,0)) > 0
        then 'right'
      else 'center'
    end as lo
  from reading_history rh
  join stories s on s.id = rh.story_id
  where rh.user_id is not null
) b
where not exists (
  select 1 from bias_logs bl
  where bl.user_id=b.user_id and bl.story_id=b.story_id and bl.source_name='Cobertura agregada'
);
