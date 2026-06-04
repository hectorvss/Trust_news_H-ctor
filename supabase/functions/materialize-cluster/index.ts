import { db } from "../_shared/supabase.ts";
import { biasBucketOf, config, pickMainImage } from "../_shared/pipeline.ts";
import { jsonResponse, handleCors, parseJson } from "../_shared/http.ts";
import { finishRun, startRun } from "../_shared/runs.ts";

const normalizeText = (value: unknown) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const inferCategory = (cluster: any, articles: any[]) => {
  const haystack = normalizeText([
    cluster.title,
    cluster.topic_summary,
    ...articles.map((article) => article.title),
    ...articles.map((article) => article.content_excerpt || article.excerpt),
  ].join(" "));
  if (/(futbol|baloncesto|tenis|ciclismo|motors?port|deporte)/.test(haystack)) return "DEPORTES";
  if (/(econom|ibex|bolsa|banco|fmi|inflacion|mercados?|finanzas|macro)/.test(haystack)) return "ECONOMIA";
  if (/(tecnolog|inteligencia artificial|ia | llm|startup|ciber|software|datos)/.test(haystack)) return "TECNOLOGIA";
  if (/(internacional|gaza|ucrania|ucran|otan|bruselas|ee\\.uu|eeuu|europa|mundo|conflicto)/.test(haystack)) return "INTERNACIONAL";
  if (/(clima|medio ambiente|sequ[ií]a|agua|energia verde|renovable|emisiones|ecolog)/.test(haystack)) return "MEDIO AMBIENTE";
  if (/(salud|sanidad|medicina|hospital|primaria|covid|epidem)/.test(haystack)) return "SOCIEDAD";
  if (/(cultura|arte|cine|musica|libro|teatro|festival|museo)/.test(haystack)) return "CULTURA";
  if (/(vivienda|alquiler|hipoteca|sueldo|empleo|paro|trabajo)/.test(haystack)) return "ECONOMIA";
  if (/(eleccion|gobierno|congreso|senado|ley|partido|presupuesto|reforma)/.test(haystack)) return "POLITICA";
  return "SOCIEDAD";
};

const inferLocation = (articles: any[]) => {
  const countries = new Set(
    articles
      .map((article) => normalizeText(article.country || article.source_country || article.source?.country || article.source?.pais))
      .filter(Boolean),
  );
  if (countries.size === 1) {
    const only = Array.from(countries)[0];
    if (only.includes("espana")) return "España";
    if (only.includes("france")) return "Francia";
    if (only.includes("germany")) return "Alemania";
    if (only.includes("united kingdom") || only.includes("reino unido")) return "Reino Unido";
    if (only.includes("qatar")) return "Qatar";
    if (only.includes("united states") || only.includes("estados unidos")) return "Estados Unidos";
    return only.charAt(0).toUpperCase() + only.slice(1);
  }
  if (countries.size > 1) return "Internacional";
  return "España";
};

const buildStoryPayload = (cluster: any, articles: any[]) => {
  const sourceIds = [...new Set(articles.map((article) => article.source_id).filter(Boolean))];
  const category = inferCategory(cluster, articles);
  const location = inferLocation(articles);
  return {
    id: crypto.randomUUID(),
    category,
    title: cluster.title || cluster.topic_summary || "Sin título",
    summary: `Cobertura agrupada de ${articles.length} artículos sobre el mismo evento.`,
    image_url: pickMainImage(articles),
    author: "Trust News",
    time_label: "Reciente",
    location,
    source_count: sourceIds.length,
    sources_count: sourceIds.length,
    source_ids: sourceIds,
    bias: {
      left: Math.round((Number(cluster.coverage_left) || 0) * 100),
      center: Math.round((Number(cluster.coverage_center) || 0) * 100),
      right: Math.round((Number(cluster.coverage_right) || 0) * 100),
    },
    coverage_left: Number(cluster.coverage_left) || 0,
    coverage_center: Number(cluster.coverage_center) || 0,
    coverage_right: Number(cluster.coverage_right) || 0,
    articles: articles.map((article) => ({
      source: article.source_name || article.source_id || "Desconocido",
      bias: article.source_bias || "CENTER",
      title: article.title,
      summary: article.content_excerpt || article.excerpt || "",
      url: article.url,
      author: article.author || "",
      tone: article.extracted_tone || "",
      angle: "",
      diff: "",
      whyOpened: "Cobertura relevante dentro del cluster informativo",
      publishedAt: article.published_at || null,
      time: "Reciente",
      origin: "España",
      type: "REPORTAJE",
    })),
    medios_analizados: articles.map((article) => article.source_name || article.source_id || "Desconocido"),
    status: "draft",
    review_status: "pending_review",
    cluster_status: "materialized",
    is_auto_generated: true,
    pipeline_cluster_id: cluster.id,
    cluster_id: cluster.id,
    pipeline_generated_at: new Date().toISOString(),
    generated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = req.method === "POST" ? await parseJson<{ dry_run?: boolean }>(req) : {};
  const runId = await startRun({ stage: "materialize" });

  const { data: clusters, error } = await db
    .from("story_clusters")
    .select("id, title, topic_summary, article_ids, article_count, source_count, coverage_left, coverage_center, coverage_right, status, story_id, last_seen_at")
    .eq("status", "ready")
    .is("story_id", null)
    .gte("source_count", config.clusterMinSourcesReady)
    .order("source_count", { ascending: false })
    .limit(20);

  if (error) {
    await finishRun(runId, "failed", { error_message: error.message });
    return jsonResponse({ error: error.message }, 500);
  }
  if (!clusters?.length) {
    await finishRun(runId, "completed", { items_out: 0 });
    return jsonResponse({ ok: true, materialized: 0 });
  }

  let materialized = 0;
  let failed = 0;
  for (const cluster of clusters) {
    const { data: articles } = await db
      .from("raw_articles")
      .select("id, source_id, title, excerpt, author, url, image_url, published_at, article_content(content_excerpt, extracted_tone)")
      .in("id", cluster.article_ids || [])
      .order("published_at", { ascending: false });

    if (!articles?.length) continue;

    const sourceIds = [...new Set(articles.map((article) => article.source_id).filter(Boolean))];
    const { data: sources } = sourceIds.length
      ? await db.from("sources").select("id, nombre, name, bias, bias_label, bias_score").in("id", sourceIds)
      : { data: [] };

    const sourceMap: Record<string, any> = {};
    (sources || []).forEach((source: any) => { sourceMap[source.id] = source; });
    const storyArticles = articles.map((article: any) => ({
      ...article,
      content_excerpt: Array.isArray(article.article_content)
        ? article.article_content[0]?.content_excerpt
        : article.article_content?.content_excerpt,
      extracted_tone: Array.isArray(article.article_content)
        ? article.article_content[0]?.extracted_tone
        : article.article_content?.extracted_tone,
      source_name: sourceMap[article.source_id]?.nombre || sourceMap[article.source_id]?.name || article.source_id,
      source_bias: sourceMap[article.source_id] ? biasBucketOf(sourceMap[article.source_id]) : "centro",
    }));

    const story = buildStoryPayload(cluster, storyArticles);
    if (body.dry_run) {
      materialized++;
      continue;
    }
    const { error: insertError } = await db.from("stories").insert(story);
    if (insertError) {
      // One bad cluster must not abort the whole batch (was: `throw insertError`).
      console.error(`materialize cluster ${cluster.id} failed:`, insertError.message);
      failed++;
      continue;
    }

    const { error: updError } = await db.from("story_clusters").update({
      story_id: story.id,
      status: "materialized",
      materialized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", cluster.id);
    if (updError) console.error(`cluster ${cluster.id} status update failed:`, updError.message);

    materialized++;
  }

  await finishRun(runId, materialized === 0 && failed > 0 ? "failed" : "completed", {
    items_in: clusters.length,
    items_out: materialized,
    metadata: { failed, dryRun: Boolean(body.dry_run) },
  });
  return jsonResponse({ ok: true, materialized, failed });
});
