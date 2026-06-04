import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  try {
    if (type === 'checkout') {
      const { plan_slug, user_id, email } = req.body;
      
      const priceMap = {
        'premium_monthly': process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
        'premium_yearly': process.env.STRIPE_PRICE_PREMIUM_YEARLY,
        'elite_monthly': process.env.STRIPE_PRICE_ELITE_MONTHLY,
        'elite_yearly': process.env.STRIPE_PRICE_ELITE_YEARLY
      };

      const priceId = priceMap[plan_slug];

      if (!priceId) {
        return res.status(400).json({ error: `Invalid plan slug: ${plan_slug}. Check your Vercel Env Vars.` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        customer_email: email,
        client_reference_id: user_id,
        metadata: { user_id: user_id },
        subscription_data: { metadata: { user_id: user_id } },
      });
      
      return res.status(200).json({ id: session.id, url: session.url });
    }

    if (type === 'ai_credits') {
      const { pack = 'medium', user_id, email } = req.body;
      const packs = {
        small: { credits: Number(process.env.AI_CREDITS_SMALL_AMOUNT || 25), price: process.env.STRIPE_PRICE_AI_CREDITS_SMALL },
        medium: { credits: Number(process.env.AI_CREDITS_MEDIUM_AMOUNT || 100), price: process.env.STRIPE_PRICE_AI_CREDITS_MEDIUM },
        large: { credits: Number(process.env.AI_CREDITS_LARGE_AMOUNT || 300), price: process.env.STRIPE_PRICE_AI_CREDITS_LARGE }
      };
      const selectedPack = packs[pack];

      if (!selectedPack?.price) {
        return res.status(400).json({ error: `Invalid AI credit pack: ${pack}. Check Stripe price env vars.` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: selectedPack.price, quantity: 1 }],
        mode: 'payment',
        success_url: `${req.headers.origin}/account?ai_credits=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing?ai_credits=canceled`,
        customer_email: email,
        client_reference_id: user_id,
        metadata: {
          user_id,
          purchase_type: 'ai_credits',
          pack,
          credits: String(selectedPack.credits)
        }
      });

      return res.status(200).json({ id: session.id, url: session.url });
    }

    if (type === 'portal') {
      const { user_id, return_url } = req.body;
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user_id)
        .single();

      if (!profile?.stripe_customer_id) {
        return res.status(400).json({ error: 'No stripe customer found' });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: return_url || `${req.headers.origin}/account`,
      });
      return res.status(200).json({ url: session.url });
    }

    res.status(400).json({ error: 'Invalid type' });
  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}
