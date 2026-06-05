-- ============================================================
-- 029: Reactivate all 6 pipeline crons (audit finding)
-- The crons were disabled post-audit. All fixes are committed
-- to fix/pipeline-revive and ready. Reactivate to restore:
-- - ingest-rss (every 15 min)
-- - embed-articles (every 1 min, batches up to 250/run)
-- - cluster-by-keywords (every 10 min)
-- - cluster-articles (every 30 min)
-- - materialize-cluster (every 45 min)
-- - generate-synthesis (every 5 min)
-- ============================================================
update cron.job set active = true
where jobname in (
  'trust-news-ingest',
  'trust-news-embed',
  'trust-news-keyword-cluster',
  'trust-news-cluster',
  'trust-news-materialize',
  'trust-news-synthesize'
);

-- Verify
select jobname, schedule, active,
  (case when active then '✓ ACTIVE' else '✗ INACTIVE' end) as status
from cron.job
where jobname like 'trust-news%' and jobname != 'trust-news-jobs-retention'
order by jobname;
