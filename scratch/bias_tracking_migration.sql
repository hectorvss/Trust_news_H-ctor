
-- ==========================================
-- BIAS TRACKING SYSTEM MIGRATION
-- ==========================================

create table if not exists public.bias_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_id text, -- for anonymous users
  story_id text not null,
  bias_category text not null, -- 'LEFT', 'CENTER', 'RIGHT'
  source_name text,
  seconds_read integer default 0,
  created_at timestamp with time zone default now()
);

-- Index for performance on aggregations
create index if not exists idx_bias_logs_user_id on public.bias_logs(user_id);
create index if not exists idx_bias_logs_session_id on public.bias_logs(session_id);

-- RLS
alter table public.bias_logs enable row level security;

create policy "Users can view own bias logs" on public.bias_logs
  for select using (auth.uid() = user_id or session_id = current_setting('request.headers')::jsonb->>'x-session-id');

create policy "Users can insert own bias logs" on public.bias_logs
  for insert with check (auth.uid() = user_id or session_id = current_setting('request.headers')::jsonb->>'x-session-id');

-- Create an RPC to safely log bias reading
create or replace function log_bias_read(
  p_session_id text,
  p_user_id uuid,
  p_story_id text,
  p_bias_category text,
  p_source_name text,
  p_seconds_read integer
) returns void as $$
begin
  insert into bias_logs (session_id, user_id, story_id, bias_category, source_name, seconds_read)
  values (p_session_id, p_user_id, p_story_id, p_bias_category, p_source_name, p_seconds_read);
end;
$$ language plpgsql security definer;
