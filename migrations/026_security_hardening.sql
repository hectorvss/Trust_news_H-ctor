-- ============================================================
-- 026: SECURITY HARDENING
-- Closes live privilege-escalation + Toddy billing holes found in audit.
-- Defensive (guards by existence) so it applies cleanly whether or not the
-- Toddy credit schema (023-025) is deployed.
-- ============================================================

-- ── 1. Block client privilege escalation on profiles ────────────────────
-- The 001 update policy `using (auth.uid() = id)` lets any authenticated user
-- rewrite ANY column of their own row — including role, subscription_tier and
-- (once deployed) ai_credit_balance. A user could self-promote to admin/elite
-- or mint credits straight from the anon-key client.
-- Guard: credits are server-only; role/tier only by admin_editor (admin panel)
-- or the service role (Stripe webhook). Updates from service_role/postgres pass
-- through untouched (auth.role() is only 'authenticated'/'anon' for clients).
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() in ('authenticated', 'anon') then
    -- role / subscription columns: only an admin_editor may change them
    if not coalesce(public.is_admin_editor(), false) then
      new.role := old.role;
      new.subscription_tier := old.subscription_tier;
      new.subscription_status := old.subscription_status;
    end if;
    -- credit columns: never client-writable (only service-role RPC / webhook).
    -- Guarded by key-existence so this is a no-op until 023/024 add the column.
    if to_jsonb(new) ? 'ai_credit_balance' then
      new.ai_credit_balance := old.ai_credit_balance;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_privileged on public.profiles;
create trigger trg_guard_profile_privileged
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- ── 2. Credit RPCs must not be client-callable (service role only) ───────
-- Postgres grants EXECUTE to PUBLIC by default; without a revoke a client can
-- call grant_ai_credits() to mint credits. The server uses the service key,
-- which bypasses these grants.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'grant_ai_credits') then
    execute 'revoke execute on function public.grant_ai_credits(uuid, numeric, text, text, text, jsonb) from public, anon, authenticated';
  end if;
  if exists (select 1 from pg_proc where proname = 'consume_ai_credits') then
    execute 'revoke execute on function public.consume_ai_credits(uuid, numeric, text, text, uuid, jsonb) from public, anon, authenticated';
  end if;
end
$$;

-- ── 3. stripe_events: RLS enabled but no policy → deny all client access ──
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='stripe_events') then
    drop policy if exists "stripe_events no client access" on public.stripe_events;
    execute 'create policy "stripe_events no client access" on public.stripe_events for all to anon, authenticated using (false) with check (false)';
  end if;
end
$$;
