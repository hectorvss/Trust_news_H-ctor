-- ==========================================
-- TODDY: FRACTIONAL TOKEN-BASED CREDITS
-- ==========================================

alter table public.profiles
  alter column ai_credit_balance type numeric(12,2)
  using ai_credit_balance::numeric;

alter table public.toddy_messages
  alter column credits_charged type numeric(12,2)
  using credits_charged::numeric;

alter table public.ai_credit_ledger
  alter column delta type numeric(12,2)
  using delta::numeric,
  alter column balance_after type numeric(12,2)
  using balance_after::numeric;

drop function if exists public.grant_ai_credits(uuid, integer, text, text, text, jsonb);
drop function if exists public.consume_ai_credits(uuid, integer, text, text, uuid, jsonb);

create or replace function public.grant_ai_credits(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_idempotency_key text default null,
  p_stripe_session_id text default null,
  p_metadata jsonb default '{}'::jsonb
) returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
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
  set ai_credit_balance = round((coalesce(ai_credit_balance, 0) + p_amount)::numeric, 2),
      ai_credit_updated_at = now()
  where id = p_user_id
  returning ai_credit_balance into v_balance;

  insert into public.ai_credit_ledger (
    user_id, delta, balance_after, reason, idempotency_key, stripe_session_id, metadata
  ) values (
    p_user_id, round(p_amount::numeric, 2), coalesce(v_balance, p_amount), p_reason, p_idempotency_key, p_stripe_session_id, p_metadata
  );

  return coalesce(v_balance, p_amount);
end;
$$;

create or replace function public.consume_ai_credits(
  p_user_id uuid,
  p_amount numeric,
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
  v_balance numeric;
  v_amount numeric;
begin
  v_amount := round(coalesce(p_amount, 0)::numeric, 2);
  if v_amount < 0 then
    raise exception 'credit consume amount cannot be negative';
  end if;

  select coalesce(ai_credit_balance, 0)
  into v_balance
  from public.profiles
  where id = p_user_id
  for update;

  if v_amount > 0 and coalesce(v_balance, 0) < v_amount then
    return false;
  end if;

  update public.profiles
  set ai_credit_balance = round((coalesce(ai_credit_balance, 0) - v_amount)::numeric, 2),
      ai_credit_updated_at = now()
  where id = p_user_id
  returning ai_credit_balance into v_balance;

  insert into public.ai_credit_ledger (
    user_id, delta, balance_after, reason, story_id, message_id, metadata
  ) values (
    p_user_id, -v_amount, coalesce(v_balance, 0), p_reason, p_story_id, p_message_id, p_metadata
  );

  return true;
end;
$$;
