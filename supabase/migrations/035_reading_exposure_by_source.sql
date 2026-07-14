-- FASE C — "Mi Sesgo de Lectura": clasificación de exposición por FUENTE real.
--
-- La migración 034 desbloqueó la escritura de bias_logs, pero el tracking de
-- nivel-story colapsaba cada lectura a un único bucket 'Cobertura agregada', así
-- que los KPIs de fuentes (FUENTES CONSULTADAS, Distribución Ideológica, logros
-- "Lector Multifuente"/"Descubridor de Medios", diversidad) salían degenerados.
--
-- Aquí se registra la exposición real: al leer una noticia se inserta UNA fila por
-- fuente (source + bias de story.articles), con fallback a medios_analizados y
-- luego a 'Cobertura agregada'. Dedup por (identidad, story, fuente) para que
-- reabrir no multiplique; en reaperturas/ticks se acumulan segundos sobre las
-- filas existentes. Nombres de fuente normalizados con initcap para no duplicar
-- "EL PAÍS" vs "El País".

create or replace function public.bias_bucket(p text)
returns text language sql immutable as $$
  select case
    when p is null then 'center'
    when lower(p) like '%left%' or lower(p) like '%izq%' then 'left'
    when lower(p) like '%right%' or lower(p) like '%der%' then 'right'
    else 'center'
  end;
$$;

create or replace function public.log_reading_exposure(
  p_user_id uuid default null,
  p_session_id text default null,
  p_story_id text default null,
  p_seconds integer default 0,
  p_read_at timestamptz default now()
) returns integer
language plpgsql security definer set search_path=public
as $$
declare v_story stories%rowtype; v_dom text; v_new int;
begin
  if p_story_id is null then return 0; end if;
  select * into v_story from stories where id = p_story_id;
  if not found then return 0; end if;

  v_dom := case
    when (coalesce(v_story.coverage_left,0)+coalesce(v_story.coverage_center,0)+coalesce(v_story.coverage_right,0))=0 then 'center'
    when coalesce(v_story.coverage_left,0) >= coalesce(v_story.coverage_center,0)
     and coalesce(v_story.coverage_left,0) >= coalesce(v_story.coverage_right,0) then 'left'
    when coalesce(v_story.coverage_right,0) >= coalesce(v_story.coverage_center,0) then 'right'
    else 'center' end;

  with pairs as (
    select distinct on (src) src, public.bias_bucket(bias_raw) as lo
    from (
      select initcap(nullif(trim(a->>'source'),'')) as src, a->>'bias' as bias_raw
      from jsonb_array_elements(coalesce(v_story.articles,'[]'::jsonb)) a
    ) a0 where src is not null order by src
  ),
  fb_medios as (
    select distinct initcap(nullif(trim(m),'')) as src, v_dom as lo
    from jsonb_array_elements_text(coalesce(v_story.medios_analizados,'[]'::jsonb)) m
    where not exists (select 1 from pairs) and nullif(trim(m),'') is not null
  ),
  fb_agg as (
    select 'Cobertura agregada'::text as src, v_dom as lo
    where not exists (select 1 from pairs) and not exists (select 1 from fb_medios)
  ),
  all_src as (
    select src, lo from pairs union all select src, lo from fb_medios union all select src, lo from fb_agg
  ),
  fresh as (
    select src, lo from all_src s
    where not exists (
      select 1 from bias_logs bl
      where bl.story_id = p_story_id and bl.source_name = s.src
        and ((p_user_id is not null and bl.user_id = p_user_id) or (p_user_id is null and bl.session_id = p_session_id))
    )
  ),
  cnt as (select count(*) c from fresh),
  ins as (
    insert into bias_logs(user_id, session_id, story_id, source_name, bias_category, bias_leido, article_bias, seconds_read, read_duration_seconds, created_at)
    select p_user_id, p_session_id, p_story_id, f.src, upper(f.lo), f.lo, f.lo,
           greatest(0, round(coalesce(p_seconds,0)::numeric / nullif((select c from cnt),0)))::int,
           greatest(0, round(coalesce(p_seconds,0)::numeric / nullif((select c from cnt),0)))::int,
           p_read_at
    from fresh f returning 1
  )
  select count(*) into v_new from ins;

  if v_new = 0 and coalesce(p_seconds,0) > 0 then
    update bias_logs bl
      set seconds_read = coalesce(seconds_read,0) + greatest(1, round(p_seconds::numeric /
            nullif((select count(*) from bias_logs b2 where b2.story_id=p_story_id
              and ((p_user_id is not null and b2.user_id=p_user_id) or (p_user_id is null and b2.session_id=p_session_id))),0)))::int,
          read_duration_seconds = coalesce(read_duration_seconds,0) + greatest(1, round(p_seconds::numeric /
            nullif((select count(*) from bias_logs b2 where b2.story_id=p_story_id
              and ((p_user_id is not null and b2.user_id=p_user_id) or (p_user_id is null and b2.session_id=p_session_id))),0)))::int
    where bl.story_id=p_story_id
      and ((p_user_id is not null and bl.user_id=p_user_id) or (p_user_id is null and bl.session_id=p_session_id));
  end if;

  return v_new;
end;
$$;

grant execute on function public.bias_bucket(text) to anon, authenticated;
grant execute on function public.log_reading_exposure(uuid, text, text, integer, timestamptz) to anon, authenticated;

-- Rehace el backfill del historial usando exposición por fuente (sustituye las
-- filas 'Cobertura agregada' de la 034).
delete from bias_logs where source_name = 'Cobertura agregada';
do $$
declare r record;
begin
  for r in select user_id, story_id, read_at from reading_history where user_id is not null loop
    perform public.log_reading_exposure(r.user_id, null, r.story_id, 30, r.read_at);
  end loop;
end $$;
