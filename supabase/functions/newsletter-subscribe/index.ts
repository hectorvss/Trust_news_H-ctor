// Suscripción a la newsletter + email de bienvenida (Resend).
// Público (verify_jwt=false): lo llama el formulario del footer. Inserta con
// service_role y, si RESEND_API_KEY está configurada, manda la bienvenida una
// sola vez (welcome_sent_at). Si la key no está, suscribe igual y omite el email.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM = Deno.env.get('EMAIL_FROM') || 'Trust News España <noticias@trustnews.es>';
const SITE = 'https://trustnews.es';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

// deno-lint-ignore no-explicit-any
async function logEmail(supa: any, to: string, subject: string, kind: string, status: string, provider_id: string | null, error: string | null) {
  try { await supa.from('email_log').insert({ to_email: to, subject, kind, status, provider_id, error }); } catch (_) { /* noop */ }
}

// deno-lint-ignore no-explicit-any
async function sendWelcome(supa: any, to: string, name: string | null) {
  if (!RESEND_API_KEY) { await logEmail(supa, to, 'Bienvenido a TNE', 'welcome', 'skipped_no_key', null, 'RESEND_API_KEY not set'); return { skipped: true }; }
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
    <div style="font-size:28px;font-weight:800;letter-spacing:-1px">TNE.</div>
    <p style="font-size:16px">Hola${name ? ` ${name}` : ''},</p>
    <p style="font-size:15px;line-height:1.6">Gracias por suscribirte a <b>Trust News España</b>. Recibirás las noticias más relevantes con su análisis de sesgo y cobertura mediática.</p>
    <p><a href="${SITE}" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;text-decoration:none;font-weight:700;font-size:14px">Ir a Trust News España</a></p>
    <p style="font-size:12px;color:#888;margin-top:24px">Si no te suscribiste tú, ignora este correo.</p>
  </div>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject: 'Bienvenido a Trust News España', html }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { await logEmail(supa, to, 'Bienvenido a TNE', 'welcome', 'failed', null, JSON.stringify(data).slice(0, 500)); return { error: data }; }
  await logEmail(supa, to, 'Bienvenido a TNE', 'welcome', 'sent', data.id ?? null, null);
  return { id: data.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) return json({ error: 'email inválido' }, 400);
    const full_name = body.full_name ?? null;
    const frequency = body.frequency ?? 'weekly';
    const source = body.source ?? 'footer';

    const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: existing } = await supa.from('newsletter_subscribers').select('id, welcome_sent_at').eq('email', email).maybeSingle();
    const { error } = await supa.from('newsletter_subscribers')
      .upsert({ email, full_name, frequency, source, is_active: true, unsubscribed_at: null }, { onConflict: 'email' });
    if (error) return json({ error: error.message }, 500);

    let welcome: Record<string, unknown> = { skipped: true };
    if (!existing?.welcome_sent_at) {
      welcome = await sendWelcome(supa, email, full_name);
      if (!welcome.error && !welcome.skipped) {
        await supa.from('newsletter_subscribers').update({ welcome_sent_at: new Date().toISOString() }).eq('email', email);
      }
    }
    return json({ ok: true, welcome });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
