import { db } from "../_shared/supabase.ts";
import { config, normalizeUrl, parseRssFeed, sha256 } from "../_shared/pipeline.ts";
import { jsonResponse, handleCors, parseJson } from "../_shared/http.ts";
import { finishRun, startRun } from "../_shared/runs.ts";

const processSource = async (source: any, dryRun = false) => {
  const runId = await startRun({ stage: "ingest", source_id: source.id });
  const { data: job } = await db
    .from("ingestion_jobs")
    .insert({
      source_id: source.id,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  let found = 0;
  let fresh = 0;
  let duplicates = 0;
  try {
    const items = await parseRssFeed(source.rss_url, config.userAgent);
    found = items.length;

    for (const item of items) {
      const normalizedUrl = normalizeUrl(item.url);
      const urlHash = await sha256(normalizedUrl);
      const contentHash = await sha256(`${source.id}:${item.title || ""}:${item.excerpt || ""}`);

      const { data: existing } = await db
        .from("raw_articles")
        .select("id")
        .eq("url_hash", urlHash)
        .limit(1)
        .maybeSingle();

      if (existing) {
        duplicates++;
        continue;
      }

      // Full content / image / author enrichment is deferred to the
      // extract-article-content stage. Doing a second 8s network fetch PER ITEM
      // here serialized every run into Edge-function timeouts (audit #3).
      const enriched = { ...item, url: normalizedUrl };

      if (dryRun) {
        fresh++;
        continue;
      }

      const { error } = await db.from("raw_articles").insert({
        source_id: source.id,
        url: enriched.url,
        url_hash: urlHash,
        content_hash: contentHash,
        title: enriched.title,
        excerpt: enriched.excerpt,
        author: enriched.author,
        published_at: enriched.publishedAt,
        image_url: enriched.imageUrl,
        language: source.language || "es",
        lang: source.language || "es",
        raw_metadata: enriched.rawMetadata || {},
        status: "raw",
        pipeline_status: "ingested",
        extraction_status: "pending",
        embedded: false,
        clustered: false,
      });

      if (!error) fresh++;
    }

    await db.from("ingestion_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      articles_found: found,
      articles_new: fresh,
    }).eq("id", job?.id);
    await db.from("sources").update({
      last_checked_at: new Date().toISOString(),
      articles_ingested: (source.articles_ingested || 0) + fresh,
      source_status: "active",
    }).eq("id", source.id);
    await finishRun(runId, "completed", {
      items_in: found,
      items_out: fresh,
      metadata: { duplicates, dryRun },
    });

    return { source: source.id, found, fresh, duplicates };
  } catch (err) {
    await db.from("ingestion_jobs").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      articles_found: found,
      articles_new: fresh,
      error_message: String(err).slice(0, 500),
    }).eq("id", job?.id);
    await db.from("sources").update({
      last_checked_at: new Date().toISOString(),
      last_error_at: new Date().toISOString(),
      error_count: (source.error_count || 0) + 1,
      source_status: "error",
    }).eq("id", source.id);
    await finishRun(runId, "failed", { error_message: String(err).slice(0, 500), metadata: { found, fresh } });

    return { source: source.id, found, fresh, error: String(err) };
  }
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = req.method === "POST" ? await parseJson<{ dry_run?: boolean; source_id?: string }>(req) : {};

  let sourceQuery = db
    .from("sources")
    .select("id, nombre, name, rss_url, language, activo, articles_ingested, error_count")
    .eq("activo", true)
    .not("rss_url", "is", null);
  if (body.source_id) sourceQuery = sourceQuery.eq("id", body.source_id);
  const { data: sources, error } = await sourceQuery;

  if (error) return jsonResponse({ error: error.message }, 500);

  const activeSources = (sources || []).filter((source) => source.rss_url);
  const results: any[] = [];
  // Bounded concurrency + wall-clock deadline: one slow feed can't stall the run,
  // and we stop launching new sources before the Edge time limit (audit #3).
  const deadline = Date.now() + Number(Deno.env.get("PIPELINE_INGEST_DEADLINE_MS") ?? 50000);
  const concurrency = Math.max(1, config.ingestConcurrency);
  let cursor = 0;
  const worker = async () => {
    while (cursor < activeSources.length && Date.now() < deadline) {
      const source = activeSources[cursor++];
      results.push(await processSource(source, Boolean(body.dry_run)));
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, activeSources.length || 1) }, () => worker()),
  );

  return jsonResponse({
    ok: true,
    sources: results.length,
    found: results.reduce((sum, row) => sum + (row.found || 0), 0),
    fresh: results.reduce((sum, row) => sum + (row.fresh || 0), 0),
    results,
  });
});
