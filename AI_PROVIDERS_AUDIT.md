# 🤖 Proveedor de IA — SINGLE PROVIDER: OpenAI

Migrado a **un único proveedor: OpenAI**. Ya no se necesita `ANTHROPIC_API_KEY`.
Con solo `OPENAI_API_KEY` funciona TODO: clasificación, redacción de noticias,
resumen diario y Toddy.

## Mapa por etapa (tras la migración)

| Etapa | Fichero | Modelo (por defecto, configurable) | Env |
|---|---|---|---|
| Embeddings | `embed-articles/index.ts` | `text-embedding-3-small` (1536-dim) | `OPENAI_API_KEY` |
| Clustering / materialize | `cluster-articles`, `materialize-cluster` | — (sin IA) | — |
| Síntesis (redacción IA) | `generate-synthesis` → `_shared/llm.ts::callOpenAI` | `gpt-4o-mini` (`OPENAI_MODEL`) | `OPENAI_API_KEY` |
| Resumen diario | `generate-daily-summary::callOpenAI` | `gpt-4o-mini` (`OPENAI_MODEL`) | `OPENAI_API_KEY` |
| Toddy (chat) | `api/_toddyCore.js::callToddyLLM` | `gpt-4o-mini` (`OPENAI_MODEL` / `TODDY_OPENAI_MODEL`) | `OPENAI_API_KEY` |
| Toddy web-research (research/audit) | `api/_toddyCore.js::runWebResearch` | `gpt-5` (`TODDY_OPENAI_WEB_MODEL`) vía Responses API + web_search | `OPENAI_API_KEY` |

Todo usa **function-calling de OpenAI** para producir la misma salida JSON
estructurada que antes daba el tool-use de Claude (contrato `validateEditorialStory`
/ `validateDailyBrief` intacto). La `usage` se normaliza a `input_tokens`/`output_tokens`
para que la contabilidad de créditos de Toddy siga funcionando igual.

## Optimización de coste
- **Redacción, resumen y Toddy** → `gpt-4o-mini` (~$0.15 entrada / $0.60 salida por 1M tokens). Barato y suficiente para trabajar sobre evidencia ya extraída.
- **Embeddings** → `text-embedding-3-small` (~$0.02 por 1M). El modelo de embeddings más barato de OpenAI.
- Sube de modelo solo si hace falta, vía env `OPENAI_MODEL` (ej. `gpt-4o`, `gpt-4.1`, `gpt-5-mini`).
- La búsqueda web (Toddy research/audit, funciones elite) usa `gpt-5` por defecto → si tu cuenta no lo tiene, pon `TODDY_OPENAI_WEB_MODEL` a un modelo con `web_search` disponible.

## Env vars (single-provider)
```
OPENAI_API_KEY=sk-...            # única key necesaria (Supabase Edge Secrets + Vercel env)
# opcionales
OPENAI_MODEL=gpt-4o-mini         # redacción / resumen / toddy
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
TODDY_OPENAI_MODEL=gpt-4o-mini
TODDY_OPENAI_WEB_MODEL=gpt-5     # solo research/audit
```

## Al desplegar (recordatorio)
- **Supabase Edge Functions** que hay que **redeployar** con los cambios (importan `_shared`, así que hay que desplegar con bundling — `supabase functions deploy <fn>` o MCP con todos los ficheros):
  - `generate-synthesis`, `generate-daily-summary` (migradas a OpenAI)
  - `materialize-cluster` (cambio previo de related_topics/articles)
- **Vercel** (Toddy `api/`): se despliega solo al hacer push; poner `OPENAI_API_KEY` en las env de Vercel.
- Secret `OPENAI_API_KEY` en **Supabase → Edge Functions → Secrets** (para embed/síntesis/daily).

## ⚠️ Verificar dimensión del vector al reactivar (sigue vigente)
El código escribe embeddings de 1536-dim. Confirmar que `raw_articles.embedding` es
`vector(1536)` y no `vector(384)`:
```sql
select format_type(atttypid, atttypmod) from pg_attribute
where attrelid = 'raw_articles'::regclass and attname = 'embedding';   -- debe decir vector(1536)
```
Si es 384 → `alter table raw_articles alter column embedding type vector(1536);` + limpiar embeddings viejos para re-embeber.

## Prueba end-to-end (tras reactivar + OPENAI_API_KEY)
```
POST embed-articles      → with_embedding > 0
POST cluster-articles    → clusters ready
POST materialize-cluster → materialized > 0
POST generate-synthesis  → stories con consensus_narrative (redactadas por gpt-4o-mini)
POST generate-daily-summary → brief con IA
Toddy: enviar una pregunta en una noticia → respuesta + cargo de créditos
```
