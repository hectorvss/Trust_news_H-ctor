-- ==========================================
-- 019: NOTIFICATIONS, NEWSLETTER & ADMIN PANEL
-- Idempotent — safe to run multiple times.
-- ==========================================

-- ── HELPER FUNCTIONS (SECURITY DEFINER to avoid RLS recursion) ──
create or replace function public.is_manager()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('manager', 'admin_editor')
  );
$$;

create or replace function public.is_admin_editor()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin_editor'
  );
$$;


-- ============================================================
-- 1. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  -- NULL user_id => broadcast to all users
  type text not null default 'info',  -- info | warning | success | editorial | system
  title text not null,
  message text,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, is_read, created_at desc);
create index if not exists idx_notifications_broadcast on public.notifications(created_at desc) where user_id is null;

alter table public.notifications enable row level security;

drop policy if exists "notifications select own or broadcast" on public.notifications;
create policy "notifications select own or broadcast" on public.notifications
  for select using (user_id = auth.uid() or user_id is null);

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (user_id = auth.uid());

drop policy if exists "notifications insert by managers" on public.notifications;
create policy "notifications insert by managers" on public.notifications
  for insert with check (public.is_manager());

drop policy if exists "notifications delete by admins" on public.notifications;
create policy "notifications delete by admins" on public.notifications
  for delete using (public.is_admin_editor());

-- Per-user "read receipts" for broadcast notifications (so each user can mark them as read individually)
create table if not exists public.notification_reads (
  user_id uuid references auth.users(id) on delete cascade,
  notification_id bigint references public.notifications(id) on delete cascade,
  read_at timestamp with time zone default now(),
  primary key (user_id, notification_id)
);

alter table public.notification_reads enable row level security;

drop policy if exists "notification_reads own" on public.notification_reads;
create policy "notification_reads own" on public.notification_reads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================
-- 2. NEWSLETTER
-- ============================================================
create table if not exists public.newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  full_name text,
  frequency text default 'weekly',  -- daily | weekly | breaking
  source text default 'footer',     -- footer | onboarding | story_cta
  is_active boolean default true,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index if not exists idx_newsletter_active on public.newsletter_subscribers(is_active, frequency);

alter table public.newsletter_subscribers enable row level security;

-- Anyone (anon or auth) can subscribe
drop policy if exists "newsletter insert anyone" on public.newsletter_subscribers;
create policy "newsletter insert anyone" on public.newsletter_subscribers
  for insert with check (true);

-- Subscriber sees their own row; managers see all
drop policy if exists "newsletter select own or manager" on public.newsletter_subscribers;
create policy "newsletter select own or manager" on public.newsletter_subscribers
  for select using (user_id = auth.uid() or public.is_manager());

-- Subscriber updates own; managers update any
drop policy if exists "newsletter update own or manager" on public.newsletter_subscribers;
create policy "newsletter update own or manager" on public.newsletter_subscribers
  for update using (user_id = auth.uid() or public.is_manager());

drop policy if exists "newsletter delete by admin" on public.newsletter_subscribers;
create policy "newsletter delete by admin" on public.newsletter_subscribers
  for delete using (public.is_admin_editor());


-- ============================================================
-- 3. ADMIN PROFILES ACCESS
-- ============================================================
-- Allow managers to read all profiles, admin_editors to update roles.
drop policy if exists "profiles select self or manager" on public.profiles;
create policy "profiles select self or manager" on public.profiles
  for select using (id = auth.uid() or public.is_manager());

drop policy if exists "profiles update self or admin" on public.profiles;
create policy "profiles update self or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin_editor());


-- ============================================================
-- 4. ADMIN VIEW: combines profile + email + usage
-- ============================================================
-- Note: views inherit RLS from underlying tables. The is_manager() check
-- on profiles ensures only managers can SELECT meaningful rows.
create or replace view public.admin_users_overview as
select
  p.id,
  u.email,
  u.created_at as signed_up_at,
  u.last_sign_in_at,
  p.full_name,
  p.role,
  p.subscription_tier,
  p.subscription_status,
  coalesce(um.articles_read, 0) as articles_read,
  coalesce(um.reading_seconds, 0) as reading_seconds
from public.profiles p
left join auth.users u on u.id = p.id
left join public.usage_metrics um on um.user_id = p.id;

grant select on public.admin_users_overview to authenticated;
