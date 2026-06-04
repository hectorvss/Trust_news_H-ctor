import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assertIncludes = (file, needle, label = needle) => {
  const text = read(file);
  if (!text.includes(needle)) {
    throw new Error(`${file} is missing ${label}`);
  }
};

const migration = 'migrations/023_toddy_ai_agent.sql';
[
  'create table if not exists public.toddy_conversations',
  'create table if not exists public.toddy_messages',
  'create table if not exists public.ai_credit_ledger',
  'ai_credit_balance',
  'grant_ai_credits',
  'consume_ai_credits',
  'unique(user_id, story_id)',
  'toddy messages select manager',
  'toddy_story_metrics'
].forEach((needle) => assertIncludes(migration, needle));

const core = 'api/_toddyCore.js';
[
  'TODDY_DEPTHS',
  'basic',
  'deep',
  'source_audit',
  'buildToddyStoryContext',
  "story.status !== 'published'",
  'hasUsedFreeStoryAnswer',
  'insufficient_credits',
  'free_limit_used',
  'ANTHROPIC_API_KEY',
  'text/event-stream',
  'sources_used',
  'token_usage',
  'consume_ai_credits',
  'generation_trace',
  'bias_distribution'
].forEach((needle) => assertIncludes(core, needle));

[
  ['api/toddy-chat.js', 'handleToddyPost'],
  ['api/stripe.js', "type === 'ai_credits'"],
  ['api/stripe.js', "small: { credits: Number(process.env.AI_CREDITS_SMALL_AMOUNT || 60)"],
  ['api/stripe.js', "medium: { credits: Number(process.env.AI_CREDITS_MEDIUM_AMOUNT || 180)"],
  ['api/stripe.js', "large: { credits: Number(process.env.AI_CREDITS_LARGE_AMOUNT || 500)"],
  ['api/stripe.js', 'plan_slug'],
  ['api/webhook.js', 'stripe_ai_credit_pack'],
  ['api/webhook.js', 'subscription_${tier}_monthly_grant'],
  ['server/index.js', '/api/toddy-chat'],
  ['server/index.js', '/api/create-ai-credit-checkout-session']
].forEach(([file, needle]) => assertIncludes(file, needle));

[
  'TODDY IA',
  'Compra creditos IA cuando quieras',
  'TODDY START',
  'TODDY PLUS',
  'TODDY PRO',
  'MEJOR VALOR',
  'KPI consumo IA',
  "handleBuyCredits",
  "fetch('/api/stripe?type=ai_credits'"
].forEach((needle) => assertIncludes('src/components/Pricing.jsx', needle));

[
  'getAiUsageMetrics',
  'KPI CONSUMO IA',
  'CREDITOS IA',
  'CONSULTAS TODDY',
  'TOKENS IA',
  '/pricing#ai-credits'
].forEach((needle) => assertIncludes('src/components/Account.jsx', needle));

[
  'export const getAiUsageMetrics',
  'toddy_messages',
  'ai_credit_ledger',
  'depthDistribution'
].forEach((needle) => assertIncludes('src/supabaseService.js', needle));

[
  'PREGUNTAR A TODDY',
  'ToddyChatPanel',
  'Explicamelo simple',
  'Que sesgo hay',
  'Que dicen las fuentes',
  'Que falta por saber',
  'Dame cronologia',
  'leyendo la noticia',
  'comparando fuentes',
  'verificando claims',
  'redactando respuesta',
  'free usado',
  'COMPRAR'
].forEach((needle) => {
  const target = needle === 'PREGUNTAR A TODDY' || needle === 'ToddyChatPanel'
    ? 'src/components/StoryDetail.jsx'
    : 'src/components/ToddyChatPanel.jsx';
  assertIncludes(target, needle);
});

[
  'toddyResponses24h',
  'toddyCredits24h',
  'toddyTokens24h',
  'Toddy 24h',
  'Creditos Toddy',
  'Toddy baja confianza'
].forEach((needle) => {
  const target = needle.startsWith('toddy') ? 'src/supabaseService.js' : 'src/components/manager/PipelineDashboard.jsx';
  assertIncludes(target, needle);
});

assertIncludes('package.json', 'test:toddy-contract');

console.log('Toddy contract OK');
