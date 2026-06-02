// Clustering by semantic similarity using embeddings (or Jaccard fallback)
// Groups related articles into story_clusters in Supabase

const SIMILARITY_THRESHOLD = 0.82;     // cosine similarity to join a cluster
const MIN_ARTICLES_PER_CLUSTER = 2;    // clusters with fewer articles are discarded
const READY_MIN_SOURCES = 3;           // clusters with >= N distinct sources → 'ready'
const WINDOW_HOURS = 72;               // look back this many hours for unclustered articles
const EXISTING_CLUSTER_HOURS = 48;     // try to absorb into clusters younger than this

function log(msg) {
  const t = new Date().toTimeString().slice(0, 8);
  console.log(`[${t}] [clustering] ${msg}`);
}

// ── Vector math ─────────────────────────────────────────────

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Jaccard similarity on word-level token sets (fallback when no embeddings)
function jaccardSimilarity(textA, textB) {
  if (!textA || !textB) return 0;
  const tokenize = t => new Set(
    t.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  );
  const setA = tokenize(textA);
  const setB = tokenize(textB);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function similarity(a, b) {
  if (a.embedding && b.embedding) {
    return cosineSimilarity(a.embedding, b.embedding);
  }
  // Fallback: Jaccard on title + excerpt
  const textA = [a.title, a.excerpt].filter(Boolean).join(' ');
  const textB = [b.title, b.excerpt].filter(Boolean).join(' ');
  return jaccardSimilarity(textA, textB);
}

// ── Greedy clustering ────────────────────────────────────────

export function clusterArticles(articles) {
  // Each cluster is an array of article indices
  const clusterOf = new Array(articles.length).fill(-1);
  const clusters = [];

  for (let i = 0; i < articles.length; i++) {
    if (clusterOf[i] !== -1) continue; // already assigned

    // Start a new cluster with article i as seed
    const clusterIdx = clusters.length;
    clusters.push([i]);
    clusterOf[i] = clusterIdx;

    for (let j = i + 1; j < articles.length; j++) {
      if (clusterOf[j] !== -1) continue;
      const sim = similarity(articles[i], articles[j]);
      if (sim >= SIMILARITY_THRESHOLD) {
        clusters[clusterIdx].push(j);
        clusterOf[j] = clusterIdx;
      }
    }
  }

  // Return only clusters with enough articles
  return clusters
    .filter(c => c.length >= MIN_ARTICLES_PER_CLUSTER)
    .map(indices => indices.map(i => articles[i]));
}

// ── Bias distribution ────────────────────────────────────────

export function calculateBiasDistribution(articles, sourcesMap) {
  const counts = { izquierda: 0, centroizquierda: 0, centro: 0, centroderecha: 0, derecha: 0 };
  let total = 0;

  for (const article of articles) {
    const src = sourcesMap[article.source_id];
    if (src && src.bias && counts[src.bias] !== undefined) {
      counts[src.bias]++;
      total++;
    }
  }

  if (total === 0) return counts;

  // Normalize to 0–1 fractions
  const dist = {};
  for (const [k, v] of Object.entries(counts)) {
    dist[k] = parseFloat((v / total).toFixed(3));
  }
  return dist;
}

// ── Cluster title: most representative title (highest word overlap) ──

export function generateClusterTitle(articles) {
  if (!articles.length) return 'Sin título';
  if (articles.length === 1) return articles[0].title || 'Sin título';

  // TF-IDF lite: pick the title whose words appear most in other titles
  const allWords = articles
    .map(a => a.title || '')
    .join(' ')
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3);

  const freq = {};
  for (const w of allWords) freq[w] = (freq[w] || 0) + 1;

  let best = articles[0];
  let bestScore = -1;

  for (const article of articles) {
    if (!article.title) continue;
    const words = article.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const score = words.reduce((s, w) => s + (freq[w] || 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = article;
    }
  }

  return best.title || 'Sin título';
}

// ── Centroid embedding ───────────────────────────────────────

function computeCentroid(embeddings) {
  if (!embeddings.length || !embeddings[0]) return null;
  const dims = embeddings[0].length;
  const centroid = new Array(dims).fill(0);
  for (const emb of embeddings) {
    for (let i = 0; i < dims; i++) centroid[i] += emb[i];
  }
  for (let i = 0; i < dims; i++) centroid[i] /= embeddings.length;
  return centroid;
}

// ── Main entry point ─────────────────────────────────────────

export async function clusterNewArticles(supabaseAdmin) {
  log('Starting clustering pass...');

  // 1. Fetch unclustered articles from last WINDOW_HOURS
  const windowStart = new Date(Date.now() - WINDOW_HOURS * 3600 * 1000).toISOString();
  const { data: articles, error: artErr } = await supabaseAdmin
    .from('raw_articles')
    .select('id, source_id, url_hash, title, excerpt, embedding, published_at')
    .is('cluster_id', null)
    .gte('ingested_at', windowStart)
    .order('published_at', { ascending: false });

  if (artErr) {
    log(`ERROR fetching unclustered articles: ${artErr.message}`);
    return;
  }

  if (!articles || articles.length === 0) {
    log('No unclustered articles found.');
    return;
  }

  log(`Found ${articles.length} unclustered articles`);

  // 2. Load source metadata for bias calculation
  const sourceIds = [...new Set(articles.map(a => a.source_id).filter(Boolean))];
  let sourcesMap = {};
  if (sourceIds.length > 0) {
    const { data: sources } = await supabaseAdmin
      .from('sources')
      .select('id, bias, factuality')
      .in('id', sourceIds);
    if (sources) {
      for (const s of sources) sourcesMap[s.id] = s;
    }
  }

  // 3. Load recent existing clusters to try absorbing into them
  const existingWindowStart = new Date(Date.now() - EXISTING_CLUSTER_HOURS * 3600 * 1000).toISOString();
  const { data: existingClusters } = await supabaseAdmin
    .from('story_clusters')
    .select('id, title, article_ids, article_count, source_count, centroid_embedding, bias_distribution, status, window_start, window_end')
    .in('status', ['forming', 'ready'])
    .gte('updated_at', existingWindowStart);

  const absorptionMap = new Map(); // article_id → cluster_id (for absorption)
  const absorbedIntoCluster = new Map(); // cluster_id → { newArticles[] }

  // 4. Try absorbing unclustered articles into existing clusters
  const unabsorbedArticles = [];
  for (const article of articles) {
    let absorbed = false;
    if (existingClusters) {
      for (const cluster of existingClusters) {
        if (!cluster.centroid_embedding) continue;
        const fakeA = { embedding: cluster.centroid_embedding };
        const fakeB = { embedding: article.embedding, title: article.title, excerpt: article.excerpt };
        const sim = similarity(fakeA, fakeB);
        if (sim >= SIMILARITY_THRESHOLD) {
          absorptionMap.set(article.id, cluster.id);
          if (!absorbedIntoCluster.has(cluster.id)) {
            absorbedIntoCluster.set(cluster.id, { cluster, newArticles: [] });
          }
          absorbedIntoCluster.get(cluster.id).newArticles.push(article);
          absorbed = true;
          break;
        }
      }
    }
    if (!absorbed) unabsorbedArticles.push(article);
  }

  log(`Absorbing ${absorptionMap.size} articles into ${absorbedIntoCluster.size} existing clusters`);

  // 5. Update existing clusters with absorbed articles
  for (const [clusterId, { cluster, newArticles }] of absorbedIntoCluster.entries()) {
    try {
      const updatedIds = [...(cluster.article_ids || []), ...newArticles.map(a => a.id)];
      const updatedSourceIds = [...new Set([
        ...(cluster.article_ids || []).map(() => null).filter(Boolean), // already counted
        ...newArticles.map(a => a.source_id).filter(Boolean),
      ])];

      // Re-fetch all articles for this cluster to get proper source count & bias
      const { data: allClusterArticles } = await supabaseAdmin
        .from('raw_articles')
        .select('id, source_id, embedding')
        .in('id', updatedIds);

      const distinctSources = new Set((allClusterArticles || []).map(a => a.source_id).filter(Boolean));
      const biasDistribution = calculateBiasDistribution(allClusterArticles || [], sourcesMap);
      const embeddings = (allClusterArticles || []).map(a => a.embedding).filter(Boolean);
      const centroid = computeCentroid(embeddings);

      const newStatus = distinctSources.size >= READY_MIN_SOURCES ? 'ready' : cluster.status;

      const { error: upErr } = await supabaseAdmin
        .from('story_clusters')
        .update({
          article_ids: updatedIds,
          article_count: updatedIds.length,
          source_count: distinctSources.size,
          bias_distribution: biasDistribution,
          centroid_embedding: centroid,
          status: newStatus,
          window_end: new Date().toISOString(),
        })
        .eq('id', clusterId);

      if (upErr) {
        log(`ERROR updating cluster ${clusterId}: ${upErr.message}`);
        continue;
      }

      // Assign cluster_id to absorbed articles
      const { error: artUpErr } = await supabaseAdmin
        .from('raw_articles')
        .update({ cluster_id: clusterId })
        .in('id', newArticles.map(a => a.id));

      if (artUpErr) log(`ERROR assigning cluster to absorbed articles: ${artUpErr.message}`);

    } catch (err) {
      log(`ERROR processing cluster absorption ${clusterId}: ${err.message}`);
    }
  }

  // 6. Run greedy clustering on unabsorbed articles
  log(`Clustering ${unabsorbedArticles.length} remaining articles...`);
  const newClusters = clusterArticles(unabsorbedArticles);
  log(`Formed ${newClusters.length} new clusters`);

  let clustersCreated = 0;
  for (const group of newClusters) {
    try {
      const articleIds = group.map(a => a.id);
      const distinctSources = new Set(group.map(a => a.source_id).filter(Boolean));
      const biasDistribution = calculateBiasDistribution(group, sourcesMap);
      const title = generateClusterTitle(group);
      const embeddings = group.map(a => a.embedding).filter(Boolean);
      const centroid = computeCentroid(embeddings);
      const publishedDates = group.map(a => a.published_at).filter(Boolean).sort();

      const status = distinctSources.size >= READY_MIN_SOURCES ? 'ready' : 'forming';

      const { data: newCluster, error: insertErr } = await supabaseAdmin
        .from('story_clusters')
        .insert({
          title,
          article_ids: articleIds,
          article_count: group.length,
          source_count: distinctSources.size,
          bias_distribution: biasDistribution,
          centroid_embedding: centroid,
          status,
          window_start: publishedDates[0] || new Date().toISOString(),
          window_end: publishedDates[publishedDates.length - 1] || new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertErr) {
        log(`ERROR inserting cluster: ${insertErr.message}`);
        continue;
      }

      // Assign cluster_id to articles
      const { error: artUpErr } = await supabaseAdmin
        .from('raw_articles')
        .update({ cluster_id: newCluster.id })
        .in('id', articleIds);

      if (artUpErr) log(`ERROR assigning cluster_id to articles: ${artUpErr.message}`);

      clustersCreated++;
    } catch (err) {
      log(`ERROR creating cluster: ${err.message}`);
    }
  }

  log(`Done. Created ${clustersCreated} new clusters, updated ${absorbedIntoCluster.size} existing.`);
}
