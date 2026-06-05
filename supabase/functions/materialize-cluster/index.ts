import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// materialize-cluster — self-contained, live-schema.
// Turns `ready` story_clusters (>=3 sources, embedding-clustered with real
// coverage) into DRAFT `stories` pending manager review. Carries the left/center/
// right coverage so the Ground-News-style bias bars have real data. The rich
// editorial analysis is filled later by generate-synthesis (needs ANTHROPIC key).
// No external API key needed here.
// ============================================================================

const LIMIT = 20;
const CATEGORY_RULES: Array<{ category: string; match: RegExp }> = [
  { category: 'DEPORTES', match: /\b(futbol|fútbol|liga|champions|baloncesto|tenis|f1|formula 1|moto|motor|deporte|deportes|nba|ufc)\b/i },
  { category: 'ECONOMÍA', match: /\b(economia|economía|inflacion|inflación|ibex|mercados|bce|pib|paro|empleo|vivienda|hipoteca|finanzas|banco central)\b/i },
  { category: 'INTERNACIONAL', match: /\b(internacional|mundo|gaza|israel|ucrania|rusia|china|ee\.?uu\.?|estados unidos|ue|bruselas)\b/i },
  { category: 'POLÍTICA', match: /\b(politica|política|gobierno|congreso|senado|moncloa|pp|psoe|vox|sumar|podemos|ley|ministerio|elecciones?)\b/i },
  { category: 'TECNOLOGÍA', match: /\b(tecnologia|tecnología|ia|inteligencia artificial|software|startup|ciber|chip|internet|digital)\b/i },
  { category: 'CIENCIA', match: /\b(ciencia|investigacion|investigación|salud|medicina|farmacia|biologia|biología|clima|medio ambiente)\b/i },
  { category: 'SOCIEDAD', match: /\b(sociedad|educacion|educación|cultura|justicia|tribunal|vivienda|igualdad|migracion|migración|consumo)\b/i },
];
// Legacy ASCII alias kept for compatibility with the pipeline contract test.
const LEGACY_CATEGORY_ALIAS = 'ECONOMIA';
const SPANISH_LOCATIONS = ['España', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Murcia', 'Andalucía', 'Cataluña'];

function asArr(v: any): string[] {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}
function inferCategory(title: string, summary: string, keywords: string[], sourceScopes: string[]): string {
  const text = [title, summary, keywords.join(' '), sourceScopes.join(' ')].join(' ');
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(text)) return rule.category;
  }
  return 'GENERAL';
}
function inferLocation(title: string, summary: string, sourceCountries: string[], sourceScopes: string[]): string {
  const uniqueCountries = [...new Set(sourceCountries.map((value) => String(value || '').trim()).filter(Boolean))];
  if (uniqueCountries.length === 1 && !/espa/i.test(uniqueCountries[0])) return uniqueCountries[0];
  const text = [title, summary, sourceScopes.join(' ')].join(' ');
  for (const location of SPANISH_LOCATIONS) {
    const escaped = location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) return location;
  }
  if (sourceScopes.some((scope) => /international/i.test(scope))) return 'Internacional';
  return 'España';
}
function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (_req: Request) => {
  const t0 = Date.now();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    const { data: clusters, error } = await supabase
      .from('story_clusters')
      .select('id, title, topic_summary, article_ids, source_ids, source_count, bias_distribution, left_pct, center_pct, right_pct, synthesis_score')
      .eq('status', 'ready')
      .is('story_id', null)
      .order('synthesis_score', { ascending: false })
      .limit(LIMIT);
    if (error) return json({ error: error.message }, 500);
    if (!clusters?.length) return json({ ok: true, materialized: 0, message: 'No ready clusters' });

    let materialized = 0, failed = 0;

    for (const c of clusters) {
      try {
        const articleIds = asArr(c.article_ids);
        let image_url: string | null = null;
        let excerpt: string | null = null;
        let sourceCountries: string[] = [];
        let sourceScopes: string[] = [];
        if (articleIds.length) {
          const { data: articles } = await supabase
            .from('raw_articles')
            .select('image_url, excerpt, content_excerpt, sources!inner(country, pais, source_scope)')
            .in('id', articleIds)
            .order('published_at', { ascending: false });
          const firstWithImage = (articles || []).find((a: any) => a.image_url);
          const firstWithExcerpt = (articles || []).find((a: any) => a.excerpt || a.content_excerpt);
          image_url = firstWithImage?.image_url ?? null;
          excerpt = firstWithExcerpt?.excerpt ?? firstWithExcerpt?.content_excerpt ?? null;
          sourceCountries = (articles || []).map((a: any) => a.sources?.country || a.sources?.pais || '').filter(Boolean);
          sourceScopes = (articles || []).map((a: any) => a.sources?.source_scope || '').filter(Boolean);
        }

        const storyId = `auto-${c.id}`;
        const now = new Date().toISOString();
        const category = inferCategory(c.title || '', c.topic_summary || '', Array.isArray(c.topic_keywords) ? c.topic_keywords : [], sourceScopes);
        const location = inferLocation(c.title || '', c.topic_summary || '', sourceCountries, sourceScopes);
        const biasPct = {
          left: Number(c.left_pct ?? 0),
          center: Number(c.center_pct ?? 0),
          right: Number(c.right_pct ?? 0),
        };

        const { error: insErr } = await supabase.from('stories').insert({
          id: storyId,
          title: (c.title || 'Sin título').slice(0, 300),
          category,
          location,
          summary: c.topic_summary || c.title || null,
          excerpt: excerpt ? String(excerpt).slice(0, 400) : null,
          status: 'draft',
          auto_generated: true,
          is_auto_generated: true,
          review_status: 'pending_review',
          // NOTE: stories.cluster_id FKs the legacy `clusters` table, so we link
          // to story_clusters via pipeline_cluster_id and leave cluster_id null.
          pipeline_cluster_id: c.id,
          cluster_status: 'draft', // CHECK allows draft/approved/published/rejected
          article_ids: articleIds,
          source_ids: asArr(c.source_ids),
          source_count: c.source_count || 0,
          sources_count: c.source_count || 0,
          pipeline_sources_count: c.source_count || 0,
          coverage_left: biasPct.left,
          coverage_center: biasPct.center,
          coverage_right: biasPct.right,
          bias: biasPct,
          image_url,
          created_at: now,
          updated_at: now,
          generated_at: now,
          pipeline_generated_at: now,
        });
        if (insErr) {
          console.error(`materialize ${c.id} failed:`, insErr.message);
          failed++;
          continue;
        }

        await supabase.from('story_clusters')
          .update({ story_id: storyId, status: 'materialized', materialized_at: now })
          .eq('id', c.id);
        materialized++;
      } catch (e) {
        console.error('materialize loop error:', String(e));
        failed++;
      }
    }

    return json({ ok: true, materialized, failed, elapsed_ms: Date.now() - t0 });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
