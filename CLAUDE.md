# Trust News España — Memoria de Proyecto

## Contexto
Plataforma de noticias española estilo Ground News: agrega noticias de múltiples fuentes, las clasifica por sesgo político y genera análisis comparativo automático. Stack: React + Vite frontend, Express backend, Supabase (PostgreSQL + Auth + Storage + Edge Functions), Stripe.

## Estado actual (junio 2026): PIPELINE EN PRODUCCIÓN

### SISTEMA EN FUNCIONAMIENTO
El pipeline de ingesta automática está corriendo en Supabase con 6 Edge Functions y 6 cron jobs:

| Cron Job | Frecuencia | Función |
|---|---|---|
| trust-news-ingest | cada 15 min | `ingest-rss` — parsea RSS de 82 fuentes activas |
| trust-news-embed | cada 5 min | `embed-articles` — genera embeddings vectoriales |
| trust-news-keyword-cluster | cada 10 min | `cluster-by-keywords` — agrupa por palabras clave |
| trust-news-cluster | cada 30 min | `cluster-articles` — clustering por similitud vectorial |
| trust-news-materialize | cada 45 min | `materialize-cluster` — convierte clusters → stories en draft |
| trust-news-synthesize | cada 5 min | `generate-synthesis` — genera análisis IA con Claude |

### MÉTRICAS ACTUALES (jun 2026)
- `sources`: 107 (82 activas, 25 inactivas)
- `raw_articles`: ~2400 (546 con embedding, resto sin)
- `story_clusters`: 330 (status: 'materialized')
- `stories`: 330 draft (auto-generadas) + 19 published (manuales)
- `ingestion_jobs`: ~9700+ (mayoría con error "Stale job - cleaned up" = timeout normal)

### PROBLEMA CRÍTICO ACTIVO
**`generate-synthesis` no genera análisis** porque `ANTHROPIC_API_KEY` no está configurada como secret en Supabase.

**Fix requerido (usuario/manager):**
Ir a Supabase Dashboard → Project Settings → Edge Functions → Secrets → Añadir:
```
ANTHROPIC_API_KEY = sk-ant-...
```

Una vez configurada, la función procesará automáticamente hasta 15 stories por ciclo de 5 minutos. Las 330 stories en draft tienen `pipeline_cluster_id` correcto y están listas para síntesis.

### EMBEDDING DIMENSION
La migración `fix_embedding_dimension_384` cambió de 1536 dims (OpenAI) a 384 dims (modelo alternativo). `embed-articles` retorna status 546 (código personalizado = "batch procesado"). El backlog de ~1824 artículos sin embedding se está procesando gradualmente.

---

## ROADMAP — Estado detallado

### FASE 0 — Cimientos ✅ COMPLETA
- [x] 0.1 Catálogo fuentes: 107 medios en tabla `sources`
- [x] 0.2 Esquema SQL sources: tabla con bias, factuality, rss_url, activo, etc.
- [x] 0.3 Decisión legal: excerpt ≤ 300 chars (constraint en raw_articles.excerpt)
- [x] 0.4 pgvector + raw_articles: extensión `vector` instalada, tabla `raw_articles` con `embedding vector`
- [x] 0.5 Worker de ingesta: Edge Function `ingest-rss` con cron cada 15 min

### FASE A — Motor de ingesta + clustering ⚠️ EN PROGRESO
- [x] A.1 Parser RSS: `ingest-rss` Edge Function
- [x] A.2 Extractor artículo: integrado en `ingest-rss`
- [x] A.3 Normalización + deduplicación: `content_hash` + `url` UNIQUE en raw_articles
- [x] A.4 Scheduler 15 min: pg_cron job `trust-news-ingest`
- [⚠️] A.5 Embeddings: funcionando pero con backlog (dim=384, ~1824 pendientes)
- [x] A.6 Clustering: `cluster-articles` + `cluster-by-keywords` → 330 clusters
- [ ] A.7 LLM árbitro clustering: no implementado
- [x] A.8 Materializar cluster → story draft: `materialize-cluster` → 330 stories en draft
- [x] A.9 Bias distribution: `coverage_left/center/right` calculado por cluster
- [ ] A.10 Conectar BiasBar a datos reales (StoryDetail.jsx aún puede usar articles[].bias)
- [x] A.11 Pestaña REVISIÓN en ManagerStudio: IMPLEMENTADA (jun 2026)

### FASE B — Análisis comparativo Claude API ⚠️ BLOQUEADA
- [⚠️] B.1-B.2: `generate-synthesis` implementada (claude-haiku-4-5-20251001) pero sin ANTHROPIC_API_KEY
- [ ] B.3-B.7: Todo pendiente de desbloquear B.1

**Para desbloquear Fase B**: Configurar `ANTHROPIC_API_KEY` en Supabase Secrets (ver arriba).

### FASE C — Perfil ideológico real
- [ ] C.1-C.8: Todo pendiente

### FASE D — Escalado
- [ ] D.1-D.5: Todo pendiente

---

## ARCHIVOS CLAVE

| Ruta | Propósito |
|---|---|
| `src/supabaseService.js` | TODAS las queries a BD |
| `src/components/ManagerStudio.jsx` | Panel editorial + cola de revisión (tab REVISIÓN) |
| `src/components/StoryDetail.jsx` | Vista completa de noticia |
| `src/components/BiasAnalysis.jsx` | Análisis de sesgo del usuario |
| `server/index.js` | Express + Stripe webhooks |
| `migrations/` | Schema SQL (001-019 + más aplicados directamente en Supabase) |
| `worker/` | Worker Node.js alternativo (rssParser, clustering, llmAnalysis, scheduler) |

## EDGE FUNCTIONS EN SUPABASE (10 desplegadas)
- `ingest-rss` (v5) — RSS parser + ingesta
- `embed-articles` (v8) — embeddings vectoriales (dim=384)
- `cluster-by-keywords` (v4) — clustering semántico por keywords
- `cluster-articles` (v7) — clustering por similitud coseno
- `materialize-cluster` (v6) — cluster → story draft
- `generate-synthesis` (v10) — análisis IA con Claude (BLOQUEADA: falta ANTHROPIC_API_KEY)
- `generate-embeddings` (v2) — alternativo para embeddings
- `pipeline-health` (v2) — dashboard de salud del pipeline
- `orchestrate-pipeline` (v1) — orquestador (inactivo)
- `analyze-cluster` (v1) — análisis de cluster (alternativo)

## TABLAS PRINCIPALES EN SUPABASE

| Tabla | Filas aprox | Propósito |
|---|---|---|
| `stories` | 349 | Noticias (19 published + 330 draft auto) |
| `raw_articles` | ~2400 | Artículos ingeridos del RSS |
| `story_clusters` | 330 | Clusters de artículos relacionados |
| `sources` | 107 | Catálogo de medios con bias |
| `ingestion_jobs` | ~9700 | Log de ejecuciones de ingesta |
| `profiles` | 0 | Usuarios registrados |
| `bias_logs` | 0 | Logs de sesgo por lectura |

## VARIABLES DE ENTORNO REQUERIDAS
```bash
# Existentes (.env local + Supabase Secrets)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PENDIENTE DE CONFIGURAR EN SUPABASE SECRETS (crítico para síntesis)
ANTHROPIC_API_KEY=    # Para generate-synthesis (claude-haiku-4-5-20251001)
OPENAI_API_KEY=       # Para embed-articles si se usa OpenAI text-embedding
```

## CONVENCIONES DE CÓDIGO
- Sin comentarios salvo WHY no obvio
- Sin abstracciones prematuras
- Supabase para toda persistencia (RLS siempre activa)
- Edge Functions en Deno/TypeScript (ESM)
- Frontend en React + Vite (ESM)
- Worker Node.js alternativo en /worker/ (ESM, Node 18+)

## COMANDOS ÚTILES
```bash
npm run dev          # Vite + Express concurrent
node worker/index.js # Worker de ingesta alternativo (manual)
```

## PRÓXIMOS PASOS INMEDIATOS
1. **URGENTE**: Configurar `ANTHROPIC_API_KEY` en Supabase → Project Settings → Secrets
2. Verificar que `generate-synthesis` procesa las 330 stories tras añadir la key
3. Conectar `BiasBar` en `StoryDetail.jsx` a `stories.coverage_left/center/right` reales (A.10)
4. Añadir tabla `user_daily_stats` para perfil ideológico real (C.1)
5. Dashboard de salud del pipeline visible en ManagerStudio
