-- ==========================================
-- ENTERPRISE SUPABASE SCHEMA FOR TNE
-- Implemented with Idempotency (Safe to run multiple times)
-- ==========================================

-- I. CONVERSION & CLEANUP (For existing tables)
do $$
begin
    -- Convert stories id to text if it's uuid
    if exists (select 1 from information_schema.columns where table_name = 'stories' and column_name = 'id' and data_type = 'uuid') then
        alter table public.favorites drop constraint if exists favorites_story_id_fkey;
        alter table public.reading_history drop constraint if exists reading_history_story_id_fkey;
        alter table public.stories alter column id type text;
        alter table public.favorites alter column story_id type text;
        alter table public.reading_history alter column story_id type text;
    end if;

    -- Add role to profiles
    if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='role') then
        alter table public.profiles add column role text default 'reader';
    end if;
end
$$;

-- II. PROFILES TABLE (User Level)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text default 'reader', -- 'reader', 'manager', 'admin_editor'
  settings jsonb default '{
    "notifications": {
      "email": true,
      "push": false,
      "frequency": "daily"
    },
    "layout_density": "comfortable",
    "preferred_categories": []
  }'::jsonb,
  updated_at timestamp with time zone default now()
);

-- SECTIONS (Taxonomy)
create table if not exists public.sections (
  id text primary key,
  name text not null,
  slug text,
  description text
);

-- CATEGORIES (Taxonomy)
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text
);

-- III. STORIES TABLE (Company Level - Posts)
create table if not exists public.stories (
  id text primary key,
  category text not null,
  title text not null,
  summary text,
  image_url text,
  author text,
  time_label text,
  location text default 'España',
  bias jsonb not null default '{"left": 33, "center": 33, "right": 34}'::jsonb,
  factuality text default 'ALTA',
  source_count integer default 0,
  detail_stats jsonb default '[]'::jsonb,
  full_content text,
  perspectives jsonb default '{}'::jsonb,
  articles jsonb default '[]'::jsonb,
  -- Nuevos campos editoriales (Manager)
  perspectivas_info text,
  cronologia_info text,
  impacto_social text,
  impacto_sistemico text,
  consenso_narrativo text,
  fact_check text,
  blind_spot text,
  status text default 'published', -- draft, review, scheduled, published, archived
  slug text,
  excerpt text,
  section_id text,
  category_id text,
  published_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- IV. DOCUMENTS (Linked Editorial docs)
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  type text default 'internal_note', -- draft, analysis, research, source, note
  status text default 'draft',
  section_id text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- V. POST_DOCUMENTS (Many to Many relations)
create table if not exists public.post_documents (
  id uuid default gen_random_uuid() primary key,
  post_id text references public.stories(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  relation_type text default 'support',
  created_at timestamp with time zone default now(),
  unique(post_id, document_id)
);

-- VI. EDIT_HISTORY (Audit Log)
create table if not exists public.edit_history (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null, -- 'story', 'document'
  entity_id text not null,
  action text not null, -- 'create', 'update', 'status_change', 'delete'
  user_id uuid references auth.users(id),
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamp with time zone default now()
);

-- VII. APP CONFIG TABLE (Global Level)
create table if not exists public.app_config (
  id text primary key,
  trending_topics jsonb default '[]'::jsonb,
  global_headlines jsonb default '[]'::jsonb,
  last_updated timestamp with time zone default now()
);

-- VIII. FAVORITES & HISTORY TABLE (User Level)
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  story_id text not null,
  story_title text not null,
  story_category text,
  story_image text,
  created_at timestamp with time zone default now(),
  unique(user_id, story_id)
);

create table if not exists public.reading_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  story_id text not null,
  read_at timestamp with time zone default now()
);

-- IX. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.app_config enable row level security;
alter table public.favorites enable row level security;
alter table public.reading_history enable row level security;
alter table public.sections enable row level security;
alter table public.categories enable row level security;
alter table public.documents enable row level security;
alter table public.post_documents enable row level security;
alter table public.edit_history enable row level security;

-- DROP AND RECREATE POLICIES
do $$
begin
    -- Profiles
    drop policy if exists "Users can view own profile" on public.profiles;
    create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
    
    drop policy if exists "Users can update own profile" on public.profiles;
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

    -- Favorites & History
    drop policy if exists "Users manage own favorites" on public.favorites;
    create policy "Users manage own favorites" on public.favorites for all using (auth.uid() = user_id);

    drop policy if exists "Users manage own history" on public.reading_history;
    create policy "Users manage own history" on public.reading_history for all using (auth.uid() = user_id);

    -- Stories (Posts)
    -- Managers full access
    drop policy if exists "Managers can manage stories" on public.stories;
    create policy "Managers can manage stories" on public.stories for all using (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
    );
    -- Public Read Only published
    drop policy if exists "Public read stories" on public.stories;
    create policy "Public read stories" on public.stories for select using (status = 'published' or status is null);
    drop policy if exists "Public read published stories" on public.stories;

    -- App Config
    drop policy if exists "Public read app_config" on public.app_config;
    create policy "Public read app_config" on public.app_config for select using (true);

    -- Manager Entities (Documents, Post_Documents, Edit_History, Sections, Categories)
    drop policy if exists "Managers manage documents" on public.documents;
    create policy "Managers manage documents" on public.documents for all using (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
    );

    drop policy if exists "Managers manage post_documents" on public.post_documents;
    create policy "Managers manage post_documents" on public.post_documents for all using (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
    );

    drop policy if exists "Managers manage sections" on public.sections;
    create policy "Managers manage sections" on public.sections for all using (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
    );

    drop policy if exists "Managers manage categories" on public.categories;
    create policy "Managers manage categories" on public.categories for all using (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
    );

    drop policy if exists "Managers view history" on public.edit_history;
    create policy "Managers view history" on public.edit_history for select using (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
    );
    
    drop policy if exists "Managers insert history" on public.edit_history;
    create policy "Managers insert history" on public.edit_history for insert with check (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('manager', 'admin_editor'))
    );
end
$$;

-- X. AUTOMATION (TRIGGERS)

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_manager boolean;
begin
  is_manager := new.email = 'hectorvidal0411@gmail.com';
  
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'), case when is_manager then 'manager' else 'reader' end);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- XI. INITIAL SEED
insert into public.app_config (id, trending_topics, global_headlines)
values ('global_sidebar', 
  '["Ley de Vivienda", "FMI España", "Crisis Alquiler", "Reforma Mordaza", "Elecciones Hungría", "Inteligencia Artificial", "Energía Solar", "BCE", "Sánchez", "Mercado"]',
  '[{"t": "España aprueba la nueva ley de paridad en órganos constitucionales.", "w": "70%"}, {"t": "La inflación en la eurozona cae al 2.4%, abriendo puerta a bajada de tipos.", "w": "35%"}]'
) on conflict (id) do update 
set trending_topics = excluded.trending_topics, 
    global_headlines = excluded.global_headlines;

-- FORCED MANAGER SEED FOR EXISTING HECOTORVIDAL0411 ACCOUNT
-- Note: Requires executing context to have access to auth.users OR handles it passively if already run.
-- Fallback bypass if auth.users is inaccessible from client queries:
-- (Supabase handles this best via SQL Editor in project directly)
