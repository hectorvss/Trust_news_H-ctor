const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query; // Lo usaremos para distinguir entre checkout y portal

  try {
    if (type === 'checkout') {
      const { priceId, user_id, user_email } = req.body;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        customer_email: user_email,
        client_reference_id: user_id,
        metadata: { user_id: user_id },
        subscription_data: { metadata: { user_id: user_id } },
      });
      return res.status(200).json({ id: session.id, url: session.url });
    }

    if (type === 'portal') {
      const { user_id, return_url } = req.body;
      // Primero buscamos el customer_id en Supabase (o lo recibimos del front)
      // Para simplificar, asumimos que el front podría enviarlo o lo buscamos aquí
      // Aquí usaremos la lógica de buscarlo vía Supabase
      const { createClient } = require('@supabase/supabase-js');
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
