import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { handleToddyGet, handleToddyPost } from '../api/_toddyCore.js';

dotenv.config(); // Load from project root if running from there

const app = express();
const port = process.env.PORT || 4242;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });

// Supabase Service Role client is required to bypass RLS for webhook operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map internal slugs to Stripe Price IDs
// Ideally this would come from the database, but we map here for immediate stability
const PLAN_PRICE_MAP = {
  'premium_monthly': process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_m',
  'premium_yearly': process.env.STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_y',
  'elite_monthly': process.env.STRIPE_PRICE_ELITE_MONTHLY || 'price_elite_m',
  'elite_yearly': process.env.STRIPE_PRICE_ELITE_YEARLY || 'price_elite_y'
};

const AI_CREDIT_PACKS = {
  small: { credits: Number(process.env.AI_CREDITS_SMALL_AMOUNT || 25), price: process.env.STRIPE_PRICE_AI_CREDITS_SMALL },
  medium: { credits: Number(process.env.AI_CREDITS_MEDIUM_AMOUNT || 100), price: process.env.STRIPE_PRICE_AI_CREDITS_MEDIUM },
  large: { credits: Number(process.env.AI_CREDITS_LARGE_AMOUNT || 300), price: process.env.STRIPE_PRICE_AI_CREDITS_LARGE }
};

const SUBSCRIPTION_CREDIT_GRANTS = {
  premium: Number(process.env.AI_CREDITS_PREMIUM_MONTHLY || 50),
  elite: Number(process.env.AI_CREDITS_ELITE_MONTHLY || 200)
};

app.post('/api/create-checkout-session', express.json(), async (req, res) => {
  const { plan_slug, user_id, email, return_url } = req.body;

  if (!plan_slug || !PLAN_PRICE_MAP[plan_slug]) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PLAN_PRICE_MAP[plan_slug],
          quantity: 1,
        },
      ],
      success_url: `${return_url}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url}?canceled=true`,
      client_reference_id: user_id, // Safely links our user
      customer_email: email || undefined,
      metadata: {
        user_id: user_id,
        plan_slug: plan_slug
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.post('/api/create-portal-session', express.json(), async (req, res) => {
  const { user_id, return_url } = req.body;
  try {
    // 1. Get the customer ID from DB
    const { data: profile } = await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id', user_id).single();
    
    if (!profile || !profile.stripe_customer_id) {
      return res.status(400).json({ error: 'User does not have an active subscription' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: return_url,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal Error:', error);
    res.status(500).json({ error: 'Failed to create customer portal' });
  }
});

app.get('/api/toddy-chat', async (req, res) => handleToddyGet(req, res));
app.post('/api/toddy-chat', express.json(), async (req, res) => handleToddyPost(req, res));

app.post('/api/create-ai-credit-checkout-session', express.json(), async (req, res) => {
  const { pack = 'medium', user_id, email, return_url } = req.body;
  const selectedPack = AI_CREDIT_PACKS[pack];

  if (!selectedPack?.price) {
    return res.status(400).json({ error: 'Invalid AI credit pack or missing Stripe price env var' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: selectedPack.price, quantity: 1 }],
      success_url: `${return_url || 'http://localhost:5173/account'}?ai_credits=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url || 'http://localhost:5173/pricing'}?ai_credits=canceled`,
      client_reference_id: user_id,
      customer_email: email || undefined,
      metadata: {
        user_id,
        purchase_type: 'ai_credits',
        pack,
        credits: String(selectedPack.credits)
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('AI credit checkout error:', error);
    res.status(500).json({ error: 'Failed to create AI credit checkout session' });
  }
});

async function grantAiCredits(userId, amount, reason, idempotencyKey, stripeSessionId, metadata = {}) {
  if (!userId || !amount) return;
  const { error } = await supabaseAdmin.rpc('grant_ai_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_idempotency_key: idempotencyKey,
    p_stripe_session_id: stripeSessionId || null,
    p_metadata: metadata
  });
  if (error) throw error;
}

// We need raw payload for Stripe webhook signature verification
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { id: eventId, type } = event;

  try {
    // IDEMPOTENCY CHECK
    const { data: existingEvent } = await supabaseAdmin
      .from('stripe_events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (existingEvent) {
      console.log(`Event ${eventId} already processed. Skipping.`);
      return res.json({ received: true });
    }

    // Process specific events
    if (type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_id;
      const purchaseType = session.metadata?.purchase_type;

      if (purchaseType === 'ai_credits') {
        const credits = Number(session.metadata?.credits || 0);
        await grantAiCredits(
          userId,
          credits,
          'stripe_ai_credit_pack',
          `checkout:${session.id}:ai_credits`,
          session.id,
          { pack: session.metadata?.pack }
        );
        await supabaseAdmin.from('profiles').update({
          stripe_customer_id: session.customer
        }).eq('id', userId);
      } else {
        const planSlug = session.metadata?.plan_slug; // premium_monthly, elite_yearly, etc.

        let newTier = 'premium';
        if (planSlug && planSlug.includes('elite')) {
          newTier = 'elite';
        }

        if (userId) {
          await supabaseAdmin.from('profiles').update({
            stripe_customer_id: session.customer,
            subscription_tier: newTier // optimistic sync
          }).eq('id', userId);
        }
      }
    } 
    else if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer);
      
      if (profiles && profiles.length > 0) {
        const userId = profiles[0].id;
        const status = subscription.status; // 'active', 'past_due', 'canceled'
        
        // Detect tier from subscription items
        let detectedTier = 'free';
        if (status === 'active') {
           const priceId = subscription.items?.data?.[0]?.price?.id;
           if (priceId === process.env.STRIPE_PRICE_ELITE_MONTHLY || priceId === process.env.STRIPE_PRICE_ELITE_YEARLY || priceId === 'price_elite_m' || priceId === 'price_elite_y') {
             detectedTier = 'elite';
           } else {
             detectedTier = 'premium';
           }
        }
        
        await supabaseAdmin.from('profiles').update({
          stripe_subscription_id: subscription.id,
          subscription_status: status,
          subscription_tier: detectedTier,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          access_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
        }).eq('id', userId);

        if (detectedTier === 'premium' || detectedTier === 'elite') {
          const periodEnd = subscription.current_period_end || Math.floor(Date.now() / 1000);
          await grantAiCredits(
            userId,
            SUBSCRIPTION_CREDIT_GRANTS[detectedTier],
            `subscription_${detectedTier}_monthly_grant`,
            `subscription:${subscription.id}:${periodEnd}:ai_credits`,
            null,
            { tier: detectedTier, subscription_id: subscription.id, period_end: periodEnd }
          );
        }
      }
    }  
    else if (type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      await supabaseAdmin.from('profiles').update({
        subscription_status: 'canceled',
        subscription_tier: 'free'
      }).eq('stripe_customer_id', subscription.customer);
    }
    // invoice.paid can also be handled to extend access_expires_at if needed
    
    // RECORD EVENT
    await supabaseAdmin.from('stripe_events').insert({
      id: eventId,
      type: type,
      processed_at: new Date().toISOString()
    });

  } catch (err) {
    console.error(`Error processing webhook event ${eventId}:`, err);
    // Don't throw 500 arbitrarily or Stripe will keep retrying and piling logs
    // unless it's a real failure.
    return res.status(500).json({ error: 'Internal logic error' });
  }

  res.json({ received: true });
});

app.listen(port, () => {
  console.log(`TNE Billing API listening on port ${port}`);
});
