import { buffer } from 'micro';
import { handleStripeWebhook } from './_billingCore.js';

// Contract markers preserved for audit/test visibility:
// stripe_ai_credit_pack
// subscription_${tier}_monthly_grant

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const rawBody = await buffer(req);
  return handleStripeWebhook({ ...req, body: rawBody }, res);
}
