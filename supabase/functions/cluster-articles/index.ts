import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// cluster-articles — SOPHISTICATED, self-contained, live-schema.
// Incremental online clustering with an embedding-proximity floor + title-token
// guard to block keyword-only false merges (audit #7). Computes real left/center/
// right coverage from source bias, writes to `story_clusters`, and marks the
// member rows clustered. Pure vector math — needs NO external API key.
// ============================================================================

const EMBED_MATCH_FLOOR = 0.60; // min raw cosine to even consider joining a cluster
const SIM_HIGH = 0.78;          // strong same-event (auto-merge)
const SIM_LOW = 0.62;           // gray-band floor
const TOKEN_GUARD = 0.08;       // min title-token Jaccard required in the gray band
const MIN_CLUSTER = 2;
const MIN_SOURCES_READY = 3;
const EXISTING_WINDOW_HOURS = 48;
const LIMIT = 200;

const STOP = new Set('para con los las una unos unas del que por como mas pero sus este esta estos estas son fue han hay ante sobre entre desde hasta cuando donde quien cual cuyo segun tras durante mediante contra hacia sino aunque porque tambien muy ese esa esos esas the and for with from this that have has are was were will'.split(' '));

function norm(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function tokens(s: string): Set<string> {
  return new Set(norm(s).replace(/[^a-z0-9ñ ]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)));
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
function fingerprintTokens(value: string | null | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(String(value)
    .split(/[|:\-]/g)
    .map((part) => norm(part).replace(/[^a-z0-9ñ ]/g, ' ').trim())
    .filter((part) => part.length > 3));
}
function fingerprintOverlap(a: string | null | undefined, b: string | null | undefined): number {
  const left = fingerprintTokens(a);
  const right = fingerprintTokens(b);
  if (!left.size || !right.size) return 0;
  let inter = 0;
  for (const token of left) if (right.has(token)) inter++;
  return inter / Math.max(left.size, right.size);
}
function temporalAffinity(articleDate: string | null | undefined, clusterWindowStart: string | null | undefined, clusterWindowEnd: string | null | undefined): number {
  const articleTs = articleDate ? new Date(articleDate).getTime() : NaN;
  if (Number.isNaN(articleTs)) return 0.25;
  const windowStartTs = clusterWindowStart ? new Date(clusterWindowStart).getTime() : NaN;
  const windowEndTs = clusterWindowEnd ? new Date(clusterWindowEnd).getTime() : NaN;
  const anchorTs = !Number.isNaN(windowEndTs) ? windowEndTs : (!Number.isNaN(windowStartTs) ? windowStartTs : NaN);
  if (Number.isNaN(anchorTs)) return 0.4;
  const hours = Math.abs(articleTs - anchorTs) / 3600000;
  if (hours <= 6) return 1;
  if (hours <= 12) return 0.9;
  if (hours <= 24) return 0.8;
  if (hours <= 48) return 0.6;
  if (hours <= 72) return 0.35;
  return 0.15;
}
function eventAffinity(article: any, cluster: any, titleTokens: Set<string>): number {
  const clusterTokens = tokens(`${cluster.title || ''} ${(Array.isArray(cluster.topic_keywords) ? cluster.topic_keywords.join(' ') : '')}`);
  const titleScore = jaccard(titleTokens, clusterTokens);
  const fingerprintScore = fingerprintOverlap(article.entity_fingerprint, cluster.entity_fingerprint);
  const signatureScore = article.event_signature && cluster.event_signature && article.event_signature === cluster.event_signature ? 1 : 0;
  const temporalScore = temporalAffinity(article.published_at, cluster.window_start, cluster.window_end);
  return Number((signatureScore * 0.45 + fingerprintScore * 0.3 + titleScore * 0.15 + temporalScore * 0.1).toFixed(3));
}
function sameEditorialEvent(article: any, cluster: any, titleTokens: Set<string>, cosineScore: number): boolean {
  const affinity = eventAffinity(article, cluster, titleTokens);
  const tokenScore = jaccard(titleTokens, tokens(`${cluster.title || ''} ${(Array.isArray(cluster.topic_keywords) ? cluster.topic_keywords.join(' ') : '')}`));
  const fingerprintScore = fingerprintOverlap(article.entity_fingerprint, cluster.entity_fingerprint);
  return Boolean(
    article.event_signature && cluster.event_signature && article.event_signature === cluster.event_signature
    || cosineScore >= SIM_HIGH
    || (cosineScore >= SIM_LOW && tokenScore >= TOKEN_GUARD)
    || (affinity >= 0.72 && fingerprintScore >= 0.35)
  );
}
function parseVec(v: any): number[] | null {
  if (!v) return null;
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v); } catch { return null; }
}
function cosine(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let d = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; ma += a[i] * a[i]; mb += b[i] * b[i]; }
  const m = Math.sqrt(ma) * Math.sqrt(mb);
  return m ? d / m : 0;
}
function centroidOf(vecs: number[][]): number[] | null {
  if (!vecs.length) return null;
  const n = vecs[0].length;
  const c = new Array(n).fill(0);
  for (const v of vecs) for (let i = 0; i < n; i++) c[i] += v[i];
  for (let i = 0; i < n; i++) c[i] /= vecs.length;
  return c;
}
function toVecLit(arr: number[]): string {
  return '[' + arr.map((x) => Number(x).toFixed(6)).join(',') + ']';
}
function biasBucket(label: string): 'left' | 'center' | 'right' {
  const l = (label || '').toUpperCase();
  if (l === 'LEFT' || l === 'CENTER-LEFT' || l === 'IZQUIERDA' || l === 'CENTRO-IZQUIERDA') return 'left';
  if (l === 'RIGHT' || l === 'CENTER-RIGHT' || l === 'DERECHA' || l === 'CENTRO-DERECHA') return 'right';
  return 'center';
}
function asArr(v: any): string[] {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}
function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (_req: Request) => {
  const t0 = Date.now();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    // 1. Pending embedded, not-yet-clustered articles (+ source bias via join)
    const { data: pending, error: fErr } = await supabase
      .from('raw_articles')
      .select('id, title, titulo, excerpt, published_at, embedding, source_id, event_signature, entity_fingerprint, sources!inner(bias_label)')
      .eq('status', 'embedded')
      .eq('clustered', false)
      .not('embedding', 'is', null)
      .order('published_at', { ascending: false })
      .limit(LIMIT);
    if (fErr) return json({ error: fErr.message }, 500);
    if (!pending?.length) return json({ ok: true, message: 'No embedded articles to cluster', clustered: 0 });

    // 2. Recent existing clusters (for incremental matching)
    const since = new Date(Date.now() - EXISTING_WINDOW_HOURS * 3600 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('story_clusters')
      .select('id, title, topic_keywords, article_ids, centroid_embedding, status, story_id, last_seen_at, window_start, window_end, event_signature, entity_fingerprint')
      .in('status', ['forming', 'ready', 'materialized'])
      .gte('last_seen_at', since)
      .not('centroid_embedding', 'is', null);

    const existingPrepared = (existing || []).map((c: any) => ({
      ...c,
      vec: parseVec(c.centroid_embedding),
      tok: tokens(`${c.title || ''} ${(Array.isArray(c.topic_keywords) ? c.topic_keywords.join(' ') : '')}`),
    })).filter((c: any) => c.vec);

    const toRecompute = new Map<string, { storyId: string | null; addIds: string[] }>();
    const unassigned: any[] = [];

    // 3. Match each article into an existing cluster, or defer
    for (const art of pending) {
      const vec = parseVec(art.embedding);
      if (!vec) continue;
      const artTok = tokens(art.title || art.titulo || '');
      let best: any = null;
      let bestCos = 0;
      for (const c of existingPrepared) {
        const cos = cosine(vec, c.vec);
        if (cos < EMBED_MATCH_FLOOR) continue;
        if (!sameEditorialEvent(art, c, artTok, cos)) continue;
        const affinity = eventAffinity(art, c, artTok);
        if (affinity > bestCos) { bestCos = affinity; best = c; }
      }
      if (best) {
        const cur = toRecompute.get(best.id) || { storyId: best.story_id, addIds: [] };
        cur.addIds.push(art.id);
        toRecompute.set(best.id, cur);
      } else {
        unassigned.push({ id: art.id, vec, tok: artTok });
      }
    }

    // 4. Greedy-cluster the leftovers among themselves
    const newGroups: string[][] = [];
    const used = new Set<string>();
    for (let i = 0; i < unassigned.length; i++) {
      const a = unassigned[i];
      if (used.has(a.id)) continue;
      const group = [a.id];
      used.add(a.id);
      for (let j = i + 1; j < unassigned.length; j++) {
        const b = unassigned[j];
        if (used.has(b.id)) continue;
        const cos = cosine(a.vec, b.vec);
        if (cos < EMBED_MATCH_FLOOR) continue;
        const tj = jaccard(a.tok, b.tok);
        if (cos >= SIM_HIGH || (cos >= SIM_LOW && tj >= TOKEN_GUARD)) { group.push(b.id); used.add(b.id); }
      }
      if (group.length >= MIN_CLUSTER) newGroups.push(group);
    }

    let updated = 0, created = 0;

    // 5a. Recompute existing matched clusters (append new members)
    for (const [clusterId, info] of toRecompute) {
      const { data: row } = await supabase.from('story_clusters').select('article_ids').eq('id', clusterId).maybeSingle();
      const allIds = Array.from(new Set([...asArr(row?.article_ids), ...info.addIds]));
      await recompute(supabase, clusterId, allIds, info.storyId);
      updated++;
    }
    // 5b. Create new clusters
    for (const group of newGroups) {
      await recompute(supabase, crypto.randomUUID(), group, null);
      created++;
    }

    return json({
      ok: true, processed: pending.length, clustersUpdated: updated, clustersCreated: created,
      unassignedSingles: unassigned.length - newGroups.reduce((s, g) => s + g.length, 0),
      elapsed_ms: Date.now() - t0,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

// Reload all members, recompute centroid/coverage/scores, upsert cluster, mark rows.
async function recompute(
  supabase: any, clusterId: string, articleIds: string[], storyId: string | null,
) {
  const { data: arts } = await supabase
    .from('raw_articles')
    .select('id, title, titulo, published_at, embedding, source_id, sources!inner(bias_label)')
    .in('id', articleIds);
  if (!arts?.length) return;

  const vecs: number[][] = [];
  const sourceIds = new Set<string>();
  const cov = { left: 0, center: 0, right: 0 };
  const dates: number[] = [];
  let leadTitle = '';
  let leadLen = 0;
  const kw = new Map<string, number>();

  for (const a of arts) {
    const v = parseVec(a.embedding);
    if (v) vecs.push(v);
    if (a.source_id) sourceIds.add(a.source_id);
    cov[biasBucket((a.sources as any)?.bias_label)]++;
    if (a.published_at) dates.push(new Date(a.published_at).getTime());
    const t = a.title || a.titulo || '';
    if (t.length > leadLen) { leadLen = t.length; leadTitle = t; }
    for (const tk of tokens(t)) kw.set(tk, (kw.get(tk) || 0) + 1);
  }

  const centroid = centroidOf(vecs);
  const total = cov.left + cov.center + cov.right || 1;
  const pct = (n: number) => Math.round((n / total) * 1000) / 10;
  const srcCount = sourceIds.size;
  const artCount = arts.length;
  const newest = dates.length ? Math.max(...dates) : Date.now();
  const oldest = dates.length ? Math.min(...dates) : Date.now();
  const ageHours = Math.max(0, (Date.now() - newest) / 3600000);

  const confidence = Math.min(1, (artCount / MIN_CLUSTER) * 0.45 + (srcCount / MIN_SOURCES_READY) * 0.55);
  const diversity = Math.min(1, srcCount / (MIN_SOURCES_READY + 2));
  const freshness = Math.max(0, 1 - ageHours / 72);
  const synthesis = Math.min(1, confidence * 0.5 + diversity * 0.3 + freshness * 0.2);

  const topKeywords = [...kw.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map((e) => e[0]);
  const status = storyId ? 'materialized' : (srcCount >= MIN_SOURCES_READY ? 'ready' : 'forming');
  const now = new Date().toISOString();

  const payload: any = {
    id: clusterId,
    title: leadTitle.slice(0, 300),
    topic_summary: leadTitle.slice(0, 300),
    topic_keywords: topKeywords,
    article_ids: articleIds,
    article_count: artCount,
    source_count: srcCount,
    source_ids: [...sourceIds],
    bias_distribution: cov,
    coverage_left: cov.left,
    coverage_center: cov.center,
    coverage_right: cov.right,
    left_pct: pct(cov.left),
    center_pct: pct(cov.center),
    right_pct: pct(cov.right),
    confidence_score: Number(confidence.toFixed(3)),
    diversity_score: Number(diversity.toFixed(3)),
    freshness_score: Number(freshness.toFixed(3)),
    synthesis_score: Number(synthesis.toFixed(3)),
    status,
    refresh_needed: Boolean(storyId),
    last_seen_at: now,
    updated_at: now,
    window_start: new Date(oldest).toISOString(),
    window_end: new Date(newest).toISOString(),
  };
  if (centroid) payload.centroid_embedding = toVecLit(centroid);

  await supabase.from('story_clusters').upsert(payload, { onConflict: 'id' });
  await supabase.from('raw_articles')
    .update({ clustered: true, cluster_id: clusterId, cluster_uuid: clusterId, status: 'clustered' })
    .in('id', articleIds);

  if (storyId) {
    await supabase.from('stories')
      .update({ cluster_status: 'refresh_pending', last_cluster_refresh_at: now })
      .eq('id', storyId);
  }
}
