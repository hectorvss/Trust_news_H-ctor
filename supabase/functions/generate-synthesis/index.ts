import { db } from "../_shared/supabase.ts";
import { analyzeCluster, config } from "../_shared/llm.ts";
import { jsonResponse, handleCors, parseJson } from "../_shared/http.ts";
import { validateEditorialStory } from "../_shared/pipeline.ts";
import { finishRun, startRun } from "../_shared/runs.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = req.method === "POST" ? await parseJson<{ dry_run?: boolean; story_id?: string }>(req) : {};
  const runId = await startRun({ stage: "synthesize" });

  const cutoff = new Date(Date.now() - config.analysisMinAgeMinutes * 60 * 1000).toISOString();
  let draftQuery = db
    .from("stories")
    .select("id, title, summary, pipeline_cluster_id, cluster_id, source_count, sources_count, status, created_at, consensus_narrative, consenso_narrativo, articles, coverage_left, coverage_center, coverage_right")
    .eq("status", "draft")
    .eq("is_auto_generated", true)
    .is("consensus_narrative", null);
  if (body.story_id) draftQuery = draftQuery.eq("id", body.story_id);
  else draftQuery = draftQuery.gte("created_at", cutoff);
  const { data: drafts, error } = await draftQuery
    .order("created_at", { ascending: false })
    .limit(config.analysisMaxClustersPerRun);

  if (error) {
    await finishRun(runId, "failed", { error_message: error.message });
    return jsonResponse({ error: error.message }, 500);
  }
  if (!drafts?.length) {
    await finishRun(runId, "completed", { items_out: 0 });
    return jsonResponse({ ok: true, analyzed: 0 });
  }

  let analyzed = 0;
  let failed = 0;
  for (const draft of drafts) {
    const clusterId = draft.pipeline_cluster_id || draft.cluster_id;
    if (!clusterId) continue;

    const { data: cluster } = await db
      .from("story_clusters")
      .select("id, title, topic_summary, article_ids, source_count, bias_distribution, status")
      .eq("id", clusterId)
      .maybeSingle();
    if (!cluster) continue;

    const { data: articles } = await db
      .from("raw_articles")
      .select("id, source_id, title, excerpt, author, embedding, url, image_url, published_at, structured_data, article_content(content_text, content_excerpt, extracted_claims, extracted_figures, extracted_documents, extracted_quotes, extracted_entities, extracted_tone)")
      .in("id", cluster.article_ids || [])
      .order("published_at", { ascending: false });
    if (!articles?.length) continue;

    const sourceIds = [...new Set(articles.map((article) => article.source_id).filter(Boolean))];
    const { data: sources } = sourceIds.length
      ? await db.from("sources").select("id, nombre, name, bias, factuality").in("id", sourceIds)
      : { data: [] };
    const sourceMap: Record<string, any> = {};
    (sources || []).forEach((source: any) => { sourceMap[source.id] = source; });

    const enrichedArticles = articles.map((article: any) => {
      const content = Array.isArray(article.article_content) ? article.article_content[0] : article.article_content;
      return {
        ...article,
        content_text: content?.content_text || null,
        content_excerpt: content?.content_excerpt || null,
        structured_data: {
          ...(article.structured_data || {}),
          claims: content?.extracted_claims || [],
          figures: content?.extracted_figures || [],
          documents: content?.extracted_documents || [],
          quotes: content?.extracted_quotes || [],
          entities: content?.extracted_entities || [],
          tone: content?.extracted_tone || null,
        },
      };
    });

    let analysis: any = null;
    try {
      analysis = await analyzeCluster(cluster, enrichedArticles, sourceMap);
    } catch (err) {
      await db.from("stories").update({
        review_status: "analysis_failed",
        editorial_validation: { ready: false, missing: ["valid_ai_json"], error: String(err).slice(0, 500), checked_at: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      }).eq("id", draft.id);
      failed++;
      continue;
    }
    if (!analysis) continue;

    const consensusNarrative = analysis.consenso_narrativo || [
      analysis.perspectivas_info?.izquierda || "Sin cobertura",
      analysis.perspectivas_info?.centro || "Sin cobertura",
      analysis.perspectivas_info?.derecha || "Sin cobertura",
    ].join(" | ");

    const nextStory = {
      ...draft,
      ...analysis,
      consensus_narrative: consensusNarrative,
      consenso_narrativo: consensusNarrative,
      coverage_left: draft.coverage_left,
      coverage_center: draft.coverage_center,
      coverage_right: draft.coverage_right,
    };
    const validation = validateEditorialStory(nextStory);
    if (body.dry_run) {
      analyzed++;
      continue;
    }

    await db.from("stories").update({
      title: analysis.title || draft.title,
      summary: analysis.summary || draft.summary,
      full_content: analysis.full_content || null,
      analytical_snippet: analysis.analytical_snippet || analysis.summary || draft.summary,
      desglose: analysis.desglose || [],
      contexto: analysis.contexto || null,
      consensus_narrative: consensusNarrative,
      consenso_narrativo: consensusNarrative,
      blind_spot: analysis.blind_spot || null,
      factuality: String(analysis.factuality || "ALTA").toUpperCase(),
      consensus: analysis.consensus || "MEDIO",
      impact: analysis.impact || "ALTO",
      cifras_clave: analysis.cifras_clave || [],
      verificacion_info: analysis.verificacion_info || null,
      origen_info: analysis.origen_info || [],
      documentos_info: analysis.documentos_info || [],
      protagonistas_info: analysis.protagonistas_info || { beneficiados: "", afectados: "" },
      preguntas_info: analysis.preguntas_info || [],
      impacto_social: analysis.impacto_social || [],
      impacto_sistemico: analysis.impacto_sistemico || [],
      perspectivas_info: typeof analysis.perspectivas_info === "string" ? analysis.perspectivas_info : JSON.stringify(analysis.perspectivas_info || {}),
      perspectives: analysis.perspectivas_info || {},
      articles: analysis.articles?.length ? analysis.articles : draft.articles,
      review_status: validation.ready ? "ready_for_review" : "analysis_failed",
      editorial_validation: validation,
      pipeline_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", draft.id);

    await db.from("story_clusters").update({
      analysis,
      updated_at: new Date().toISOString(),
    }).eq("id", clusterId);

    analyzed++;
  }

  await finishRun(runId, "completed", {
    items_in: drafts.length,
    items_out: analyzed,
    metadata: { failed, dryRun: Boolean(body.dry_run) },
  });
  return jsonResponse({ ok: true, analyzed, failed });
});
