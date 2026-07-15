-- Infraestructura de email (Resend) para newsletter + notificaciones.
-- Las Edge Functions (newsletter-subscribe, send-newsletter) escriben aquí con
-- service_role (bypass RLS). Los managers pueden leer campañas y el log.

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text,
  kind text,                              -- welcome | newsletter | notification | test
  status text not null default 'sent',    -- sent | failed | skipped_no_key
  provider_id text,                       -- id de Resend
  error text,
  campaign_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists email_log_created_idx on public.email_log(created_at desc);

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html text,
  audience text default 'all',            -- all | daily | weekly | breaking
  recipients int not null default 0,
  sent int not null default 0,
  failed int not null default 0,
  status text not null default 'draft',   -- draft | sending | sent | failed
  sent_by uuid,
  created_at timestamptz not null default now()
);

-- Marca de bienvenida enviada (evita reenviarla en re-suscripciones).
alter table public.newsletter_subscribers add column if not exists welcome_sent_at timestamptz;

alter table public.email_log enable row level security;
alter table public.newsletter_campaigns enable row level security;

drop policy if exists "email_log manager read" on public.email_log;
create policy "email_log manager read" on public.email_log for select to authenticated
  using (exists (select 1 from profiles where id=auth.uid() and role in ('manager','admin_editor')));

drop policy if exists "campaigns manager read" on public.newsletter_campaigns;
create policy "campaigns manager read" on public.newsletter_campaigns for select to authenticated
  using (exists (select 1 from profiles where id=auth.uid() and role in ('manager','admin_editor')));

-- NOTA: requiere el secret RESEND_API_KEY (y opcional EMAIL_FROM) en
-- Supabase → Edge Functions → Secrets para que los emails salgan de verdad.
-- Sin la key, la suscripción funciona igual y el email queda como skipped_no_key.
