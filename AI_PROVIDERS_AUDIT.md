# 🤖 Auditoría de proveedores de IA (qué desbloquea cada API key)

Verificado leyendo el código. El sistema usa **dos** proveedores de IA, no uno.

## Mapa por etapa

| Etapa | Fichero | Proveedor | Env var | ¿OpenAI la desbloquea? |
|---|---|---|---|---|
| Embeddings | `supabase/functions/embed-articles/index.ts` | **OpenAI** `text-embedding-3-small` (1536-dim) | `OPENAI_API_KEY` | ✅ SÍ |
| Clustering | `supabase/functions/cluster-articles` | ninguno (coseno) | — | ✅ (con embeddings) |
| Materialize | `supabase/functions/materialize-cluster` | ninguno | — | ✅ |
| Síntesis (redacción IA) | `generate-synthesis` → `_shared/llm.ts::analyzeCluster` → `callAnthropic` | **Anthropic Claude** (`claude-sonnet-4-6`) | `ANTHROPIC_API_KEY` | ❌ NO |
| Toddy chat | `api/_toddyCore.js::callAnthropic` | **Anthropic Claude** (`claude-3-5-haiku`) | `ANTHROPIC_API_KEY` (lanza error si falta) | ❌ NO |
| Toddy web-research | `api/_toddyCore.js::runWebResearch` | OpenAI `gpt-5` **o** Anthropic (`TODDY_WEB_RESEARCH_PROVIDER`) | cualquiera | OpenAI opcional |

## Conclusión
- **Solo OpenAI** → revive la **clasificación** (ingesta → embeddings → clustering → borradores). NO redacta las noticias ni hace funcionar a Toddy.
- Para **redacción IA + Toddy** hace falta **`ANTHROPIC_API_KEY`** (Camino A, recomendado, sin código),
  o **migrar synthesis + Toddy a OpenAI/GPT** (Camino B, migración de código).

## ⚠️ Verificaciones al reactivar Supabase (para que el pipeline realmente arranque)
1. **Dimensión del vector de embeddings** — el código escribe 1536-dim. Confirmar que la columna es `vector(1536)` y no `vector(384)` (hubo una migración `fix_embedding_dimension_384` aplicada en vivo):
   ```sql
   select format_type(atttypid, atttypmod) from pg_attribute
   where attrelid = 'raw_articles'::regclass and attname = 'embedding';
   -- debe decir vector(1536)
   ```
   Si dice `vector(384)`: `alter table raw_articles alter column embedding type vector(1536);`
   y limpiar embeddings viejos (`update raw_articles set embedding=null, status='raw' where status='embedded';`)
   para re-embeber con OpenAI. Igual para `story_clusters.centroid_embedding`.
2. Secrets en Supabase → Edge Functions: `OPENAI_API_KEY` (y `ANTHROPIC_API_KEY` si Camino A).
3. Migraciones pendientes 034/035/036 + redeploy `materialize-cluster` (ver `SUPABASE_PENDING.md`).
4. Scheduler: secrets de GitHub Actions o pg_cron.

## Prueba end-to-end recomendada (tras reactivar + keys)
```
POST embed-articles   → with_embedding > 0
POST cluster-articles → clusters ready
POST materialize-cluster → materialized > 0
POST generate-synthesis  → stories con consensus_narrative
GET  /api/toddy-chat / enviar una pregunta → respuesta con cargo de créditos
```
