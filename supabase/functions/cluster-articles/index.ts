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

const tokenOverlap = (a?: string | null, b?: string | null) =>
  jaccard(tokenSet(a || ""), tokenSet(b || ""));

const fingerprintOverlap = (a?: string | null, b?: string | null) => {
  if (!a || !b) return 0;
  const left = new Set(a.split("|").filter(Boolean));
  const right = new Set(b.split("|").filter(Boolean));
  return jaccard(left, right);
};

const temporalAffinity = (a?: string | null, b?: string | null) => {
  if (!a || !b) return 0.5;
  const at = new Date(a).getTime();
  const bt = new Date(b).getTime();
  if (Number.isNaN(at) || Number.isNaN(bt)) return 0.5;
  const hours = Math.abs(at - bt) / 3600000;
  if (hours <= 12) return 1;
  if (hours <= 36) return 0.75;
  if (hours <= config.clusterWindowHours) return 0.45;
  return 0;
};

const eventAffinity = (a?: string | null, b?: string | null) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const [aDay, aTerms, aEntities] = a.split("::");
  const [bDay, bTerms, bEntities] = b.split("::");
  const dayScore = aDay && bDay && aDay === bDay ? 0.2 : 0;
  return dayScore + tokenOverlap(aTerms, bTerms) * 0.35 + tokenOverlap(aEntities, bEntities) * 0.45;
};

const articleSimilarity = (a: any, b: any) => {
  const embedding = a.embedding && b.embedding ? cosineSimilarity(a.embedding, b.embedding) : null;
  const text = tokenOverlap([a.title, a.excerpt].filter(Boolean).join(" "), [b.title, b.excerpt].filter(Boolean).join(" "));
  const entities = fingerprintOverlap(a.entity_fingerprint, b.entity_fingerprint);
  const event = eventAffinity(a.event_signature, b.event_signature);
  const time = temporalAffinity(a.published_at, b.published_at);

  if (embedding !== null) {
    return embedding * 0.5 + text * 0.18 + entities * 0.16 + event * 0.12 + time * 0.04;
  }
  return text * 0.42 + entities * 0.28 + event * 0.22 + time * 0.08;
};

const sameEditorialEvent = (a: any, b: any) =>
  articleSimilarity(a, b) >= config.clusterSimilarityHigh ||
  (
    eventAffinity(a.event_signature, b.event_signature) >= 0.62 &&
    fingerprintOverlap(a.entity_fingerprint, b.entity_fingerprint) >= 0.35 &&
    temporalAffinity(a.published_at, b.published_at) >= 0.45
  );

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
      if (sameEditorialEvent(articles[i], articles[j])) {
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
    .select("id, source_id, title, excerpt, embedding, published_at, event_signature, entity_fingerprint")
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
  const topicKeywords = Array.from(new Set((articles || [])
    .flatMap((article: any) => [
      ...(article.entity_fingerprint || "").split("|"),
      ...(article.event_signature || "").split("::").flatMap((part: string) => part.split("-")),
    ])
    .map((item: string) => item.trim())
    .filter((item: string) => item.length >= 4)))
    .slice(0, 30);
  const status = forcedStatus || (sourceIds.length >= config.clusterMinSourcesReady ? "ready" : "forming");
  const lastSeenAt = new Date().toISOString();
  const coverage = calculateCoverage(biasDistribution);
  const scores = scoreCluster(articleIds.length, sourceIds.length, publishedDates);

  await db.from("story_clusters").upsert({
    id: clusterId,
    title,
    topic_summary: title,
    topic_keywords: topicKeywords,
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
    .select("id, source_id, title, excerpt, embedding, published_at, url, event_signature, entity_fingerprint")
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
    .select("id, title, topic_summary, topic_keywords, article_ids, centroid_embedding, status, source_count, updated_at, story_id, window_end")
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
        {
          embedding: parseVector(article.embedding),
          title: article.title,
          excerpt: article.excerpt,
          published_at: article.published_at,
          event_signature: article.event_signature,
          entity_fingerprint: article.entity_fingerprint,
        },
        {
          embedding: parseVector(cluster.centroid_embedding),
          title: cluster.title || cluster.topic_summary,
          excerpt: Array.isArray(cluster.topic_keywords) ? cluster.topic_keywords.join(" ") : "",
          published_at: cluster.window_end,
          event_signature: Array.isArray(cluster.topic_keywords) ? `::${cluster.topic_keywords.join("-")}::${cluster.topic_keywords.join("-")}` : null,
          entity_fingerprint: Array.isArray(cluster.topic_keywords) ? cluster.topic_keywords.join("|") : null,
        },
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
