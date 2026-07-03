-- ============================================================
-- 035: BACKFILL — per-article coverage detail on pipeline stories
--
-- Until now, materialize-cluster only persisted the AGGREGATED
-- coverage_left/center/right percentages and discarded which article/source
-- produced each count. That meant the reader-facing "Coverage Details" panel
-- had nothing to show per source for any auto-generated (pipeline) story —
-- no logos, no per-source bias, no way to click through to the article.
--
-- materialize-cluster (Edge Function) has been updated to persist a compact
-- `articles` jsonb array going forward. This migration backfills the rows
-- that were already materialized before that fix, deriving the same
-- structure from raw_articles + sources (both service-role/manager-only
-- tables — this is why the backfill runs here, with elevated privileges,
-- rather than being computed client-side).
--
-- ⚠️ VERIFY BEFORE RUNNING: `stories.article_ids` type was added ad-hoc
-- (not in a tracked migration). Check it first:
--   select data_type from information_schema.columns
--   where table_name = 'stories' and column_name = 'article_ids';
-- If it reports "ARRAY" (uuid[]), use PATH A below (unnest). If it reports
-- "jsonb", use PATH B (commented at the bottom) instead.
-- ============================================================

-- ── PATH A: article_ids is uuid[] ──────────────────────────────────────────
update public.stories st
set articles = sub.articles
from (
  select
    st2.id as story_id,
    jsonb_agg(
      jsonb_build_object(
        'source', coalesce(s.nombre, s.name, 'Fuente'),
        'sourceId', s.id,
        'url', ra.url,
        'title', ra.title,
        'time', ra.published_at,
        'origin', coalesce(s.country, s.pais),
        'summary', coalesce(ra.excerpt, ra.content_excerpt),
        'bias', case s.bias
          when 'izquierda' then 'LEFT'
          when 'centroizquierda' then 'LEAN_LEFT'
          when 'centro' then 'CENTER'
          when 'centroderecha' then 'LEAN_RIGHT'
          when 'derecha' then 'RIGHT'
          else 'CENTER'
        end,
        'factuality', s.factuality,
        'ownershipCategory', s.ownership
      )
      order by ra.published_at desc nulls last
    ) as articles
  from public.stories st2
  cross join lateral unnest(st2.article_ids) as article_id(id)
  join public.raw_articles ra on ra.id = article_id.id
  join public.sources s on s.id = ra.source_id
  where st2.is_auto_generated = true
    and st2.article_ids is not null
    and array_length(st2.article_ids, 1) > 0
  group by st2.id
) sub
where st.id = sub.story_id
  and (st.articles is null or jsonb_array_length(st.articles) = 0);

-- ── PATH B (use instead of Path A if article_ids turned out to be jsonb) ──
-- update public.stories st
-- set articles = sub.articles
-- from (
--   select
--     st2.id as story_id,
--     jsonb_agg(
--       jsonb_build_object(
--         'source', coalesce(s.nombre, s.name, 'Fuente'),
--         'sourceId', s.id,
--         'url', ra.url,
--         'title', ra.title,
--         'time', ra.published_at,
--         'origin', coalesce(s.country, s.pais),
--         'summary', coalesce(ra.excerpt, ra.content_excerpt),
--         'bias', case s.bias
--           when 'izquierda' then 'LEFT'
--           when 'centroizquierda' then 'LEAN_LEFT'
--           when 'centro' then 'CENTER'
--           when 'centroderecha' then 'LEAN_RIGHT'
--           when 'derecha' then 'RIGHT'
--           else 'CENTER'
--         end,
--         'factuality', s.factuality,
--         'ownershipCategory', s.ownership
--       )
--       order by ra.published_at desc nulls last
--     ) as articles
--   from public.stories st2
--   cross join lateral jsonb_array_elements_text(st2.article_ids) as article_id
--   join public.raw_articles ra on ra.id::text = article_id
--   join public.sources s on s.id = ra.source_id
--   where st2.is_auto_generated = true
--     and jsonb_array_length(coalesce(st2.article_ids, '[]'::jsonb)) > 0
--   group by st2.id
-- ) sub
-- where st.id = sub.story_id
--   and (st.articles is null or jsonb_array_length(st.articles) = 0);
