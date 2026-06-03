import { db } from "../_shared/supabase.ts";
import { jsonResponse, handleCors, parseJson } from "../_shared/http.ts";
import { biasBucketOf, validateEditorialStory } from "../_shared/pipeline.ts";
import { finishRun, startRun } from "../_shared/runs.ts";

const articlePayload = (article: any, source: any) => {
  const content = Array.isArray(article.article_content) ? article.article_content[0] : article.article_content;
  return {
    source: source?.nombre || source?.name || article.source_id || "Desconocido",
    bias: source ? biasBucketOf(source) : "centro",
    title: article.title,
    summary: content?.content_excerpt || article.excerpt || "",
    url: article.url,
    author: article.author || "",
    publishedAt: article.published_at || null,
    tone: content?.extracted_tone || "",
    angle: "",
    diff: "",
    whyOpened: "Nueva cobertura incorporada al seguimiento de la noticia",
    time: "Reciente",
    origin: "España",
    type: "REPORTAJE",
  };
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = req.method === "POST" ? await parseJson<{ cluster_id?: string; dry_run?: boolean }>(req) : {};
  const runId = await startRun({ stage: "refresh", cluster_id: body.cluster_id || null });

  try {
    let query = db
      .from("story_clusters")
      .select("id, story_id, article_ids, source_count, coverage_left, coverage_center, coverage_right, refresh_needed, status")
      .eq("status", "refresh_pending")
      .not("story_id", "is", null)
      .limit(20);
    if (body.cluster_id) query = query.eq("id", body.cluster_id);
    const { data: clusters, error } = await query;
    if (error) throw error;
    if (!clusters?.length) {
      await finishRun(runId, "completed", { items_out: 0 });
      return jsonResponse({ ok: true, refreshed: 0 });
    }

    let refreshed = 0;
    for (const cluster of clusters) {
      const { data: story } = await db.from("stories").select("*").eq("id", cluster.story_id).maybeSingle();
      if (!story) continue;

      const { data: articles } = await db
        .from("raw_articles")
        .select("id, source_id, title, excerpt, author, url, image_url, published_at, article_content(content_excerpt, extracted_tone)")
        .in("id", cluster.article_ids || [])
        .order("published_at", { ascending: false });
      if (!articles?.length) continue;

      const sourceIds = [...new Set(articles.map((article: any) => article.source_id).filter(Boolean))];
      const { data: sources } = sourceIds.length
        ? await db.from("sources").select("id, nombre, name, bias, bias_label, bias_score").in("id", sourceIds)
        : { data: [] };
      const sourceMap: Record<string, any> = {};
      (sources || []).forEach((source: any) => { sourceMap[source.id] = source; });

      const nextArticles = articles.map((article: any) => articlePayload(article, sourceMap[article.source_id]));
      const nextStory = {
        ...story,
        articles: nextArticles,
        source_count: sourceIds.length,
        sources_count: sourceIds.length,
        coverage_left: Number(cluster.coverage_left) || 0,
        coverage_center: Number(cluster.coverage_center) || 0,
        coverage_right: Number(cluster.coverage_right) || 0,
      };
      const validation = validateEditorialStory(nextStory);

      if (!body.dry_run) {
        await db.from("stories").update({
          articles: nextArticles,
          source_count: sourceIds.length,
          sources_count: sourceIds.length,
          source_ids: sourceIds,
          medios_analizados: nextArticles.map((article: any) => article.source),
          coverage_left: Number(cluster.coverage_left) || 0,
          coverage_center: Number(cluster.coverage_center) || 0,
          coverage_right: Number(cluster.coverage_right) || 0,
          cluster_status: "refresh_pending",
          review_status: "pending_review",
          editorial_validation: { ...validation, missing: [...new Set([...validation.missing, "manager_refresh_review"])] },
          last_cluster_refresh_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", story.id);

        await db.from("story_clusters").update({
          refresh_needed: false,
          refreshed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", cluster.id);
      }

      refreshed++;
    }

    await finishRun(runId, "completed", {
      items_in: clusters.length,
      items_out: refreshed,
      metadata: { dryRun: Boolean(body.dry_run) },
    });
    return jsonResponse({ ok: true, refreshed });
  } catch (err) {
    await finishRun(runId, "failed", { error_message: String(err).slice(0, 500) });
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
});
