import { db } from "../_shared/supabase.ts";
import { jsonResponse, handleCors } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  // Auth gate (audit #10): only the service role (cron) or a manager/admin user.
  // Previously public → anyone could scrape token spend, backlog and failure rates.
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  let authorized = Boolean(token) && token === serviceKey;
  if (!authorized && token) {
    const { data: { user } } = await db.auth.getUser(token);
    if (user) {
      const { data: prof } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
      authorized = prof?.role === "manager" || prof?.role === "admin_editor";
    }
  }
  if (!authorized) return jsonResponse({ error: "unauthorized" }, 401);

  const count = async (table: string, query?: (q: any) => any) => {
    let q = db.from(table).select("*", { count: "exact", head: true });
    if (query) q = query(q);
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  };

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const [
      sourcesActive,
      sourcesTotal,
      rawTotal,
      rawEmbedded,
      rawClustered,
      extractionPending,
      extractionFailed,
      contentExtracted,
      contentPaywalled,
      contentBlocked,
      lowQualityExtractions,
      clustersTotal,
      clustersReady,
      clustersWithoutDraft,
      refreshPending,
      draftsPending,
      draftsReady,
      draftsAnalysisFailed,
      published,
      jobs24h,
      jobsFailed24h,
      runsFailed24h,
    ] = await Promise.all([
      count("sources", (q) => q.eq("activo", true)),
      count("sources"),
      count("raw_articles"),
      count("raw_articles", (q) => q.eq("embedded", true)),
      count("raw_articles", (q) => q.eq("clustered", true)),
      count("raw_articles", (q) => q.in("extraction_status", ["pending", "failed"])),
      count("raw_articles", (q) => q.eq("extraction_status", "failed")),
      count("article_content", (q) => q.eq("extraction_status", "completed")),
      count("article_content", (q) => q.eq("paywall_detected", true)),
      count("article_content", (q) => q.not("blocked_reason", "is", null)),
      count("article_content", (q) => q.lt("extraction_quality_score", 0.35).not("extraction_status", "eq", "skipped_policy")),
      count("story_clusters"),
      count("story_clusters", (q) => q.eq("status", "ready")),
      count("story_clusters", (q) => q.eq("status", "ready").is("story_id", null)),
      count("story_clusters", (q) => q.eq("status", "refresh_pending")),
      count("stories", (q) => q.eq("status", "draft").eq("is_auto_generated", true)),
      count("stories", (q) => q.eq("status", "draft").eq("is_auto_generated", true).eq("review_status", "ready_for_review")),
      count("stories", (q) => q.eq("status", "draft").eq("is_auto_generated", true).eq("review_status", "analysis_failed")),
      count("stories", (q) => q.eq("status", "published")),
      count("ingestion_jobs", (q) => q.gte("created_at", since24h)),
      count("ingestion_jobs", (q) => q.gte("created_at", since24h).or("status.eq.failed,status.eq.error")),
      count("pipeline_runs", (q) => q.gte("created_at", since24h).eq("status", "failed")),
    ]);

    const { data: lastJob } = await db
      .from("ingestion_jobs")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: recentStories } = await db
      .from("stories")
      .select("generation_metadata, review_status, updated_at")
      .eq("is_auto_generated", true)
      .gte("updated_at", since24h)
      .limit(300);

    const llmStats = (recentStories || []).reduce((acc: any, row: any) => {
      const llm = row.generation_metadata?.llm || {};
      const usage = llm.token_usage || {};
      const segmentSummary = row.generation_metadata?.segment_summary || row.generation_metadata?.segment_trace?.summary || {};
      acc.inputTokens += Number(usage.input_tokens || 0);
      acc.outputTokens += Number(usage.output_tokens || 0);
      acc.cacheReadTokens += Number(usage.cache_read_input_tokens || 0);
      if (llm.repair_used) acc.repairs += 1;
      if (Array.isArray(llm.validation_errors) && llm.validation_errors.length) acc.schemaFailures += 1;
      if (row.review_status === "analysis_failed") acc.blockedDrafts += 1;
      if ((segmentSummary?.core_missing_count || 0) > 0 || (segmentSummary?.core_partial_count || 0) > 0) acc.segmentIncomplete += 1;
      return acc;
    }, { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, repairs: 0, schemaFailures: 0, blockedDrafts: 0, segmentIncomplete: 0 });

    return jsonResponse({
      ok: true,
      sourcesActive,
      sourcesTotal,
      rawTotal,
      rawEmbedded,
      rawClustered,
      rawBacklog: Math.max(0, rawTotal - rawEmbedded),
      extractionPending,
      extractionFailed,
      contentExtracted,
      contentPaywalled,
      contentBlocked,
      lowQualityExtractions,
      clustersTotal,
      clustersReady,
      clustersWithoutDraft,
      refreshPending,
      draftsPending,
      draftsReady,
      draftsWithoutSynthesis: Math.max(0, draftsPending - draftsReady - draftsAnalysisFailed),
      draftsAnalysisFailed,
      published,
      jobs24h,
      jobsFailed24h,
      runsFailed24h,
      jobsOk24h: Math.max(0, jobs24h - jobsFailed24h),
      llmTokens24h: llmStats.inputTokens + llmStats.outputTokens,
      llmInputTokens24h: llmStats.inputTokens,
      llmOutputTokens24h: llmStats.outputTokens,
      llmCacheReadTokens24h: llmStats.cacheReadTokens,
      llmRepairs24h: llmStats.repairs,
      llmSchemaFailures24h: llmStats.schemaFailures,
      llmBlockedDrafts24h: llmStats.blockedDrafts,
      llmSegmentIncomplete24h: llmStats.segmentIncomplete,
      lastIngestAt: lastJob?.created_at || null,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
});
