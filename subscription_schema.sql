-- ==========================================
-- SUBSCRIPTION & USAGE ECOSYSTEM MODEL
-- ==========================================

-- 1. SUBSCRIPTION PLANS
create table if not exists public.subscription_plans (
  slug text primary key,
  name text not null,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  article_limit integer, -- null means unlimited
  time_limit_minutes integer, -- null means unlimited
  features jsonb default '[]'::jsonb
);

insert into public.subscription_plans (slug, name, article_limit, time_limit_minutes, features)
values 
('free', 'Plan Gratuito', 3, 10, '["3 artículos de prueba", "10 minutos de lectura"]'::jsonb),
('premium', 'TNE Pro', null, null, '["Acceso ilimitado", "Análisis de inteligencia", "Ausencia de publicidad"]'::jsonb)
on conflict (slug) do update set 
article_limit = excluded.article_limit,
time_limit_minutes = excluded.time_limit_minutes;

-- 2. ENHANCE PROFILES FOR SUBSCRIPTION
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='subscription_tier') then
    alter table public.profiles 
      add column subscription_tier text default 'free',
      add column subscription_status text default 'none',
      add column stripe_customer_id text,
      add column stripe_subscription_id text,
      add column current_period_end timestamp with time zone,
      add column access_expires_at timestamp with time zone;
  end if;
end
$$;

-- 3. USAGE LOGS (Handles Anon + Auth)
create table if not exists public.usage_metrics (
  session_id text primary key, -- client-generated UUID for anon, or user.id for auth
  user_id uuid references auth.users(id) on delete set null,
  articles_read integer default 0,
  reading_seconds integer default 0,
  read_article_ids jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. STRIPE WEBHOOK EVENTS (Idempotency)
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamp with time zone default now(),
  processed_at timestamp with time zone default now()
);

-- 5. RLS POLICIES
alter table public.subscription_plans enable row level security;
alter table public.usage_metrics enable row level security;
alter table public.stripe_events enable row level security;

do $$
begin
  drop policy if exists "Public read plans" on public.subscription_plans;
  create policy "Public read plans" on public.subscription_plans for select using (true);
  
  drop policy if exists "Users read own usage" on public.usage_metrics;
  create policy "Users read own usage" on public.usage_metrics for select using (
    session_id = current_setting('request.headers')::jsonb->>'x-session-id' 
    or user_id = auth.uid()
  );
end
$$;

-- CREATE AN RPC TO SAFELY INCREMENT USAGE
create or replace function log_article_read(
  p_session_id text,
  p_user_id uuid,
  p_story_id text,
  p_read_seconds integer default 0
) returns void as $$
declare
  v_current jsonb;
  v_articles_read integer;
  v_seconds integer;
begin
  -- Upsert usage metrics securely
  insert into usage_metrics (session_id, user_id, articles_read, reading_seconds, read_article_ids)
  values (p_session_id, p_user_id, case when p_read_seconds = 0 then 1 else 0 end, p_read_seconds, case when p_read_seconds = 0 then jsonb_build_array(p_story_id) else '[]'::jsonb end)
  on conflict (session_id) do update
  set 
    user_id = coalesce(usage_metrics.user_id, p_user_id),
    reading_seconds = usage_metrics.reading_seconds + p_read_seconds,
    articles_read = case 
      when p_read_seconds = 0 and not (usage_metrics.read_article_ids @> jsonb_build_array(p_story_id))
      then usage_metrics.articles_read + 1
      else usage_metrics.articles_read
    end,
    read_article_ids = case 
      when p_read_seconds = 0 and not (usage_metrics.read_article_ids @> jsonb_build_array(p_story_id))
      then usage_metrics.read_article_ids || jsonb_build_array(p_story_id)
      else usage_metrics.read_article_ids
    end,
    updated_at = now();
end;
$$ language plpgsql security definer;
