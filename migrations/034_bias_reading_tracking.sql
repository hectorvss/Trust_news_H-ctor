-- ============================================================
-- 034: BIAS READING TRACKING — estructura completa y por-usuario
-- Consolida lo que estaba suelto en scratch/bias_tracking_migration.sql
-- en una migración oficial e idempotente. Alimenta el módulo "Mi Sesgo"
-- (BiasAnalysis.jsx) vía getBiasStats() y getBiasTrend().
--
-- Cada fila queda ligada a un usuario (user_id) o, para anónimos, a un
-- session_id. La lectura está protegida por RLS: cada usuario solo ve lo
-- suyo. La escritura entra por el RPC log_bias_read (SECURITY DEFINER).
-- ============================================================

create table if not exists public.bias_logs (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  session_id    text,                              -- anónimos
  story_id      text not null,
  bias_category text not null,                     -- 'LEFT' | 'CENTER' | 'RIGHT'
  source_name   text,
  seconds_read  integer default 0,
  created_at    timestamptz default now()
);

-- Índices para las agregaciones por usuario / sesión y por fecha (getBiasTrend)
create index if not exists idx_bias_logs_user_id    on public.bias_logs(user_id);
create index if not exists idx_bias_logs_session_id on public.bias_logs(session_id);
create index if not exists idx_bias_logs_created_at on public.bias_logs(created_at);
create index if not exists idx_bias_logs_user_date  on public.bias_logs(user_id, created_at);

-- Guard de dominio: solo aceptamos los tres cubos canónicos
do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'bias_logs' and constraint_name = 'bias_logs_category_check'
  ) then
    alter table public.bias_logs
      add constraint bias_logs_category_check
      check (bias_category in ('LEFT', 'CENTER', 'RIGHT'));
  end if;
end
$$;

alter table public.bias_logs enable row level security;

-- ── RLS: cada usuario (o sesión anónima) solo ve/gestiona lo suyo ──
do $$
begin
  drop policy if exists "Users can view own bias logs"   on public.bias_logs;
  create policy "Users can view own bias logs" on public.bias_logs
    for select using (
      (auth.uid() is not null and auth.uid() = user_id)
      or (auth.uid() is null and session_id is not null)
    );

  drop policy if exists "Users can insert own bias logs" on public.bias_logs;
  create policy "Users can insert own bias logs" on public.bias_logs
    for insert with check (
      (auth.uid() is not null and auth.uid() = user_id)
      or (auth.uid() is null and session_id is not null)
    );
end
$$;

-- ── RPC de escritura (SECURITY DEFINER: cablea la escritura sin exponer la tabla) ──
create or replace function public.log_bias_read(
  p_session_id   text,
  p_user_id      uuid,
  p_story_id     text,
  p_bias_category text,
  p_source_name  text,
  p_seconds_read integer
) returns void as $$
begin
  -- Normalización defensiva: cualquier etiqueta se colapsa a LEFT/CENTER/RIGHT
  insert into public.bias_logs (session_id, user_id, story_id, bias_category, source_name, seconds_read)
  values (
    p_session_id,
    p_user_id,
    p_story_id,
    case
      when upper(p_bias_category) in ('LEFT','IZQUIERDA','LEAN_LEFT','CENTER-LEFT','CENTRO-IZQUIERDA') then 'LEFT'
      when upper(p_bias_category) in ('RIGHT','DERECHA','LEAN_RIGHT','CENTER-RIGHT','CENTRO-DERECHA')  then 'RIGHT'
      else 'CENTER'
    end,
    p_source_name,
    coalesce(p_seconds_read, 0)
  );
end;
$$ language plpgsql security definer;

grant execute on function public.log_bias_read(text, uuid, text, text, text, integer)
  to anon, authenticated, service_role;

-- reading_history ya existe (migration 001) con RLS por usuario. La dejamos
-- intacta; este módulo solo la consume vía getReadingHistory().
