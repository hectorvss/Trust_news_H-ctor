// Scheduler: orchestrates one full ingestion cycle
// parseRSS → normalize → deduplicate → insert → embed → cluster → analyze

import { parseRSSFeed } from './rssParser.js';
import { extractArticleMetadata } from './articleExtractor.js';
import { normalizeArticle, isDuplicate } from './normalizer.js';
import { generateEmbedding, buildEmbeddingInput } from './embeddings.js';
import { clusterNewArticles } from './clustering.js';
import { analyzeCluster } from './llmAnalysis.js';

const MAX_CONCURRENT_SOURCES = 5;  // semaphore slots
const MIN_SOURCES_FOR_LLM = 5;     // must match llmAnalysis.js

function log(msg) {
  const t = new Date().toTimeString().slice(0, 8);
  console.log(`[${t}] [scheduler] ${msg}`);
}

// ── Simple semaphore for concurrency control ─────────────────

class Semaphore {
  constructor(limit) {
    this.limit = limit;
    this.active = 0;
    this.queue = [];
  }

  acquire() {
    return new Promise(resolve => {
      if (this.active < this.limit) {
        this.active++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    this.active--;
    if (this.queue.length > 0) {
      this.active++;
      this.queue.shift()();
    }
  }
}

// ── Process a single source ──────────────────────────────────

async function processSource(source, supabaseAdmin) {
  const result = { sourceId: source.id, articlesFound: 0, articlesNew: 0, error: null };

  // 1. Create ingestion_job record
  const { data: job, error: jobErr } = await supabaseAdmin
    .from('ingestion_jobs')
    .insert({
      source_id: source.id,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (jobErr) {
    log(`WARN: Could not create ingestion_job for source ${source.id}: ${jobErr.message}`);
  }

  const jobId = job?.id;

  try {
    if (!source.rss_url) {
      throw new Error('Source has no rss_url');
    }

    // 2. Parse RSS feed
    const rawItems = await parseRSSFeed(source.rss_url);
    result.articlesFound = rawItems.length;

    let articlesNew = 0;

    for (const rawItem of rawItems) {
      try {
        // 3. Normalize
        const normalized = normalizeArticle(rawItem, source.id);

        // 4. Check duplicate
        const dup = await isDuplicate(normalized.url_hash, supabaseAdmin);
        if (dup) continue;

        // 5. Try to enrich metadata if RSS had incomplete data
        let enriched = normalized;
        if (!normalized.excerpt && !normalized.image_url) {
          const meta = await extractArticleMetadata(normalized.url);
          if (meta) {
            enriched = {
              ...normalized,
              title: enriched.title || meta.title,
              excerpt: meta.excerpt || null,
              image_url: meta.imageUrl || null,
              author: enriched.author || meta.author || null,
              published_at: enriched.published_at || meta.publishedAt || null,
            };
          }
        }

        // 6. Generate embedding
        const embeddingInput = buildEmbeddingInput(enriched.title, enriched.excerpt);
        const embedding = embeddingInput ? await generateEmbedding(embeddingInput) : null;

        // 7. Insert into raw_articles
        const { error: insertErr } = await supabaseAdmin
          .from('raw_articles')
          .insert({
            source_id: enriched.source_id,
            url: enriched.url,
            url_hash: enriched.url_hash,
            title: enriched.title,
            excerpt: enriched.excerpt,
            author: enriched.author,
            published_at: enriched.published_at,
            image_url: enriched.image_url,
            language: enriched.language,
            raw_metadata: enriched.raw_metadata,
            embedding: embedding,
          });

        if (insertErr) {
          // url unique constraint = duplicate that slipped past hash check; ignore
          if (insertErr.code === '23505') continue;
          log(`WARN: insert error for ${enriched.url}: ${insertErr.message}`);
          continue;
        }

        articlesNew++;
      } catch (itemErr) {
        log(`WARN: Error processing item from source ${source.nombre}: ${itemErr.message}`);
      }
    }

    result.articlesNew = articlesNew;

    // 8. Update ingestion_job as completed
    if (jobId) {
      await supabaseAdmin
        .from('ingestion_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          articles_found: result.articlesFound,
          articles_new: result.articlesNew,
        })
        .eq('id', jobId);
    }

    log(`✓ ${source.nombre}: ${result.articlesFound} found, ${result.articlesNew} new`);

  } catch (err) {
    result.error = err.message;
    log(`✗ ${source.nombre}: ${err.message}`);

    if (jobId) {
      await supabaseAdmin
        .from('ingestion_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: err.message.slice(0, 500),
        })
        .eq('id', jobId);
    }
  }

  return result;
}

// ── Analyze ready clusters with enough sources ───────────────

async function analyzePendingClusters(supabaseAdmin) {
  const { data: readyClusters, error } = await supabaseAdmin
    .from('story_clusters')
    .select('id, title, article_ids, source_count, bias_distribution')
    .eq('status', 'ready')
    .is('story_id', null) // not yet promoted to a story
    .gte('source_count', MIN_SOURCES_FOR_LLM);

  if (error) {
    log(`ERROR fetching ready clusters: ${error.message}`);
    return;
  }

  if (!readyClusters || readyClusters.length === 0) {
    log('No ready clusters to analyze.');
    return;
  }

  log(`Analyzing ${readyClusters.length} ready clusters...`);

  for (const cluster of readyClusters) {
    try {
      if (!cluster.article_ids || cluster.article_ids.length === 0) continue;

      // Fetch articles for this cluster
      const { data: articles } = await supabaseAdmin
        .from('raw_articles')
        .select('id, source_id, title, excerpt, embedding')
        .in('id', cluster.article_ids);

      if (!articles || articles.length === 0) continue;

      // Fetch source metadata
      const sourceIds = [...new Set(articles.map(a => a.source_id).filter(Boolean))];
      let sourcesMap = {};
      if (sourceIds.length > 0) {
        const { data: sources } = await supabaseAdmin
          .from('sources')
          .select('id, nombre, bias, factuality')
          .in('id', sourceIds);
        if (sources) {
          for (const s of sources) sourcesMap[s.id] = s;
        }
      }

      const analysis = await analyzeCluster(cluster, articles, sourcesMap);
      if (!analysis) continue;

      // Store analysis result back into the cluster as raw_metadata / bias_distribution supplement
      // The full analysis is stored in story_clusters.bias_distribution (extended) or a dedicated column
      // For now, store as topic_keywords (keywords) and update title if provided
      const updatePayload = {};
      if (analysis.title) updatePayload.title = analysis.title.slice(0, 255);
      if (analysis.factuality) {
        updatePayload.bias_distribution = {
          ...(cluster.bias_distribution || {}),
          llm_factuality: analysis.factuality,
          llm_summary: analysis.summary?.slice(0, 300),
          llm_consenso: analysis.consenso_narrativo?.slice(0, 200),
          llm_blind_spot: analysis.blind_spot?.slice(0, 200),
          llm_perspectivas: analysis.perspectivas_info,
          llm_cifras: analysis.cifras_clave,
          llm_claims: analysis.claims_en_disputa,
        };
      }

      if (Object.keys(updatePayload).length > 0) {
        const { error: upErr } = await supabaseAdmin
          .from('story_clusters')
          .update(updatePayload)
          .eq('id', cluster.id);

        if (upErr) log(`ERROR saving analysis for cluster ${cluster.id}: ${upErr.message}`);
      }

    } catch (err) {
      log(`ERROR during cluster analysis for ${cluster.id}: ${err.message}`);
    }
  }
}

// ── Main cycle ───────────────────────────────────────────────

export async function runIngestionCycle(sources, supabaseAdmin) {
  const report = {
    sourcesProcessed: 0,
    articlesFound: 0,
    articlesNew: 0,
    clustersUpdated: 0,
    errors: [],
  };

  if (!sources || sources.length === 0) {
    log('No active sources to process.');
    return report;
  }

  log(`Processing ${sources.length} sources (max ${MAX_CONCURRENT_SOURCES} concurrent)`);

  const semaphore = new Semaphore(MAX_CONCURRENT_SOURCES);

  // Run all sources with concurrency limit
  const tasks = sources.map(async source => {
    await semaphore.acquire();
    try {
      return await processSource(source, supabaseAdmin);
    } finally {
      semaphore.release();
    }
  });

  const results = await Promise.allSettled(tasks);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const r = result.value;
      report.sourcesProcessed++;
      report.articlesFound += r.articlesFound;
      report.articlesNew += r.articlesNew;
      if (r.error) report.errors.push({ sourceId: r.sourceId, error: r.error });
    } else {
      report.errors.push({ error: result.reason?.message || 'Unknown error' });
    }
  }

  log(`Sources done. Found: ${report.articlesFound}, New: ${report.articlesNew}, Errors: ${report.errors.length}`);

  // Cluster new articles
  if (report.articlesNew > 0) {
    log('Running clustering pass...');
    try {
      await clusterNewArticles(supabaseAdmin);
    } catch (err) {
      log(`ERROR in clustering: ${err.message}`);
      report.errors.push({ error: `clustering: ${err.message}` });
    }
  }

  // Analyze ready clusters
  try {
    await analyzePendingClusters(supabaseAdmin);
  } catch (err) {
    log(`ERROR in LLM analysis pass: ${err.message}`);
    report.errors.push({ error: `llm_analysis: ${err.message}` });
  }

  return report;
}
