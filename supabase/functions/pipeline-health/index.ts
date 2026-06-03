import { db } from "../_shared/supabase.ts";
import { jsonResponse, handleCors } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

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
      lastIngestAt: lastJob?.created_at || null,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
});
