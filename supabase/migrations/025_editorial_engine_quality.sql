-- Supabase-first editorial engine hardening:
-- richer extraction signals, source quality metadata and event fingerprints.

alter table public.article_content
  add column if not exists resolved_title text,
  add column if not exists subtitle text,
  add column if not exists lead text,
  add column if not exists canonical_url text,
  add column if not exists byline text,
  add column if not exists section text,
  add column if not exists published_at timestamptz,
  add column if not exists modified_at timestamptz,
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists outbound_links jsonb not null default '[]'::jsonb,
  add column if not exists extraction_quality_score numeric not null default 0,
  add column if not exists parser_used text,
  add column if not exists content_source text,
  add column if not exists paywall_detected boolean not null default false,
  add column if not exists blocked_reason text;

alter table public.raw_articles
  add column if not exists event_signature text,
  add column if not exists entity_fingerprint text;

alter table public.sources
  add column if not exists source_scope text not null default 'national',
  add column if not exists region text,
  add column if not exists media_type text,
  add column if not exists fact_check_score numeric not null default 0.75,
  add column if not exists bias_confidence numeric not null default 0.75,
  add column if not exists economic_lean text,
  add column if not exists social_lean text,
  add column if not exists translation_status text not null default 'native';

create index if not exists idx_article_content_quality
  on public.article_content (extraction_quality_score);

create index if not exists idx_article_content_blocking
  on public.article_content (paywall_detected, blocked_reason);

create index if not exists idx_raw_articles_event_signature
  on public.raw_articles (event_signature);

create index if not exists idx_raw_articles_entity_fingerprint
  on public.raw_articles (entity_fingerprint);

create or replace view public.source_quality_health as
select
  s.id,
  coalesce(s.nombre, s.id::text) as source_name,
  s.activo,
  s.country,
  s.language,
  s.source_scope,
  s.source_status,
  s.fact_check_score,
  s.bias_confidence,
  s.error_count,
  s.last_checked_at,
  s.last_error_at,
  count(ra.id) as raw_articles_count,
  count(ac.article_id) filter (where ac.extraction_status = 'completed') as extracted_count,
  count(ac.article_id) filter (where ac.paywall_detected) as paywalled_count,
  count(ac.article_id) filter (where ac.blocked_reason is not null) as blocked_count,
  avg(ac.extraction_quality_score) as avg_extraction_quality
from public.sources s
left join public.raw_articles ra on ra.source_id = s.id
left join public.article_content ac on ac.article_id = ra.id
group by s.id;
