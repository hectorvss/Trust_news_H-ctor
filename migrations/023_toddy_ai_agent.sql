-- ==========================================
-- TODDY: PER-STORY AI AGENT, CREDITS & TRACEABILITY
-- ==========================================

alter table public.profiles
  add column if not exists ai_credit_balance integer not null default 0,
  add column if not exists ai_credit_updated_at timestamp with time zone default now();

create table if not exists public.toddy_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, story_id)
);

create table if not exists public.toddy_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid not null references public.toddy_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  depth text check (depth in ('basic', 'deep', 'source_audit')),
  thinking_states jsonb not null default '[]'::jsonb,
  sources_used jsonb not null default '[]'::jsonb,
  token_usage jsonb not null default '{}'::jsonb,
  credits_charged integer not null default 0,
  model text,
  status text not null default 'completed',
  confidence numeric,
  created_at timestamp with time zone default now()
);

create table if not exists public.ai_credit_ledger (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  balance_after integer not null,
  reason text not null,
  idempotency_key text unique,
  stripe_session_id text,
  story_id text references public.stories(id) on delete set null,
  message_id uuid references public.toddy_messages(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_toddy_conversations_user_story on public.toddy_conversations(user_id, story_id);
create index if not exists idx_toddy_messages_conversation_created on public.toddy_messages(conversation_id, created_at);
create index if not exists idx_toddy_messages_story_created on public.toddy_messages(story_id, created_at desc);
create index if not exists idx_ai_credit_ledger_user_created on public.ai_credit_ledger(user_id, created_at desc);

alter table public.toddy_conversations enable row level security;
alter table public.toddy_messages enable row level security;
alter table public.ai_credit_ledger enable row level security;

drop policy if exists "toddy conversations select own" on public.toddy_conversations;
create policy "toddy conversations select own" on public.toddy_conversations
  for select using (auth.uid() = user_id);

drop policy if exists "toddy conversations select manager" on public.toddy_conversations;
create policy "toddy conversations select manager" on public.toddy_conversations
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
  );

drop policy if exists "toddy messages select own" on public.toddy_messages;
create policy "toddy messages select own" on public.toddy_messages
  for select using (auth.uid() = user_id);

drop policy if exists "toddy messages select manager" on public.toddy_messages;
create policy "toddy messages select manager" on public.toddy_messages
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
  );

drop policy if exists "ai credit ledger select own" on public.ai_credit_ledger;
create policy "ai credit ledger select own" on public.ai_credit_ledger
  for select using (auth.uid() = user_id);

drop policy if exists "ai credit ledger select manager" on public.ai_credit_ledger;
create policy "ai credit ledger select manager" on public.ai_credit_ledger
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
  );

create or replace function public.grant_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_idempotency_key text default null,
  p_stripe_session_id text default null,
  p_metadata jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'credit grant amount must be positive';
  end if;

  if p_idempotency_key is not null and exists (
    select 1 from public.ai_credit_ledger where idempotency_key = p_idempotency_key
  ) then
    select ai_credit_balance into v_balance from public.profiles where id = p_user_id;
    return coalesce(v_balance, 0);
  end if;

  update public.profiles
  set ai_credit_balance = coalesce(ai_credit_balance, 0) + p_amount,
      ai_credit_updated_at = now()
  where id = p_user_id
  returning ai_credit_balance into v_balance;

  insert into public.ai_credit_ledger (
    user_id, delta, balance_after, reason, idempotency_key, stripe_session_id, metadata
  ) values (
    p_user_id, p_amount, coalesce(v_balance, p_amount), p_reason, p_idempotency_key, p_stripe_session_id, p_metadata
  );

  return coalesce(v_balance, p_amount);
end;
$$;

create or replace function public.consume_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_story_id text default null,
  p_message_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_amount < 0 then
    raise exception 'credit consume amount cannot be negative';
  end if;

  select coalesce(ai_credit_balance, 0)
  into v_balance
  from public.profiles
  where id = p_user_id
  for update;

  if p_amount > 0 and coalesce(v_balance, 0) < p_amount then
    return false;
  end if;

  update public.profiles
  set ai_credit_balance = coalesce(ai_credit_balance, 0) - p_amount,
      ai_credit_updated_at = now()
  where id = p_user_id
  returning ai_credit_balance into v_balance;

  insert into public.ai_credit_ledger (
    user_id, delta, balance_after, reason, story_id, message_id, metadata
  ) values (
    p_user_id, -p_amount, coalesce(v_balance, 0), p_reason, p_story_id, p_message_id, p_metadata
  );

  return true;
end;
$$;

create or replace view public.toddy_manager_metrics_24h as
select
  count(*) filter (where m.role = 'assistant') as toddy_responses_24h,
  coalesce(sum(m.credits_charged) filter (where m.role = 'assistant'), 0) as credits_consumed_24h,
  count(*) filter (where m.role = 'assistant' and m.credits_charged = 0) as free_responses_24h,
  count(*) filter (where m.role = 'assistant' and m.status = 'low_confidence') as low_confidence_responses_24h,
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

create or replace view public.toddy_story_metrics as
select
  story_id,
  count(*) filter (where role = 'assistant') as response_count,
  count(distinct user_id) as unique_users,
  coalesce(sum(credits_charged) filter (where role = 'assistant'), 0) as credits_consumed,
  max(created_at) as last_toddy_activity
from public.toddy_messages
group by story_id;
