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

const fractionalMigration = 'migrations/024_toddy_fractional_credits.sql';
[
  'numeric(12,2)',
  'drop function if exists public.grant_ai_credits',
  'drop function if exists public.consume_ai_credits',
  'round(p_amount::numeric, 2)',
  'round(coalesce(p_amount, 0)::numeric, 2)'
].forEach((needle) => assertIncludes(fractionalMigration, needle));

const researchMigration = 'migrations/025_toddy_research_agent.sql';
[
  "check (depth in ('quick', 'deep', 'research', 'audit', 'basic', 'source_audit'))",
  'add column if not exists metadata jsonb',
  'create table if not exists public.toddy_web_research_results',
  'web_research_responses_24h',
  'web_urls_consulted_24h',
  'validation_failures_24h'
].forEach((needle) => assertIncludes(researchMigration, needle));

const core = 'api/_toddyCore.js';
[
  'TODDY_DEPTHS',
  'quick',
  'deep',
  'research',
  'audit',
  'DEPTH_ALIASES',
  'buildToddyStoryContext',
  "story.status !== 'published'",
  'hasUsedFreeStoryAnswer',
  'insufficient_credits',
  'free_limit_used',
  'ANTHROPIC_API_KEY',
  'text/event-stream',
  "writeSse(res, 'citation'",
  'sources_used',
  'token_usage',
  'reserveAiCredits',
  'finalizeAiCredits',
  'releaseAiCreditReservation',
  'generation_trace',
  'bias_distribution',
  'article_content(content_text',
  'fetchEvidenceArticles',
  'evidence_articles',
  'evidence_coverage',
  'summarizeEvidenceCoverage',
  'relevanceScore',
  'searchStoryEvidence',
  'runWebResearch',
  'llmWebSearch',
  'collectOpenAiTextAndCitations',
  'collectAnthropicTextAndCitations',
  'TODDY_WEB_RESEARCH_PROVIDER',
  'OPENAI_API_KEY',
  'TODDY_OPENAI_WEB_MODEL',
  'web_search',
  'web_search_20250305',
  'TODDY_PREMIUM_DAILY_RESEARCH_LIMIT',
  'countDailyResearchUses',
  'allowedDepthsForProfile',
  'depth_not_allowed',
  'daily_research_limit_used',
  'validateToddyAnswer',
  'structured_answer',
  'web_research',
  'tool_trace',
  'context_hash',
  'conversationHistory',
  'compactForPrompt',
  'pruneEmpty',
  'shouldUseWebResearch',
  'explicitlyRequestsWeb',
  '.slice(-4)',
  'JSON.stringify(promptContext)',
  "reason: paid ? 'web_not_requested'",
  'selected_article_ids',
  'calculateCreditsFromUsage',
  'CREDIT_POLICY',
  'web_searches'
].forEach((needle) => assertIncludes(core, needle));

[
  'JSON.stringify(context)',
  '.slice(-8)',
  'Contexto JSON:',
  'Historial reciente'
].forEach((forbidden) => {
  const text = read(core);
  if (text.includes(forbidden)) throw new Error(`Toddy prompt should stay token-optimized, found ${forbidden}`);
});

[
  'TAVILY_API_KEY',
  'BRAVE_SEARCH_API_KEY',
  'NEWSAPI_KEY',
  'https://api.tavily.com',
  'https://api.search.brave.com',
  'https://newsapi.org'
].forEach((forbidden) => {
  const text = read(core);
  if (text.includes(forbidden)) throw new Error(`Toddy web research should use LLM web APIs, found ${forbidden}`);
});

[
  ['api/toddy-chat.js', 'handleToddyPost'],
  ['api/stripe.js', "type === 'ai_credits'"],
  ['api/stripe.js', "small: { credits: Number(process.env.AI_CREDITS_SMALL_AMOUNT || 60)"],
  ['api/stripe.js', "medium: { credits: Number(process.env.AI_CREDITS_MEDIUM_AMOUNT || 180)"],
  ['api/stripe.js', "large: { credits: Number(process.env.AI_CREDITS_LARGE_AMOUNT || 500)"],
  ['api/stripe.js', 'plan_slug'],
  ['api/webhook.js', 'stripe_ai_credit_pack'],
  ['api/webhook.js', 'subscription_${tier}_monthly_grant'],
  ['api/webhook.js', "import { buffer } from 'micro'"],
  ['api/webhook.js', 'body: rawBody'],
  ['api/_billingCore.js', 'function getStripe()'],
  ['api/_billingCore.js', 'handleStripeWebhook'],
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
  'ToddyFloatingLauncher',
  'hidden={showToddy}',
  'aria-label="Preguntar a Toddy sobre esta noticia"',
  'toddyLauncherFloat',
  'toddyLauncherBlink',
  'toddyLauncherPeek',
  'prefers-reduced-motion',
  'Explicamelo simple',
  'Que sesgo hay',
  'Que dicen las fuentes',
  'Que falta por saber',
  'Dame cronologia',
  'leyendo la noticia',
  'buscando evidencia',
  'investigando web',
  'comparando fuentes',
  'verificando claims',
  'validando citas',
  'redactando respuesta',
  'pregunta gratis usada',
  'COMPRAR',
  'extraction_quality',
  'target="_blank"',
  'ReasoningSelector',
  'availableDepths',
  'researchRemaining',
  'allowedDepths={availableDepths}',
  'depth_not_allowed',
  'daily_research_limit_used',
  'Rapido',
  'Profundo',
  'Investigacion',
  'Auditoria',
  'MarkdownText',
  'humanError',
  'story_not_found'
].forEach((needle) => {
  const target = ['PREGUNTAR A TODDY', 'ToddyChatPanel', 'ToddyFloatingLauncher', 'hidden={showToddy}'].includes(needle)
    ? 'src/components/StoryDetail.jsx'
    : ['toddyLauncherFloat', 'toddyLauncherBlink', 'toddyLauncherPeek', 'prefers-reduced-motion', 'aria-label="Preguntar a Toddy sobre esta noticia"'].includes(needle)
    ? 'src/components/ToddyFloatingLauncher.jsx'
    : 'src/components/ToddyChatPanel.jsx';
  assertIncludes(target, needle);
});

[
  'Coste estimado',
  'cargo final',
  'uso real de tokens'
].forEach((forbidden) => {
  const chat = read('src/components/ToddyChatPanel.jsx');
  if (chat.includes(forbidden)) throw new Error(`Toddy chat should not show ${forbidden}`);
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
