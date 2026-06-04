import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUBSCRIPTION_CREDIT_GRANTS = {
  premium: Number(process.env.AI_CREDITS_PREMIUM_MONTHLY || 50),
  elite: Number(process.env.AI_CREDITS_ELITE_MONTHLY || 200)
};

async function grantAiCredits(userId, amount, reason, idempotencyKey, stripeSessionId, metadata = {}) {
  if (!userId || !amount) return;
  const { error } = await supabase.rpc('grant_ai_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_idempotency_key: idempotencyKey,
    p_stripe_session_id: stripeSessionId || null,
    p_metadata: metadata
  });
  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('id')
      .eq('id', event.id)
      .maybeSingle();

    if (existingEvent) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata.user_id;

        if (session.metadata?.purchase_type === 'ai_credits') {
          const credits = Number(session.metadata?.credits || 0);
          await grantAiCredits(
            userId,
            credits,
            'stripe_ai_credit_pack',
            `checkout:${session.id}:ai_credits`,
            session.id,
            { pack: session.metadata?.pack }
          );
          await supabase.from('profiles').update({ stripe_customer_id: session.customer }).eq('id', userId);
        } else {
          const planSlug = session.metadata?.plan_slug || '';
          const tier = planSlug.includes('elite') ? 'elite' : 'premium';
          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: session.customer,
              subscription_tier: tier,
              subscription_status: 'active'
            })
            .eq('id', userId);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const priceId = subscription.items.data[0].price.id;
        
        let tier = 'free';
        if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY || priceId === process.env.STRIPE_PRICE_PREMIUM_YEARLY) tier = 'premium';
        if (priceId === process.env.STRIPE_PRICE_ELITE_MONTHLY || priceId === process.env.STRIPE_PRICE_ELITE_YEARLY) tier = 'elite';

        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_customer_id', subscription.customer);

        if (tier === 'premium' || tier === 'elite') {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .limit(1);
          const userId = profiles?.[0]?.id;
          const periodEnd = subscription.current_period_end || Math.floor(Date.now() / 1000);
          await grantAiCredits(
            userId,
            SUBSCRIPTION_CREDIT_GRANTS[tier],
            `subscription_${tier}_monthly_grant`,
            `subscription:${subscription.id}:${periodEnd}:ai_credits`,
            null,
            { tier, subscription_id: subscription.id, period_end: periodEnd }
          );
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled'
          })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }
    }

    await supabase.from('stripe_events').insert({
      id: event.id,
      type: event.type,
      processed_at: new Date().toISOString()
    });
    
    res.status(200).json({ received: true });
  } catch (dbErr) {
    console.error('Database update error:', dbErr);
    res.status(500).send('Inner server error');
  }
}
