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
    const vectors = vectorRows.length ? await embedBatch(vectorRows.map((entry) => entry.input as string)) : [];

    let vectorIndex = 0;
    for (const entry of prepared) {
      const row = entry.row;
      const vector = entry.input ? vectors?.[vectorIndex++] || null : null;
      if (!vector) {
        await db.from("raw_articles").update({
          embedded: true,
          pipeline_status: "embedded",
        }).eq("id", row.id);
        skipped++;
        continue;
      }
      await db.from("raw_articles").update({
        embedding: toVectorLiteral(vector),
        embedded: true,
        pipeline_status: "embedded",
      }).eq("id", row.id);
      embedded++;
    }
  }

  await finishRun(runId, "completed", {
    items_in: pending.length,
    items_out: embedded,
    metadata: { skipped, dryRun: Boolean(body.dry_run) },
  });
  return jsonResponse({ ok: true, embedded, skipped });
});
