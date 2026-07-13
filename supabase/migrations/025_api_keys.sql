-- Trust News API — personal API keys + semantic search RPC.

create extension if not exists pgcrypto;

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'API key',
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default array['read','search','context'],
  tier text not null default 'free',
  daily_limit int not null default 1000,
  usage_date date,
  usage_count int not null default 0,
  total_requests bigint not null default 0,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_hash_idx on public.api_keys(key_hash) where revoked_at is null;
create index if not exists api_keys_user_idx on public.api_keys(user_id);

alter table public.api_keys enable row level security;

drop policy if exists "owner manages own api_keys" on public.api_keys;
create policy "owner manages own api_keys" on public.api_keys
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Generates the key server-side, stores only the sha256 hash, returns the
-- plaintext exactly once. Quota is DERIVED from the caller's subscription /
-- role (never chosen by the user). p_tier is kept for compat but ignored.
create or replace function public.create_api_key(p_name text default 'API key', p_tier text default null)
returns table(id uuid, api_key text, key_prefix text, tier text, daily_limit int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full text; v_hash text; v_pfx text;
  v_role text; v_sub text; v_tier text; v_limit int; v_scopes text[];
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  select role, subscription_tier into v_role, v_sub from public.profiles where id = auth.uid();
  if v_role in ('manager', 'admin_editor') then
    v_tier := 'business'; v_limit := 100000; v_scopes := array['read','search','context','drafts'];
  elsif lower(coalesce(v_sub, '')) in ('elite', 'business') then
    v_tier := 'elite'; v_limit := 100000; v_scopes := array['read','search','context'];
  elsif lower(coalesce(v_sub, '')) in ('premium', 'pro') then
    v_tier := 'premium'; v_limit := 10000; v_scopes := array['read','search','context'];
  else
    v_tier := 'free'; v_limit := 1000; v_scopes := array['read','search','context'];
  end if;
  v_full := 'tnf_live_' || encode(gen_random_bytes(24), 'hex');
  v_hash := encode(digest(v_full, 'sha256'), 'hex');
  v_pfx := left(v_full, 17);
  return query
    insert into public.api_keys(user_id, name, key_prefix, key_hash, tier, daily_limit, scopes)
    values (auth.uid(), coalesce(nullif(trim(p_name), ''), 'API key'), v_pfx, v_hash, v_tier, v_limit, v_scopes)
    returning api_keys.id, v_full, api_keys.key_prefix, api_keys.tier, api_keys.daily_limit;
end;
$$;

grant execute on function public.create_api_key(text, text) to authenticated;

-- Semantic search: nearest story clusters by centroid, joined to their story.
-- `query_embedding` is unsized so it works regardless of the stored dimension
-- (a runtime dim mismatch is caught by the API and falls back to keyword search).
create or replace function public.match_stories(query_embedding vector, match_count int default 10, allow_drafts boolean default false)
returns table(story_id text, similarity float)
language sql
stable
as $$
  select sc.story_id, 1 - (sc.centroid <=> query_embedding) as similarity
  from public.story_clusters sc
  join public.stories s on s.id = sc.story_id
  where sc.centroid is not null
    and sc.story_id is not null
    and (allow_drafts or s.status = 'published')
  order by sc.centroid <=> query_embedding asc
  limit match_count;
$$;

grant execute on function public.match_stories(vector, int, boolean) to service_role, authenticated;
