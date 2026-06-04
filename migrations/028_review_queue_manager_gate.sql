-- ============================================================
-- 028: Gate manager_review_queue to managers (audit security advisor)
-- The view had NO authorization filter, so any authenticated user could read
-- all draft clusters/stories (editorial intel). admin_users_overview already
-- gates with is_admin_editor(); apply the same pattern here with is_manager().
-- Kept as a (definer) view + WHERE gate so managers keep full access without
-- depending on per-table RLS being present.
-- ============================================================
create or replace view public.manager_review_queue as
  select
    sc.id, sc.title, sc.topic_summary, sc.topic_keywords, sc.article_ids,
    sc.article_count, sc.source_count, sc.bias_distribution,
    sc.coverage_left, sc.coverage_center, sc.coverage_right,
    sc.left_pct, sc.center_pct, sc.right_pct,
    sc.confidence_score, sc.diversity_score, sc.freshness_score, sc.synthesis_score,
    sc.refresh_needed, sc.window_start, sc.window_end, sc.last_seen_at, sc.status,
    sc.story_id, sc.created_at, sc.updated_at,
    s.title as story_title, s.status as story_status, s.review_status, s.editorial_validation
  from public.story_clusters sc
    left join public.stories s on sc.story_id = s.id
  where sc.status = any (array['forming','ready','materialized','refresh_pending'])
    and public.is_manager()
  order by sc.refresh_needed desc, sc.article_count desc, sc.created_at desc;
