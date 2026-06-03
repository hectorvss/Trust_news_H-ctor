import { db } from "../_shared/supabase.ts";
import { config, extractReadableArticle, truncate } from "../_shared/pipeline.ts";
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
      .select("id, source_id, title, excerpt, url, extraction_status, ingested_at")
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
          permission_basis: "source_full_content_disabled",
          updated_at: new Date().toISOString(),
        });
        await db.from("raw_articles").update({
          extraction_status: "skipped_policy",
          pipeline_status: "extracted",
          extracted_at: new Date().toISOString(),
        }).eq("id", article.id);
        skipped++;
        continue;
      }

      try {
        const extractedArticle = await extractReadableArticle(article.url, config.userAgent);
        const structured = extractedArticle.structured || {};
        await db.from("article_content").upsert({
          article_id: article.id,
          extraction_status: extractedArticle.contentText ? "completed" : "empty",
          extraction_method: "readable_html",
          content_text: extractedArticle.contentText || null,
          content_excerpt: extractedArticle.contentExcerpt || article.excerpt || null,
          word_count: extractedArticle.wordCount,
          char_count: extractedArticle.charCount,
          extracted_entities: structured.entities || [],
          extracted_claims: structured.claims || [],
          extracted_figures: structured.figures || [],
          extracted_quotes: structured.quotes || [],
          extracted_documents: structured.documents || [],
          permission_basis: "source_full_content_enabled",
          robots_checked: false,
          updated_at: new Date().toISOString(),
        });
        await db.from("raw_articles").update({
          extraction_status: extractedArticle.contentText ? "completed" : "empty",
          pipeline_status: "extracted",
          extracted_at: new Date().toISOString(),
          structured_data: {
            subtitle: extractedArticle.subtitle,
            section: extractedArticle.section,
            ...structured,
          },
        }).eq("id", article.id);
        extracted++;
      } catch (err) {
        await db.from("article_content").upsert({
          article_id: article.id,
          extraction_status: "failed",
          extraction_method: "readable_html",
          error_message: String(err).slice(0, 500),
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
