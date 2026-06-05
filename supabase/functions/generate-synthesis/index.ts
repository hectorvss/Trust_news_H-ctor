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
    .select("id, title, summary, category, pipeline_cluster_id, cluster_id, source_count, sources_count, status, created_at, consensus_narrative, consenso_narrativo, articles, coverage_left, coverage_center, coverage_right")
    .eq("status", "draft")
    .eq("is_auto_generated", true)
    .in("review_status", ["pending_review", "analysis_failed"]);
  if (body.story_id) draftQuery = draftQuery.eq("id", body.story_id);
  else draftQuery = draftQuery.lte("created_at", cutoff);
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
      .select("id, source_id, title, excerpt, author, embedding, url, image_url, published_at, structured_data, event_signature, entity_fingerprint, article_content(content_text, content_excerpt, resolved_title, subtitle, lead, canonical_url, byline, section, published_at, modified_at, tags, images, outbound_links, extracted_claims, extracted_figures, extracted_documents, extracted_quotes, extracted_entities, extracted_tone, extraction_quality_score, parser_used, content_source, paywall_detected, blocked_reason)")
      .in("id", cluster.article_ids || [])
      .order("published_at", { ascending: false });
    if (!articles?.length) continue;

    const sourceIds = [...new Set(articles.map((article) => article.source_id).filter(Boolean))];
    const { data: sources } = sourceIds.length
      ? await db.from("sources").select("id, nombre, name, bias, bias_label, bias_score, political_lean, factuality, ownership, country, pais, language, source_scope, media_type, fact_check_score, bias_confidence").in("id", sourceIds)
      : { data: [] };
    const sourceMap: Record<string, any> = {};
    (sources || []).forEach((source: any) => { sourceMap[source.id] = source; });

    const enrichedArticles = articles.map((article: any) => {
      const content = Array.isArray(article.article_content) ? article.article_content[0] : article.article_content;
      return {
        ...article,
        title: content?.resolved_title || article.title,
        author: content?.byline || article.author,
        published_at: content?.published_at || article.published_at,
        url: content?.canonical_url || article.url,
        content_text: content?.content_text || null,
        content_excerpt: content?.content_excerpt || null,
        structured_data: {
          ...(article.structured_data || {}),
          subtitle: content?.subtitle || article.structured_data?.subtitle || null,
          lead: content?.lead || article.structured_data?.lead || null,
          section: content?.section || article.structured_data?.section || null,
          tags: content?.tags || [],
          images: content?.images || [],
          outbound_links: content?.outbound_links || [],
          claims: content?.extracted_claims || [],
          figures: content?.extracted_figures || [],
          documents: content?.extracted_documents || [],
          quotes: content?.extracted_quotes || [],
          entities: content?.extracted_entities || [],
          tone: content?.extracted_tone || null,
          extraction_quality_score: content?.extraction_quality_score || 0,
          parser_used: content?.parser_used || null,
          content_source: content?.content_source || null,
          paywall_detected: Boolean(content?.paywall_detected),
          blocked_reason: content?.blocked_reason || null,
          event_signature: article.event_signature || null,
          entity_fingerprint: article.entity_fingerprint || null,
        },
      };
    });

    let analysisResult: any = null;
    try {
      analysisResult = await analyzeCluster(cluster, enrichedArticles, sourceMap);
    } catch (err) {
      await db.from("stories").update({
        review_status: "analysis_failed",
        editorial_validation: {
          ready: false,
          missing: ["valid_ai_json"],
          errors: [String(err).slice(0, 500)],
          checked_at: new Date().toISOString(),
          segment_trace: null,
          segment_summary: null,
        },
        generation_metadata: {
          llm: {
            status: "exception",
            error: String(err).slice(0, 500),
            checked_at: new Date().toISOString(),
          },
          segment_trace: null,
          segment_summary: null,
        },
        updated_at: new Date().toISOString(),
      }).eq("id", draft.id);
      failed++;
      continue;
    }
    if (!analysisResult) continue;

    const analysis = analysisResult.payload || analysisResult;
    const llmValidation = analysisResult.validation || { ready: true, errors: [], warnings: [], missing: [] };
    const llmTrace = analysisResult.trace || {};
    const evidencePack = analysisResult.evidencePack || null;
    const segmentTrace = llmTrace.segment_trace || null;
    const segmentSummary = llmTrace.segment_summary || segmentTrace?.summary || null;

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
    const combinedValidation = {
      ready: Boolean(validation.ready && llmValidation.ready),
      missing: [...new Set([...(validation.missing || []), ...(llmValidation.missing || [])])],
      errors: [...(llmValidation.errors || [])],
      warnings: [...(llmValidation.warnings || [])],
      checked_at: new Date().toISOString(),
      evidence_pack_hash: llmTrace.evidence_pack_hash || evidencePack?.evidence_pack_hash || null,
      segment_trace: segmentTrace,
      segment_summary: segmentSummary,
    };
    if (body.dry_run) {
      analyzed++;
      continue;
    }

    if (!combinedValidation.ready) {
      await db.from("stories").update({
        review_status: "analysis_failed",
        editorial_validation: combinedValidation,
        generation_metadata: {
          llm: {
            status: "schema_failed",
            model: llmTrace.model || config.anthropicModel,
            prompt_version: llmTrace.prompt_version,
            token_usage: llmTrace.token_usage,
            attempts: llmTrace.llm_attempts,
            repair_used: Boolean(llmTrace.repair_used),
            validation_errors: combinedValidation.errors,
            validation_warnings: combinedValidation.warnings,
          },
          evidence: llmTrace.evidence || null,
          segment_trace: segmentTrace,
          segment_summary: segmentSummary,
        },
        updated_at: new Date().toISOString(),
      }).eq("id", draft.id);
      await db.from("story_clusters").update({
        analysis: {
          evidence_pack_summary: evidencePack ? {
            hash: evidencePack.evidence_pack_hash,
            quality: evidencePack.evidence_quality,
            used_article_count: evidencePack.articles?.length || 0,
            omitted_article_count: evidencePack.omitted_articles?.length || 0,
          } : null,
          llm_validation: combinedValidation,
          claims_matrix: analysis.claims_matrix || [],
          source_trace: analysis.source_trace || [],
          segment_trace: segmentTrace,
          segment_summary: segmentSummary,
        },
        updated_at: new Date().toISOString(),
      }).eq("id", clusterId);
      failed++;
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
      category: analysis.category ? String(analysis.category).toUpperCase().trim() : (draft.category || "GENERAL"),
      cifras_clave: analysis.cifras_clave || [],
      verificacion_info: analysis.verificacion_info || null,
      origen_info: analysis.origen_info || [],
      documentos_info: analysis.documentos_info || [],
      protagonistas_info: analysis.protagonistas_info || { beneficiados: "", afectados: "" },
      preguntas_info: analysis.preguntas_info || [],
      impacto_social: analysis.impacto_social || [],
      impacto_sistemico: analysis.impacto_sistemico || [],
      perspectivas_info: ((p) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object") {
          return [
            p.izquierda ? `Izquierda: ${p.izquierda}` : "",
            p.centro ? `Centro: ${p.centro}` : "",
            p.derecha ? `Derecha: ${p.derecha}` : "",
          ].filter(Boolean).join("\n\n");
        }
        return null;
      })(analysis.perspectivas_info),
      perspectives: analysis.perspectivas_info || {},
      articles: analysis.articles?.length ? analysis.articles : draft.articles,
      review_status: "ready_for_review",
      editorial_validation: combinedValidation,
      generation_metadata: {
        llm: {
          status: "completed",
          model: llmTrace.model || config.anthropicModel,
          prompt_version: llmTrace.prompt_version,
          token_usage: llmTrace.token_usage,
          attempts: llmTrace.llm_attempts,
          repair_used: Boolean(llmTrace.repair_used),
          validation_errors: combinedValidation.errors,
          validation_warnings: combinedValidation.warnings,
          confidence: analysis.llm_confidence || null,
        },
        evidence: llmTrace.evidence || null,
        claims_matrix: analysis.claims_matrix || [],
        missing_evidence: analysis.missing_evidence || [],
        evidence_quality: analysis.evidence_quality || null,
        source_trace: analysis.source_trace || [],
        segment_trace: segmentTrace,
        segment_summary: segmentSummary,
      },
      pipeline_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", draft.id);

    await db.from("story_clusters").update({
      analysis: {
        story_draft: analysis,
        evidence_pack_summary: evidencePack ? {
          hash: evidencePack.evidence_pack_hash,
          quality: evidencePack.evidence_quality,
          used_articles: llmTrace.evidence?.used_articles || [],
          omitted_articles: llmTrace.evidence?.omitted_articles || [],
        } : null,
        claims_matrix: analysis.claims_matrix || [],
        source_trace: analysis.source_trace || [],
        llm_validation: combinedValidation,
        segment_trace: segmentTrace,
        segment_summary: segmentSummary,
      },
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
