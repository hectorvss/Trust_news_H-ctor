import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

dotenv.config(); // Load from project root if running from there

const app = express();
const port = process.env.PORT || 4242;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

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
