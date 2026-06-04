-- ==========================================
-- TODDY: RESEARCH AGENT TRACEABILITY
-- ==========================================

alter table public.toddy_messages
  drop constraint if exists toddy_messages_depth_check;

alter table public.toddy_messages
  add constraint toddy_messages_depth_check
  check (depth in ('quick', 'deep', 'research', 'audit', 'basic', 'source_audit'));

alter table public.toddy_messages
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.toddy_web_research_results (
  id uuid default gen_random_uuid() primary key,
  story_id text not null references public.stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  message_id uuid references public.toddy_messages(id) on delete set null,
  provider text not null,
  query text not null,
  url text,
  title text,
  source text,
  snippet text,
  web_result_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  unique(story_id, provider, web_result_id)
);

create index if not exists idx_toddy_messages_metadata_gin on public.toddy_messages using gin (metadata);
create index if not exists idx_toddy_web_research_story_created on public.toddy_web_research_results(story_id, created_at desc);
create index if not exists idx_toddy_web_research_message on public.toddy_web_research_results(message_id);

alter table public.toddy_web_research_results enable row level security;

drop policy if exists "toddy web research select manager" on public.toddy_web_research_results;
create policy "toddy web research select manager" on public.toddy_web_research_results
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
  );

drop policy if exists "toddy web research select own" on public.toddy_web_research_results;
create policy "toddy web research select own" on public.toddy_web_research_results
  for select using (auth.uid() = user_id);

create or replace view public.toddy_manager_metrics_24h as
select
  count(*) filter (where m.role = 'assistant') as toddy_responses_24h,
  coalesce(sum(m.credits_charged) filter (where m.role = 'assistant'), 0) as credits_consumed_24h,
  count(*) filter (where m.role = 'assistant' and m.credits_charged = 0) as free_responses_24h,
  count(*) filter (where m.role = 'assistant' and m.status = 'low_confidence') as low_confidence_responses_24h,
  count(*) filter (where m.role = 'assistant' and coalesce((m.metadata->'web_research'->>'enabled')::boolean, false)) as web_research_responses_24h,
  coalesce(sum(jsonb_array_length(coalesce(m.metadata->'web_research'->'results', '[]'::jsonb))) filter (where m.role = 'assistant'), 0) as web_urls_consulted_24h,
  count(*) filter (where m.role = 'assistant' and jsonb_array_length(coalesce(m.metadata->'validation'->'errors', '[]'::jsonb)) > 0) as validation_failures_24h,
  jsonb_object_agg(depth, depth_count) filter (where depth is not null) as depth_distribution_24h
from public.toddy_messages m
left join (
  select depth, count(*) as depth_count
  from public.toddy_messages
  where role = 'assistant'
    and created_at >= now() - interval '24 hours'
  group by depth
) d using (depth)
where m.created_at >= now() - interval '24 hours';
