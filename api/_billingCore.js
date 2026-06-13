import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

let stripeClient = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
  }
  return stripeClient;
}

const PLAN_PRICE_MAP = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  elite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY,
  elite_yearly: process.env.STRIPE_PRICE_ELITE_YEARLY,
};

const AI_CREDIT_PACKS = {
  small: { credits: Number(process.env.AI_CREDITS_SMALL_AMOUNT || 60), price: process.env.STRIPE_PRICE_AI_CREDITS_SMALL },
  medium: { credits: Number(process.env.AI_CREDITS_MEDIUM_AMOUNT || 180), price: process.env.STRIPE_PRICE_AI_CREDITS_MEDIUM },
  large: { credits: Number(process.env.AI_CREDITS_LARGE_AMOUNT || 500), price: process.env.STRIPE_PRICE_AI_CREDITS_LARGE },
};

const SUBSCRIPTION_CREDIT_GRANTS = {
  premium: Number(process.env.AI_CREDITS_PREMIUM_MONTHLY || 50),
  elite: Number(process.env.AI_CREDITS_ELITE_MONTHLY || 200),
};

function createSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service configuration');
  return createClient(url, key);
}

function getOrigin(req) {
  return req.headers?.origin || 'http://localhost:5173';
}

function resolveReturnUrl(baseUrl, suffix) {
  const url = baseUrl || 'http://localhost:5173';
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}${suffix}`;
}

function hasExplicitPath(url) {
  try {
    return new URL(url).pathname.replace(/\/+$/, '') !== '';
  } catch {
    return false;
  }
}

async function grantAiCredits(supabase, userId, amount, reason, idempotencyKey, stripeSessionId, metadata = {}) {
  if (!userId || !amount) return;
  const { error } = await supabase.rpc('grant_ai_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_idempotency_key: idempotencyKey,
    p_stripe_session_id: stripeSessionId || null,
    p_metadata: metadata,
  });
  if (error) throw error;
}

function normalizePlanTier(planSlug) {
  return planSlug && String(planSlug).includes('elite') ? 'elite' : 'premium';
}

function getWebhookStripeEvent(req) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  return getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
}

export async function handleStripeCheckout(req, res) {
  const { plan_slug, user_id, email, return_url } = req.body || {};
  const priceId = PLAN_PRICE_MAP[plan_slug];
  if (!plan_slug || !priceId) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  try {
    const origin = getOrigin(req);
    const successBase = return_url && hasExplicitPath(return_url) ? return_url : `${origin}/account`;
    const cancelBase = `${origin}/pricing`;
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: resolveReturnUrl(successBase, 'success=true&session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: resolveReturnUrl(cancelBase, 'canceled=true'),
      client_reference_id: user_id,
      customer_email: email || undefined,
      metadata: { user_id, plan_slug },
      subscription_data: { metadata: { user_id, plan_slug } },
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}

export async function handleAiCreditsCheckout(req, res) {
  const { pack = 'medium', user_id, email, return_url } = req.body || {};
  const selectedPack = AI_CREDIT_PACKS[pack];
  if (!selectedPack?.price) {
    return res.status(400).json({ error: `Invalid AI credit pack: ${pack}. Check Stripe price env vars.` });
  }

  try {
    const origin = getOrigin(req);
    const successBase = return_url && hasExplicitPath(return_url) ? return_url : `${origin}/account`;
    const cancelBase = `${origin}/pricing`;
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: selectedPack.price, quantity: 1 }],
      success_url: resolveReturnUrl(successBase, 'ai_credits=success&session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: resolveReturnUrl(cancelBase, 'ai_credits=canceled'),
      client_reference_id: user_id,
      customer_email: email || undefined,
      metadata: {
        user_id,
        purchase_type: 'ai_credits',
        pack,
        credits: String(selectedPack.credits),
      },
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('AI credit checkout error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create AI credit checkout session' });
  }
}

export async function handlePortalSession(req, res) {
  const { user_id, return_url } = req.body || {};
  try {
    const supabase = createSupabaseAdmin();
    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user_id).single();
    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'User does not have an active subscription' });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: return_url || `${getOrigin(req)}/account`,
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create customer portal' });
  }
}

export async function handleStripeWebhook(req, res) {
  const supabase = createSupabaseAdmin();

  let event;
  try {
    event = getWebhookStripeEvent(req);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { id: eventId, type } = event;

  try {
    const { data: existingEvent, error: existingEventError } = await supabase
      .from('stripe_events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();

    if (existingEventError) throw existingEventError;
    if (existingEvent) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    if (type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_id;

      if (session.metadata?.purchase_type === 'ai_credits') {
        const credits = Number(session.metadata?.credits || 0);
        await grantAiCredits(
          supabase,
          userId,
          credits,
          'stripe_ai_credit_pack',
          `checkout:${session.id}:ai_credits`,
          session.id,
          { pack: session.metadata?.pack }
        );
        await supabase.from('profiles').update({ stripe_customer_id: session.customer }).eq('id', userId);
      } else {
        const tier = normalizePlanTier(session.metadata?.plan_slug);
        if (userId) {
          await supabase.from('profiles').update({
            stripe_customer_id: session.customer,
            subscription_tier: tier,
            subscription_status: 'active',
          }).eq('id', userId);
        }
      }
    } else if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .limit(1);

      if (profiles?.length > 0) {
        const userId = profiles[0].id;
        const status = subscription.status;
        let detectedTier = 'free';
        if (status === 'active') {
          const priceId = subscription.items?.data?.[0]?.price?.id;
          if (priceId === process.env.STRIPE_PRICE_ELITE_MONTHLY || priceId === process.env.STRIPE_PRICE_ELITE_YEARLY || priceId === 'price_elite_m' || priceId === 'price_elite_y') {
            detectedTier = 'elite';
          } else {
            detectedTier = 'premium';
          }
        }

        await supabase.from('profiles').update({
          stripe_subscription_id: subscription.id,
          subscription_status: status,
          subscription_tier: detectedTier,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          access_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('id', userId);

        if (detectedTier === 'premium' || detectedTier === 'elite') {
          const periodEnd = subscription.current_period_end || Math.floor(Date.now() / 1000);
          await grantAiCredits(
            supabase,
            userId,
            SUBSCRIPTION_CREDIT_GRANTS[detectedTier],
            `subscription_${detectedTier}_monthly_grant`,
            `subscription:${subscription.id}:${periodEnd}:ai_credits`,
            null,
            { tier: detectedTier, subscription_id: subscription.id, period_end: periodEnd }
          );
        }
      }
    } else if (type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      await supabase.from('profiles').update({
        subscription_status: 'canceled',
        subscription_tier: 'free',
      }).eq('stripe_customer_id', subscription.customer);
    }

    await supabase.from('stripe_events').insert({
      id: eventId,
      type,
      processed_at: new Date().toISOString(),
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Database update error:', error);
    return res.status(500).send('Inner server error');
  }
}
