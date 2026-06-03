import { db } from "../_shared/supabase.ts";
import {
  config,
  entityFingerprintFromSignals,
  eventSignatureFromArticle,
  extractReadableArticle,
  truncate,
} from "../_shared/pipeline.ts";
import { jsonResponse, handleCors } from "../_shared/http.ts";
import { finishRun, startRun } from "../_shared/runs.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const runId = await startRun({ stage: "extract" });

  try {
    const { data: pending, error } = await db
      .from("raw_articles")
      .select("id, source_id, title, excerpt, url, extraction_status, ingested_at, published_at")
      .in("extraction_status", ["pending", "failed"])
      .order("ingested_at", { ascending: true })
      .limit(config.extractionMaxPerRun);

    if (error) throw error;
    if (!pending?.length) {
      await finishRun(runId, "completed", { items_out: 0 });
      return jsonResponse({ ok: true, extracted: 0, skipped: 0, failed: 0 });
    }

    const sourceIds = [...new Set(pending.map((article: any) => article.source_id).filter(Boolean))];
    const { data: sources } = sourceIds.length
      ? await db.from("sources").select("id, nombre, allow_full_content").in("id", sourceIds)
      : { data: [] };
    const sourceMap: Record<string, any> = {};
    (sources || []).forEach((source: any) => { sourceMap[source.id] = source; });

    let extracted = 0;
    let skipped = 0;
    let failed = 0;

    for (const article of pending) {
      const source = article.source_id ? sourceMap[article.source_id] : null;

      if (!source?.allow_full_content) {
        await db.from("article_content").upsert({
          article_id: article.id,
          extraction_status: "skipped_policy",
          extraction_method: "excerpt_only",
          content_text: null,
          content_excerpt: truncate(article.excerpt, config.excerptMaxChars),
          extraction_quality_score: article.excerpt ? 0.15 : 0,
          parser_used: "excerpt_only",
          content_source: "rss_excerpt",
          blocked_reason: "source_full_content_disabled",
          permission_basis: "source_full_content_disabled",
          updated_at: new Date().toISOString(),
        });
        const structured = { policy: "source_full_content_disabled" };
        await db.from("raw_articles").update({
          extraction_status: "skipped_policy",
          pipeline_status: "extracted",
          extracted_at: new Date().toISOString(),
          structured_data: structured,
          entity_fingerprint: entityFingerprintFromSignals(structured, article.title || ""),
          event_signature: eventSignatureFromArticle({
            title: article.title,
            excerpt: article.excerpt,
            published_at: article.published_at,
            structured_data: structured,
          }),
        }).eq("id", article.id);
        skipped++;
        continue;
      }

      try {
        const extractedArticle = await extractReadableArticle(article.url, config.userAgent);
        const structured = extractedArticle.structured || {};
        const extractionStatus = extractedArticle.contentText
          ? "completed"
          : extractedArticle.blockedReason === "paywall_or_subscription_wall"
            ? "blocked"
            : "empty";
        const structuredData = {
          subtitle: extractedArticle.subtitle,
          lead: extractedArticle.lead,
          section: extractedArticle.section,
          byline: extractedArticle.byline,
          published_at: extractedArticle.publishedAt,
          modified_at: extractedArticle.modifiedAt,
          tags: extractedArticle.tags || [],
          images: extractedArticle.images || [],
          outbound_links: extractedArticle.outboundLinks || [],
          extraction_quality_score: extractedArticle.extractionQualityScore,
          parser_used: extractedArticle.parserUsed,
          content_source: extractedArticle.contentSource,
          paywall_detected: extractedArticle.paywallDetected,
          blocked_reason: extractedArticle.blockedReason,
          ...structured,
        };
        const entityFingerprint = entityFingerprintFromSignals(structuredData, extractedArticle.resolvedTitle || article.title || "");
        const eventSignature = eventSignatureFromArticle({
          title: extractedArticle.resolvedTitle || article.title,
          excerpt: extractedArticle.contentExcerpt || article.excerpt,
          published_at: extractedArticle.publishedAt || article.published_at,
          structured_data: structuredData,
        });

        await db.from("article_content").upsert({
          article_id: article.id,
          extraction_status: extractionStatus,
          extraction_method: "readable_html",
          resolved_title: extractedArticle.resolvedTitle || extractedArticle.title || article.title || null,
          subtitle: extractedArticle.subtitle || null,
          lead: extractedArticle.lead || null,
          canonical_url: extractedArticle.canonicalUrl || article.url,
          byline: extractedArticle.byline || null,
          section: extractedArticle.section || null,
          published_at: extractedArticle.publishedAt || article.published_at || null,
          modified_at: extractedArticle.modifiedAt || null,
          tags: extractedArticle.tags || [],
          images: extractedArticle.images || [],
          outbound_links: extractedArticle.outboundLinks || [],
          content_text: extractedArticle.contentText || null,
          content_excerpt: extractedArticle.contentExcerpt || article.excerpt || null,
          word_count: extractedArticle.wordCount,
          char_count: extractedArticle.charCount,
          extracted_entities: structured.entities || [],
          extracted_claims: structured.claims || [],
          extracted_figures: structured.figures || [],
          extracted_quotes: structured.quotes || [],
          extracted_documents: structured.documents || [],
          extraction_quality_score: extractedArticle.extractionQualityScore || 0,
          parser_used: extractedArticle.parserUsed,
          content_source: extractedArticle.contentSource,
          paywall_detected: Boolean(extractedArticle.paywallDetected),
          blocked_reason: extractedArticle.blockedReason || null,
          permission_basis: "source_full_content_enabled",
          robots_checked: false,
          updated_at: new Date().toISOString(),
        });
        await db.from("raw_articles").update({
          extraction_status: extractionStatus,
          pipeline_status: "extracted",
          extracted_at: new Date().toISOString(),
          structured_data: structuredData,
          entity_fingerprint: entityFingerprint,
          event_signature: eventSignature,
        }).eq("id", article.id);
        extracted++;
      } catch (err) {
        await db.from("article_content").upsert({
          article_id: article.id,
          extraction_status: "failed",
          extraction_method: "readable_html",
          error_message: String(err).slice(0, 500),
          parser_used: "readable_html",
          content_source: "exception",
          blocked_reason: String(err).slice(0, 500),
          updated_at: new Date().toISOString(),
        });
        await db.from("raw_articles").update({
          extraction_status: "failed",
          pipeline_status: "failed",
          failed_at: new Date().toISOString(),
          failure_reason: String(err).slice(0, 500),
        }).eq("id", article.id);
        failed++;
      }
    }

    await finishRun(runId, "completed", {
      items_in: pending.length,
      items_out: extracted + skipped,
      metadata: { extracted, skipped, failed },
    });
    return jsonResponse({ ok: true, extracted, skipped, failed });
  } catch (err) {
    await finishRun(runId, "failed", { error_message: String(err).slice(0, 500) });
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
});
