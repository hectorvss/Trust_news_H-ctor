# Trust News Espana

SaaS editorial para recopilar noticias, agrupar cobertura entre medios, analizar sesgo, generar borradores revisables y explicar cada noticia con Toddy, el agente IA contextual.

## Arquitectura

- Frontend: React + Vite en `src/`.
- Datos: Supabase Postgres como sistema de verdad.
- Pipeline: Supabase Edge Functions en `supabase/functions/`.
- API Node/Vercel: rutas en `api/`.
- Servidor local: `server/index.js`, solo como wrapper local sobre los nucleos compartidos de `api/`.
- Pagos: Stripe Checkout, Stripe Portal y webhooks centralizados en `api/_billingCore.js`.
- Toddy: core compartido en `api/_toddyCore.js`.

## Flujo editorial principal

```text
ingest-rss
  -> extract-article-content
  -> embed-articles
  -> cluster-articles
  -> materialize-cluster
  -> generate-synthesis
  -> manager review
  -> published story
```

El contrato vivo esta documentado en `PIPELINE_CONTRACT_2026-06-13.md`.

## Scripts

```bash
npm run dev
npm run build
npm run test:pipeline
npm run test:llm-contract
npm run test:toddy-contract
```

`npm run dev` arranca Vite y el servidor local Express.

## Variables clave

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PREMIUM_MONTHLY`
- `STRIPE_PRICE_PREMIUM_YEARLY`
- `STRIPE_PRICE_ELITE_MONTHLY`
- `STRIPE_PRICE_ELITE_YEARLY`
- `STRIPE_PRICE_AI_CREDITS_SMALL`
- `STRIPE_PRICE_AI_CREDITS_MEDIUM`
- `STRIPE_PRICE_AI_CREDITS_LARGE`

## Contratos importantes

- Las lecturas publicas de stories deben filtrar `status = 'published'`.
- Las pantallas manager deben leer drafts mediante helpers explicitos.
- El enlace canonico a clusters es `stories.pipeline_cluster_id`.
- `stories.cluster_id` queda como compatibilidad legacy.
- El lifecycle canonico de articulos vive en `raw_articles.status`.
- `raw_articles.embedded` y `raw_articles.clustered` son espejos legacy.
- Toddy solo responde sobre stories publicadas.
- La publicacion editorial siempre requiere manager review.

## Verificacion esperada

Antes de cerrar cambios de arquitectura:

```bash
npm run test:pipeline
npm run test:llm-contract
npm run test:toddy-contract
npm run build
```

