# Pipeline Contract 2026-06-13

This is the current Supabase-first contract used by the product.

## Runtime Path

The production path is:

`ingest-rss -> extract-article-content -> embed-articles -> cluster-articles -> materialize-cluster -> generate-synthesis -> manager review`

`worker/` and older `clusters` references are legacy/reference only.

## Canonical Tables

- `sources`: source catalog, RSS settings, country, language, bias, factuality, extraction permissions.
- `raw_articles`: ingested article metadata and per-stage lifecycle.
- `article_content`: controlled full-text extraction and structured evidence.
- `story_clusters`: live event/story grouping.
- `stories`: editorial draft or published story.
- `pipeline_runs`: stage observability.
- `daily_briefs`: persisted daily summaries.
- `toddy_conversations`, `toddy_messages`, `ai_credit_ledger`: Toddy agent and credit trace.

## Canonical Article Lifecycle

The canonical article lifecycle is `raw_articles.status`:

- `raw`: RSS item ingested, extraction/embedding still pending.
- `embedded`: article has an embedding and can be clustered.
- `clustered`: article has been assigned to a `story_clusters.id`.
- `failed`: article cannot continue without intervention.

Compatibility fields still exist:

- `raw_articles.embedded`: legacy boolean mirror for dashboards and older checks.
- `raw_articles.clustered`: legacy boolean mirror for dashboards and older checks.
- `raw_articles.pipeline_status`: operational trace, not the canonical lifecycle.
- `raw_articles.extraction_status`: extraction sub-stage state, not the canonical lifecycle.

New code should read `status` for lifecycle decisions and may expose the legacy mirrors only as compatibility counters.

## Canonical Cluster Link

The canonical story-to-cluster link is:

- `stories.pipeline_cluster_id -> story_clusters.id`

Legacy compatibility:

- `stories.cluster_id` exists because older migrations/models referenced a legacy `clusters` table.
- New materialization must write `pipeline_cluster_id` and leave `cluster_id` null unless explicitly migrating legacy data.

## Canonical Cluster Vector

The canonical vector column is:

- `story_clusters.centroid_embedding`

Do not reintroduce a `centroid` column name in functions or UI code.

## Canonical Time Fields

- `raw_articles.ingested_at`: order new ingested articles.
- `story_clusters.last_seen_at`: order active clusters.
- `stories.pipeline_generated_at`: synthesis generation time.
- `stories.published_at`: public publication time.

## Public Story Reads

Public story reads must filter:

`stories.status = 'published'`

Manager/editor flows that need drafts must use explicit review helpers such as `fetchPipelineDrafts()` or `fetchDraftReview()`.

## Dashboard Counter Policy

Manager dashboards should expose canonical counters and compatibility aliases:

- canonical: `rawStatusRaw`, `rawStatusEmbedded`, `rawStatusClustered`, `clustersTotal`, `extractionPending`
- aliases: `rawEmbedded`, `rawClustered`, `clusters`, `rawExtractionPending`

This lets existing UI remain stable while future work migrates fully to canonical names.

