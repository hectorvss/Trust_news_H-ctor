// Envío de newsletter a los suscriptores activos (Resend). Lo dispara el manager
// desde ManagerStudio → Comunicación → Newsletter. Autenticación: el JWT del
// usuario debe corresponder a un profile con role manager/admin_editor.
// Body: { subject, html, audience?='all'|'daily'|'weekly'|'breaking', test_email? }
import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM = Deno.env.get('EMAIL_FROM') || 'Trust News España <noticias@trustnews.es>';
const SITE = 'https://trustnews.es';
const MAX_RECIPIENTS = 500; // tope de seguridad por envío (evita timeouts/límites)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const wrap = (inner: string) => `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
  ${inner}
  <hr style="margin-top:32px;border:none;border-top:1px solid #eee">
  <p style="font-size:11px;color:#999">Trust News España · <a href="${SITE}" style="color:#999">trustnews.es</a></p>
</div>`;

// deno-lint-ignore no-explicit-any
async function logEmail(supa: any, to: string, subject: string, kind: string, status: string, provider_id: string | null, error: string | null, campaign_id: string | null) {
  try { await supa.from('email_log').insert({ to_email: to, subject, kind, status, provider_id, error, campaign_id }); } catch (_) { /* noop */ }
}

// deno-lint-ignore no-explicit-any
async function sendOne(supa: any, to: string, subject: string, html: string, kind: string, campaign_id: string | null) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { await logEmail(supa, to, subject, kind, 'failed', null, JSON.stringify(data).slice(0, 500), campaign_id); return { error: data }; }
  await logEmail(supa, to, subject, kind, 'sent', data.id ?? null, null, campaign_id);
  return { id: data.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  try {
    const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Auth: verificar que el llamante es manager/admin_editor.
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    if (!token) return json({ error: 'auth requerida' }, 401);
    const { data: { user } } = await supa.auth.getUser(token);
    if (!user) return json({ error: 'auth inválida' }, 401);
    const { data: prof } = await supa.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!prof || !['manager', 'admin_editor'].includes(prof.role)) return json({ error: 'solo managers' }, 403);

    const body = await req.json().catch(() => ({}));
    const subject = String(body.subject || '').trim();
    const html = String(body.html || '').trim();
    const audience = body.audience || 'all';
    const test_email = body.test_email ? String(body.test_email).toLowerCase().trim() : null;
    if (!subject || !html) return json({ error: 'subject y html son obligatorios' }, 400);

    // Envío de prueba a un único correo (no crea campaña).
    if (test_email) {
      if (!RESEND_API_KEY) return json({ error: 'RESEND_API_KEY no configurada', configured: false }, 503);
      const r = await sendOne(supa, test_email, `[PRUEBA] ${subject}`, wrap(html), 'test', null);
      return json({ ok: !r.error, test: true, result: r });
    }

    // Destinatarios.
    let q = supa.from('newsletter_subscribers').select('email').eq('is_active', true);
    if (audience !== 'all') q = q.eq('frequency', audience);
    const { data: subs } = await q.limit(MAX_RECIPIENTS);
    const recipients: string[] = [...new Set((subs || []).map((s: { email: string }) => s.email))];

    const { data: camp } = await supa.from('newsletter_campaigns')
      .insert({ subject, html, audience, recipients: recipients.length, status: 'sending', sent_by: user.id })
      .select('id').single();
    const campaignId = camp?.id ?? null;

    if (!RESEND_API_KEY) {
      await supa.from('newsletter_campaigns').update({ status: 'failed' }).eq('id', campaignId);
      return json({ error: 'RESEND_API_KEY no configurada', configured: false, recipients: recipients.length, campaign_id: campaignId }, 503);
    }
    if (!recipients.length) {
      await supa.from('newsletter_campaigns').update({ status: 'sent', sent: 0 }).eq('id', campaignId);
      return json({ ok: true, recipients: 0, sent: 0, failed: 0, campaign_id: campaignId });
    }

    let sent = 0, failed = 0;
    for (const to of recipients) {
      const r = await sendOne(supa, to, subject, wrap(html), 'newsletter', campaignId);
      if (r.error) failed++; else sent++;
    }
    await supa.from('newsletter_campaigns').update({ sent, failed, status: 'sent' }).eq('id', campaignId);
    return json({ ok: true, recipients: recipients.length, sent, failed, campaign_id: campaignId });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
