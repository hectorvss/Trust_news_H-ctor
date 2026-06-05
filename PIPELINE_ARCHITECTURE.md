# Pipeline de Trust News — Arquitectura real (5 jun 2026)

Consolidado sobre la arquitectura **sofisticada OpenAI** (`story_clusters` + cobertura real).
Todas las Edge Functions son **self-contained** (sin `_shared`) para poder desplegarlas vía API.

## Flujo end-to-end

```
ingest-rss      status='raw'        (RSS de 55 fuentes activas)         [sin key]
   ↓
extract-article-content status='pending' / 'completed' / 'blocked'     [sin key]
   ↓
embed-articles  status='embedded'   OpenAI text-embedding-3-small 1536  [NECESITA OPENAI_API_KEY]
   ↓
cluster-articles status='clustered' clustering incremental sofisticado  [sin key]
   ↓                                 → story_clusters (cobertura izq/centro/der real)
materialize-cluster                  story_clusters 'ready' → stories    [sin key]
   ↓                                 draft (review_status='pending_review')
generate-synthesis                   Claude rellena análisis editorial    [NECESITA ANTHROPIC_API_KEY]
```

## Decisiones clave (el "lío" resuelto)

- **Había DOS pipelines paralelos**: uno desplegado (gte-small 384, columna `status`, tabla
  `clusters` en español) y otro en el repo (OpenAI 1536, `embedded` bool, `story_clusters`).
  Estaban mezclados → 0 embeddings (gte-small escribía 384-dim en columna de 1536).
- **Consolidado** sobre: OpenAI 1536 + `story_clusters` + columna `status` (el flujo que ya
  conecta con `generate-synthesis` y el frontend).

## cluster-articles (sofisticado)
- Lee `raw_articles` status='embedded', clustered=false, embedding not null.
- **Matching incremental**: encaja artículos nuevos en clusters existentes (ventana 48h) por
  coseno + evento + huella de entidades. **Guard anti-falsos-merges (#7)**: exige coseno ≥ 0.60
  y usa `event_signature`, `entity_fingerprint`, y ventana temporal para evitar mezclas por
  keyword-only.
- Cobertura **izquierda/centro/derecha** real desde `sources.bias_label`
  (LEFT/CENTER-LEFT → izq, CENTER → centro, RIGHT/CENTER-RIGHT → der).
- Scoring confianza/diversidad/frescura/síntesis. status: `forming` (<3 fuentes) → `ready` (≥3).
- Escribe `story_clusters.centroid_embedding` (1536), marca filas clustered.

## materialize-cluster
- `story_clusters` status='ready' + story_id null → inserta `stories` draft.
- Enlaza vía `pipeline_cluster_id` (OJO: `cluster_id` tiene FK a la tabla legacy `clusters`,
  por eso se deja null). `cluster_status='draft'` (CHECK: draft/approved/published/rejected).
- Lleva `coverage_left/center/right` (%) + `bias` jsonb y deriva `category` / `location`
  desde el contexto del cluster para que la UI y el backend hablen el mismo idioma.

## generate-synthesis (ya alineada, v11)
- Lee `stories` draft auto-generadas con `review_status in ('pending_review', 'analysis_failed')`.
- Resuelve artículos vía `pipeline_cluster_id` → `story_clusters.article_ids` → `raw_articles`.
- Claude (claude-haiku-4-5-20251001) rellena todos los bloques editoriales que lee `StoryDetail`.

## Verificación
End-to-end probado el 5 jun 2026 con embeddings sintéticos (6 artículos, 2 grupos):
cluster-articles → 2 clusters `ready` con cobertura 33/67/0 y 67/0/33 →
materialize → 2 draft stories `pending_review` con cobertura. Datos de prueba limpiados.

## Pendiente para producción (solo configuración)
1. `OPENAI_API_KEY` en Supabase → Edge Functions → Secrets (embeddings)
2. `ANTHROPIC_API_KEY` en Supabase → Edge Functions → Secrets (síntesis)
3. Scheduler: los pg_cron están bloqueados (free tier). Usar **GitHub Actions**
   (`.github/workflows/pipeline-*.yml`) — solo requiere los secrets `SUPABASE_URL` y
   `SUPABASE_SERVICE_ROLE_KEY` en GitHub.

Coste estimado embeddings: ~$0.03 backlog (9.728 art.) + ~$0.05/mes. Síntesis (Claude): el grueso.
