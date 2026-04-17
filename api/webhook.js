import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata.user_id;
        
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: session.customer,
            subscription_tier: 'premium',
            subscription_status: 'active'
          })
          .eq('id', userId);
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
    
    res.status(200).json({ received: true });
  } catch (dbErr) {
    console.error('Database update error:', dbErr);
    res.status(500).send('Inner server error');
  }
}
