import { db } from "../_shared/supabase.ts";
import { config, buildEmbeddingInput, toVectorLiteral } from "../_shared/pipeline.ts";
import { embedBatch } from "../_shared/llm.ts";
import { jsonResponse, handleCors, parseJson } from "../_shared/http.ts";
import { finishRun, startRun } from "../_shared/runs.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = req.method === "POST" ? await parseJson<{ dry_run?: boolean }>(req) : {};
  const runId = await startRun({ stage: "embed" });

  // No OpenAI key yet -> do not "poison" rows as embedded with a null vector.
  // Leave them pending so they get real 1536-dim embeddings the moment the key lands.
  if (!Deno.env.get("OPENAI_API_KEY")) {
    await finishRun(runId, "completed", { items_out: 0, metadata: { skipped: "no_openai_key" } });
    return jsonResponse({ ok: true, embedded: 0, skipped: "OPENAI_API_KEY not configured" });
  }

  const { data: pending, error } = await db
    .from("raw_articles")
    .select("id, title, excerpt")
    .eq("embedded", false)
    .order("published_at", { ascending: true })
    .limit(config.embedMaxPerRun);

  if (error) return jsonResponse({ error: error.message }, 500);
  if (!pending?.length) {
    await finishRun(runId, "completed", { items_out: 0 });
    return jsonResponse({ ok: true, embedded: 0 });
  }

  let embedded = 0;
  let skipped = 0;
  let failed = 0;
  for (let i = 0; i < pending.length; i += config.embedBatchSize) {
    const batch = pending.slice(i, i + config.embedBatchSize);
    const prepared = batch.map((row: any) => ({
      row,
      input: buildEmbeddingInput(row.title, row.excerpt),
    }));
    const vectorRows = prepared.filter((entry) => entry.input);
    if (body.dry_run) {
      embedded += vectorRows.length;
      skipped += prepared.length - vectorRows.length;
      continue;
    }
    let vectors: any[] = [];
    try {
      vectors = vectorRows.length
        ? (await embedBatch(vectorRows.map((entry) => entry.input as string)) || [])
        : [];
    } catch (e) {
      // Whole batch failed (e.g. OpenAI 5xx) — leave these rows pending for retry,
      // never mark them embedded with a null vector.
      console.error("embedBatch failed:", String(e).slice(0, 200));
      failed += vectorRows.length;
      continue;
    }

    let vectorIndex = 0;
    for (const entry of prepared) {
      const row = entry.row;
      if (!entry.input) {
        // Genuinely nothing to embed → mark done so it does not requeue forever.
        const { error: uerr } = await db.from("raw_articles").update({
          embedded: true,
          pipeline_status: "embedded",
        }).eq("id", row.id);
        uerr ? failed++ : skipped++;
        continue;
      }
      const vector = vectors?.[vectorIndex++] || null;
      if (!vector) {
        // Embedding missing this run → leave pending (do NOT poison as embedded).
        failed++;
        continue;
      }
      const { error: uerr } = await db.from("raw_articles").update({
        embedding: toVectorLiteral(vector),
        embedded: true,
        pipeline_status: "embedded",
      }).eq("id", row.id);
      if (uerr) {
        // Write failed (e.g. dimension mismatch) — keep pending, surface it.
        console.error("embedding write failed:", uerr.message);
        failed++;
      } else {
        embedded++;
      }
    }
  }

  await finishRun(runId, embedded === 0 && failed > 0 ? "failed" : "completed", {
    items_in: pending.length,
    items_out: embedded,
    metadata: { skipped, failed, dryRun: Boolean(body.dry_run) },
  });
  return jsonResponse({ ok: true, embedded, skipped, failed });
});
