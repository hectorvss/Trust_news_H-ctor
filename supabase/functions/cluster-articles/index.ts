import { db } from "../_shared/supabase.ts";
import {
  calculateBiasDistribution,
  calculateCoverage,
  computeCentroid,
  config,
  cosineSimilarity,
  generateClusterTitle,
  jaccard,
  parseVector,
  tokenSet,
  toVectorLiteral,
} from "../_shared/pipeline.ts";
import { jsonResponse, handleCors, parseJson } from "../_shared/http.ts";
import { finishRun, startRun } from "../_shared/runs.ts";

const articleSimilarity = (a: any, b: any) => {
  if (a.embedding && b.embedding) return cosineSimilarity(a.embedding, b.embedding);
  return jaccard(
    tokenSet([a.title, a.excerpt].filter(Boolean).join(" ")),
    tokenSet([b.title, b.excerpt].filter(Boolean).join(" ")),
  );
};

const clusterArticles = (articles: any[]) => {
  const clusterOf = new Array(articles.length).fill(-1);
  const clusters: any[][] = [];

  for (let i = 0; i < articles.length; i++) {
    if (clusterOf[i] !== -1) continue;
    const clusterIdx = clusters.length;
    clusters.push([articles[i]]);
    clusterOf[i] = clusterIdx;
    for (let j = i + 1; j < articles.length; j++) {
      if (clusterOf[j] !== -1) continue;
      if (articleSimilarity(articles[i], articles[j]) >= config.clusterSimilarityHigh) {
        clusters[clusterIdx].push(articles[j]);
        clusterOf[j] = clusterIdx;
      }
    }
  }

  return clusters.filter((cluster) => cluster.length >= config.clusterMinArticles);
};

const scoreCluster = (articleCount: number, sourceCount: number, publishedDates: string[]) => {
  const confidence = Math.min(1, (articleCount / Math.max(1, config.clusterMinArticles)) * 0.45 + (sourceCount / Math.max(1, config.clusterMinSourcesReady)) * 0.55);
  const diversity = Math.min(1, sourceCount / Math.max(1, config.clusterMinSourcesReady + 2));
  const newest = publishedDates[publishedDates.length - 1] ? new Date(publishedDates[publishedDates.length - 1]).getTime() : Date.now();
  const ageHours = Math.max(0, (Date.now() - newest) / 3600000);
  const freshness = Math.max(0, 1 - ageHours / config.clusterWindowHours);
  const synthesis = Math.min(1, confidence * 0.5 + diversity * 0.3 + freshness * 0.2);
  return { confidence, diversity, freshness, synthesis };
};

const recalcCluster = async (clusterId: string, articleIds: string[], forcedStatus?: string) => {
  const { data: articles } = await db
    .from("raw_articles")
    .select("id, source_id, title, excerpt, embedding, published_at")
    .in("id", articleIds);

  const sourceIds = [...new Set((articles || []).map((article: any) => article.source_id).filter(Boolean))];
  const { data: sources } = sourceIds.length
    ? await db.from("sources").select("id, bias, bias_label, bias_score, factuality, nombre").in("id", sourceIds)
    : { data: [] };

  const sourceMap: Record<string, any> = {};
  (sources || []).forEach((source: any) => { sourceMap[source.id] = source; });

  const embeddings = (articles || []).map((article: any) => parseVector(article.embedding)).filter(Boolean);
  const centroid = computeCentroid(embeddings);
  const biasDistribution = calculateBiasDistribution(articles || [], sourceMap);
  const publishedDates = (articles || [])
    .map((article: any) => article.published_at)
    .filter(Boolean)
    .sort();

  const title = generateClusterTitle(articles || []);
  const status = forcedStatus || (sourceIds.length >= config.clusterMinSourcesReady ? "ready" : "forming");
  const lastSeenAt = new Date().toISOString();
  const coverage = calculateCoverage(biasDistribution);
  const scores = scoreCluster(articleIds.length, sourceIds.length, publishedDates);

  await db.from("story_clusters").upsert({
    id: clusterId,
    title,
    topic_summary: title,
    article_ids: articleIds,
    article_count: articleIds.length,
    source_count: sourceIds.length,
    bias_distribution: biasDistribution,
    coverage_left: coverage.left,
    coverage_center: coverage.center,
    coverage_right: coverage.right,
    left_pct: coverage.left,
    center_pct: coverage.center,
    right_pct: coverage.right,
    confidence_score: Number(scores.confidence.toFixed(3)),
    diversity_score: Number(scores.diversity.toFixed(3)),
    freshness_score: Number(scores.freshness.toFixed(3)),
    synthesis_score: Number(scores.synthesis.toFixed(3)),
    refresh_needed: status === "refresh_pending",
    centroid_embedding: toVectorLiteral(centroid),
    status,
    last_seen_at: lastSeenAt,
    window_start: publishedDates[0] || lastSeenAt,
    window_end: publishedDates[publishedDates.length - 1] || lastSeenAt,
  });

  await db.from("raw_articles").update({ cluster_id: clusterId, clustered: true, pipeline_status: "clustered" }).in("id", articleIds);
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = req.method === "POST" ? await parseJson<{ dry_run?: boolean }>(req) : {};
  const runId = await startRun({ stage: "cluster" });
  const windowStart = new Date(Date.now() - config.clusterWindowHours * 3600 * 1000).toISOString();
  const { data: pending, error } = await db
    .from("raw_articles")
    .select("id, source_id, title, excerpt, embedding, published_at, url")
    .eq("embedded", true)
    .eq("clustered", false)
    .gte("ingested_at", windowStart)
    .order("published_at", { ascending: true });

  if (error) {
    await finishRun(runId, "failed", { error_message: error.message });
    return jsonResponse({ error: error.message }, 500);
  }
  if (!pending?.length) {
    await finishRun(runId, "completed", { items_out: 0 });
    return jsonResponse({ ok: true, processed: 0, created: 0, updated: 0 });
  }

  const recentWindow = new Date(Date.now() - config.clusterExistingWindowHours * 3600 * 1000).toISOString();
  const { data: existingClusters } = await db
    .from("story_clusters")
    .select("id, article_ids, centroid_embedding, status, source_count, updated_at, story_id")
    .in("status", ["forming", "ready", "materialized", "refresh_pending", "promoted"])
    .gte("updated_at", recentWindow);

  let updated = 0;
  let created = 0;
  const unassigned: any[] = [];

  for (const article of pending) {
    let matchedClusterId: string | null = null;
    let bestScore = 0;

    for (const cluster of existingClusters || []) {
      if (!cluster.centroid_embedding) continue;
      const score = articleSimilarity(
        { embedding: parseVector(article.embedding), title: article.title, excerpt: article.excerpt },
        { embedding: parseVector(cluster.centroid_embedding) },
      );
      if (score > bestScore && score >= config.clusterSimilarityLow) {
        bestScore = score;
        matchedClusterId = cluster.id;
      }
    }

    if (matchedClusterId) {
      const { data: clusterRow } = await db.from("story_clusters").select("article_ids, story_id, status").eq("id", matchedClusterId).maybeSingle();
      const nextIds = Array.from(new Set([...(clusterRow?.article_ids || []), article.id]));
      if (!body.dry_run) {
        const forcedStatus = clusterRow?.story_id ? "refresh_pending" : undefined;
        await recalcCluster(matchedClusterId, nextIds, forcedStatus);
        if (forcedStatus && clusterRow.story_id) {
          await db.from("stories").update({
            cluster_status: "refresh_pending",
            review_status: "pending_review",
            last_cluster_refresh_at: new Date().toISOString(),
          }).eq("id", clusterRow.story_id);
        }
      }
      updated++;
    } else {
      unassigned.push(article);
    }
  }

  const groups = clusterArticles(unassigned);
  for (const group of groups) {
    const articleIds = group.map((article) => article.id);
    const clusterId = crypto.randomUUID();
    if (!body.dry_run) await recalcCluster(clusterId, articleIds);
    created++;
  }

  await finishRun(runId, "completed", {
    items_in: pending.length,
    items_out: updated + created,
    metadata: { updated, created, dryRun: Boolean(body.dry_run) },
  });
  return jsonResponse({
    ok: true,
    processed: pending.length,
    updated,
    created,
    unassigned: unassigned.length - groups.reduce((sum, group) => sum + group.length, 0),
  });
});
