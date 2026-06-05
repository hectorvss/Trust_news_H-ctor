-- ============================================================
-- 030: Complete Toddy schema (023, 024, 025 combined + defensive)
-- Migraciones 023-025 no fueron aplicadas a Supabase. Toddy está
-- roto en producción: el código hace queries a tablas inexistentes.
-- Esta migración aplica el schema completo de forma defensiva.
-- ============================================================

-- Add missing columns to profiles (from 024)
alter table public.profiles
  add column if not exists ai_credit_balance integer not null default 0,
  add column if not exists ai_credit_updated_at timestamp with time zone default now();

-- Create toddy_conversations table (from 023)
create table if not exists public.toddy_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, story_id)
);

-- Create toddy_messages table (from 023)
create table if not exists public.toddy_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid not null references public.toddy_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  depth text check (depth in ('quick', 'deep', 'research', 'audit')),
  thinking_states jsonb not null default '[]'::jsonb,
  sources_used jsonb not null default '[]'::jsonb,
  token_usage jsonb not null default '{}'::jsonb,
  credits_charged integer not null default 0,
  credits_reserved integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on toddy tables (from 023)
alter table public.toddy_conversations enable row level security;
alter table public.toddy_messages enable row level security;

-- RLS policies: users can only read/write their own conversations (from 023)
drop policy if exists "Users read own conversations" on public.toddy_conversations;
create policy "Users read own conversations"
  on public.toddy_conversations for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own conversations" on public.toddy_conversations;
create policy "Users insert own conversations"
  on public.toddy_conversations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own messages" on public.toddy_messages;
create policy "Users read own messages"
  on public.toddy_messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own messages" on public.toddy_messages;
create policy "Users insert own messages"
  on public.toddy_messages for insert
  with check (auth.uid() = user_id);

-- Credit RPC functions (from 024) — service role only (revoked by 026)
create or replace function public.grant_ai_credits(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_source text,
  p_source_id text,
  p_metadata jsonb default null
) returns boolean as $$
declare
  v_cents integer;
begin
  v_cents := (p_amount * 100)::integer;
  update profiles set
    ai_credit_balance = ai_credit_balance + v_cents,
    ai_credit_updated_at = now()
  where id = p_user_id;
  return true;
end;
$$ language plpgsql security definer;

create or replace function public.consume_ai_credits(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_source text,
  p_message_id uuid,
  p_metadata jsonb default null
) returns boolean as $$
begin
  update profiles set
    ai_credit_balance = greatest(0, ai_credit_balance - (p_amount * 100)::integer),
    ai_credit_updated_at = now()
  where id = p_user_id;
  return true;
end;
$$ language plpgsql security definer;

-- Create unique index for T5 (one free answer per user+story) if doesn't exist
create unique index if not exists uq_toddy_free_answer_per_story
  on public.toddy_messages (user_id, story_id)
  where role = 'assistant' and credits_charged = 0;

-- Verify creation
select 'toddy_conversations' as table_name, count(*) as rows from public.toddy_conversations
union all
select 'toddy_messages', count(*) from public.toddy_messages
union all
select 'profiles (ai_credit_balance)', count(*) as rows from public.profiles where ai_credit_balance > 0 or ai_credit_balance = 0;
