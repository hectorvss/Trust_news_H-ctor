-- ============================================
-- TNE (Trust News España) — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================

-- 1. PROFILES TABLE
-- Stores user metadata, plan tier, and preferences.
-- Linked 1:1 to auth.users via id.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  plan text default 'free' check (plan in ('free', 'premium', 'elite')),
  preferred_categories text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. FAVORITES TABLE
-- Stores which stories a user has favorited.
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id text not null,
  story_title text,
  story_category text,
  created_at timestamp with time zone default now(),
  unique(user_id, story_id)
);

-- 3. READING HISTORY TABLE
-- Logs every story a user opens for analytics.
create table if not exists public.reading_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id text not null,
  read_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Each user can only access their own data.
-- ============================================

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.reading_history enable row level security;

-- Profiles: users can read and update only their own profile.
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Favorites: users can manage only their own favorites.
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Reading History: users can manage only their own history.
create policy "Users can view own reading history"
  on public.reading_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own reading history"
  on public.reading_history for insert
  with check (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Trigger that creates a profiles row when a new user signs up.
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to make script idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
