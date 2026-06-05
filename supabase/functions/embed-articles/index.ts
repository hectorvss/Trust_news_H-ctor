import { createClient } from 'jsr:@supabase/supabase-js@2';

// OpenAI text-embedding-3-small -> 1536 dims (native). Best-quality Spanish
// embeddings, ~$0.02/1M tokens. Replaces the prior gte-small (384) path which
// could not write into the vector(1536) column. If OPENAI_API_KEY is missing we
// leave rows untouched (status='raw') so they get real embeddings once the key
// lands -- never poison rows with a null/partial vector.
//
// NOTE: this is the DEPLOYED, self-contained version (no _shared imports) so it
// can be (re)deployed via the Supabase management API without bundling. It reads
// the live `status` column flow ('raw' -> 'embedded') used by the deployed
// cluster-articles, and also sets the `embedded` boolean for cross-compatibility.

const OPENAI_MODEL = Deno.env.get('OPENAI_EMBEDDING_MODEL') ?? 'text-embedding-3-small';
const BATCH = 96;            // OpenAI handles large input arrays; keep DB updates bounded
const MAX_TEXT_CHARS = 1600; // title + lead is plenty for topical similarity

async function embedBatch(inputs: string[], apiKey: string): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, input: inputs }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  return (json.data as Array<{ index: number; embedding: number[] }>)
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

Deno.serve(async (req: Request) => {
  const t0 = Date.now();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* cron sends {} */ }
  const batchSize = typeof body.batch_size === 'number' ? body.batch_size : BATCH;

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({
      ok: true, processed: 0, skipped: 'OPENAI_API_KEY not configured',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const { data: articles, error: fetchError } = await supabase
    .from('raw_articles')
    .select('id, title, titulo, excerpt, content_excerpt')
    .eq('status', 'raw')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!articles || articles.length === 0) {
    return new Response(JSON.stringify({ ok: true, message: 'No articles to embed', processed: 0 }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build inputs; skip rows with no usable text (mark them embedded-empty so they
  // don't block the queue forever).
  const prepared = articles.map((a: any) => {
    const text = [a.title ?? a.titulo ?? '', a.excerpt ?? a.content_excerpt ?? '']
      .filter(Boolean).join('. ').trim().slice(0, MAX_TEXT_CHARS);
    return { id: a.id, text };
  });
  const embeddable = prepared.filter((p) => p.text.length >= 8);
  const empties = prepared.filter((p) => p.text.length < 8);

  let withEmbedding = 0;
  let failed = 0;

  if (embeddable.length) {
    let vectors: number[][] = [];
    try {
      vectors = await embedBatch(embeddable.map((p) => p.text), apiKey);
    } catch (e) {
      // Whole batch failed (rate limit / outage): leave rows as 'raw' for retry.
      return new Response(JSON.stringify({
        ok: false, error: String(e), processed: 0, retryable: true,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    for (let i = 0; i < embeddable.length; i++) {
      const { error: uErr } = await supabase
        .from('raw_articles')
        .update({
          embedding: vectors[i],
          status: 'embedded',
          embedded: true,
          pipeline_status: 'embedded',
          processed_at: new Date().toISOString(),
        })
        .eq('id', embeddable[i].id);
      if (uErr) failed++; else withEmbedding++;
    }
  }

  // Park text-less rows so the queue advances.
  if (empties.length) {
    await supabase.from('raw_articles')
      .update({ status: 'embedded', embedded: true, pipeline_status: 'skipped_no_text' })
      .in('id', empties.map((p) => p.id));
  }

  return new Response(JSON.stringify({
    ok: true,
    requested: articles.length,
    with_embedding: withEmbedding,
    skipped_no_text: empties.length,
    failed,
    model: OPENAI_MODEL,
    elapsed_ms: Date.now() - t0,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
