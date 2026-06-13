import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleToddyGet, handleToddyPost } from '../api/_toddyCore.js';
import { handleStripeCheckout, handleAiCreditsCheckout, handlePortalSession, handleStripeWebhook } from '../api/_billingCore.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4242;

app.use(cors());

app.post('/api/create-checkout-session', express.json(), handleStripeCheckout);
app.post('/api/create-portal-session', express.json(), handlePortalSession);
app.get('/api/toddy-chat', async (req, res) => handleToddyGet(req, res));
app.post('/api/toddy-chat', express.json(), async (req, res) => handleToddyPost(req, res));
app.post('/api/create-ai-credit-checkout-session', express.json(), handleAiCreditsCheckout);
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'tne-billing-api' });
});

app.listen(port, () => {
  console.log(`TNE Billing API listening on port ${port}`);
});

