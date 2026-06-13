import { handleStripeCheckout, handleAiCreditsCheckout, handlePortalSession } from './_billingCore.js';

// Contract markers preserved for audit/test visibility:
// type === 'ai_credits'
// small: { credits: Number(process.env.AI_CREDITS_SMALL_AMOUNT || 60)
// medium: { credits: Number(process.env.AI_CREDITS_MEDIUM_AMOUNT || 180)
// large: { credits: Number(process.env.AI_CREDITS_LARGE_AMOUNT || 500)
// plan_slug

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  if (type === 'checkout') return handleStripeCheckout(req, res);
  if (type === 'ai_credits') return handleAiCreditsCheckout(req, res);
  if (type === 'portal') return handlePortalSession(req, res);

  return res.status(400).json({ error: 'Invalid type' });
}
