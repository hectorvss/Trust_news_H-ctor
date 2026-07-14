import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Builds the FULL editorial story (every block the UI renders) from a cluster's
// articles, writing the exact snake_case columns that mapStory/StoryDetail read.
// SINGLE PROVIDER: OpenAI (gpt-4o-mini) con JSON mode.
//
// v14: la comparación de fuentes ahora es REAL — cada artículo entra al prompt
// con el nombre del medio y su sesgo del catálogo (join a sources), la IA
// genera también el titular, y el consenso nunca deja columnas vacías.
// Soporta {"story_id": "..."} para forzar re-síntesis de una story concreta.
const MIN_SOURCES = 2;
const BATCH_SIZE = 8;
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const MAX_TOKENS = 3600;

const CATEGORIES = ['POLÍTICA', 'FINANZAS', 'SOCIAL', 'TECNOLOGÍA', 'DEPORTE', 'CULTURA', 'INTERNACIONAL', 'MEDIO AMBIENTE'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const biasToBucket = (label: string | null, num: number | null): string => {
  const v = String(label || '').toUpperCase();
  if (/CENTER-LEFT|CENTRO-?IZQUIERDA/.test(v)) return 'LEFT';
  if (/CENTER-RIGHT|CENTRO-?DERECHA/.test(v)) return 'RIGHT';
  if (/LEFT|IZQUIERDA/.test(v)) return 'LEFT';
  if (/RIGHT|DERECHA/.test(v)) return 'RIGHT';
  if (v) return 'CENTER';
  if (num != null) return num <= -20 ? 'LEFT' : num >= 20 ? 'RIGHT' : 'CENTER';
  return 'CENTER';
};

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return new Response(JSON.stringify({
      message: 'Skipped: OPENAI_API_KEY not configured.',
      processed: 0,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* cron sends {} */ }
  const forceStoryId = typeof body.story_id === 'string' ? body.story_id : null;

  let query = supabase
    .from('stories')
    .select('id, title, category, coverage_left, coverage_center, coverage_right, source_count, sources_count, articles, pipeline_cluster_id, medios_analizados')
    .eq('status', 'draft')
    .eq('is_auto_generated', true);
  if (forceStoryId) {
    query = query.eq('id', forceStoryId);
  } else {
    query = query
      .or('consenso_narrativo.is.null,consenso_narrativo.eq.')
      .order('source_count', { ascending: false, nullsFirst: false })
      .limit(BATCH_SIZE);
  }
  const { data: stories, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  if (!stories || stories.length === 0) {
    return new Response(JSON.stringify({ message: 'No drafts need synthesis', processed: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  let processed = 0, errors = 0;
  const details: any[] = [];

  for (const story of stories) {
    try {
      const effSources = story.source_count || story.sources_count || 0;
      if (effSources < MIN_SOURCES) { continue; }

      // ── Cargar artículos SIEMPRE con nombre real del medio + sesgo del catálogo ──
      // El array materializado suele traer source=UUID y bias=null → lo
      // reconstruimos desde el cluster con join a sources para que la
      // comparación izquierda/centro/derecha sea real, no inventada.
      let articles: any[] = Array.isArray(story.articles) ? story.articles : [];
      const looksBroken = articles.length === 0 ||
        articles.every((a: any) => !a.source || UUID_RE.test(String(a.source)) || !a.bias);

      if (looksBroken && story.pipeline_cluster_id) {
        const { data: c } = await supabase.from('story_clusters').select('article_ids').eq('id', story.pipeline_cluster_id).maybeSingle();
        const ids: string[] = c?.article_ids || [];
        if (ids.length) {
          const { data: ra } = await supabase.from('raw_articles')
            .select('title, excerpt, content_excerpt, url, source_id, published_at').in('id', ids.slice(0, 14));
          const srcIds = [...new Set((ra || []).map((a: any) => a.source_id).filter(Boolean))];
          const { data: srcs } = srcIds.length
            ? await supabase.from('sources').select('id, nombre, name, bias_label, bias, factuality').in('id', srcIds)
            : { data: [] as any[] };
          const srcMap: Record<string, any> = {};
          for (const s of (srcs || [])) srcMap[s.id] = s;
          // 1 artículo por medio (los duplicados de agencia no aportan ángulo)
          const seen = new Set<string>();
          articles = (ra || []).flatMap((a: any) => {
            const s = a.source_id ? srcMap[a.source_id] : null;
            const name = s?.nombre || s?.name || 'Medio no identificado';
            if (seen.has(name)) return [];
            seen.add(name);
            return [{
              title: a.title,
              excerpt: a.excerpt || a.content_excerpt,
              url: a.url,
              source: name,
              bias: biasToBucket(s?.bias_label ?? null, s?.bias ?? null),
              factuality: s?.factuality || null,
              time: a.published_at,
            }];
          });
        }
      }
      if (articles.length === 0) { continue; }

      const covL = Math.round(Number(story.coverage_left) || 0);
      const covC = Math.round(Number(story.coverage_center) || 0);
      const covR = Math.round(Number(story.coverage_right) || 0);
      const sides = {
        left: articles.filter((a: any) => a.bias === 'LEFT').map((a: any) => a.source),
        center: articles.filter((a: any) => a.bias === 'CENTER').map((a: any) => a.source),
        right: articles.filter((a: any) => a.bias === 'RIGHT').map((a: any) => a.source),
      };

      const articlesText = articles.slice(0, 12).map((a: any, i: number) => {
        const body2 = String(a.excerpt || a.summary || '').slice(0, 320);
        return `[ARTÍCULO ${i} | medio: ${a.source} | sesgo: ${a.bias || 'CENTER'}]\nTitular: ${a.title || ''}${body2 ? `\nExtracto: ${body2}` : ''}`;
      }).join('\n\n');

      const prompt = `Eres el redactor jefe de Trust News España, un agregador que compara la cobertura mediática de una misma noticia. A partir EXCLUSIVAMENTE de los artículos reales de abajo, redacta una ficha de análisis completa en español.

NOTICIA (tema del cluster): "${story.title && story.title !== 'Sin título' ? story.title : (articles[0]?.title || 'ver artículos')}"
Distribución de cobertura por sesgo de las fuentes: Izquierda ${covL}% · Centro ${covC}% · Derecha ${covR}%
Medios de izquierda presentes: ${sides.left.join(', ') || 'NINGUNO'}
Medios de centro presentes: ${sides.center.join(', ') || 'NINGUNO'}
Medios de derecha presentes: ${sides.right.join(', ') || 'NINGUNO'}

ARTÍCULOS:
${articlesText}

REGLAS:
- Básate solo en los artículos. NO inventes cifras, nombres ni hechos que no aparezcan. Si no hay datos numéricos, devuelve "cifras_clave": [].
- Tono informativo, neutral y conciso. Español de España.
- "titular": titular periodístico específico y claro (60-110 caracteres), estilo prensa seria, sin clickbait. NUNCA "Sin título".
- "full_content": 4-6 párrafos desarrollados separados por \\n. Estructura: qué ha pasado → detalles y declaraciones → contexto → en qué difieren los medios → qué queda abierto.
- "consenso_izq/centro/dcha": describe el ENFOQUE de los medios de cada lado citando el NOMBRE de los medios (p.ej. "El País y elDiario subrayan..."). Si un lado no tiene medios presentes, escribe EXACTAMENTE: "Sin cobertura de medios de este espectro en esta historia." (nunca lo dejes vacío).
- "perspectivas_info": compara los enfoques SOLO de los lados con medios presentes; sobre los ausentes limítate a constatar la ausencia.
- Devuelve SOLO JSON válido, sin markdown, con EXACTAMENTE estas claves:
{
  "titular": "titular periodístico",
  "category": "una de: ${CATEGORIES.join(', ')}",
  "consensus": "ALTO|MEDIO|BAJO|POLARIZADO",
  "impact": "ALTO|MEDIO|BAJO",
  "factuality": "ALTA|MIXTA|BAJA",
  "summary": "resumen ejecutivo de 1-2 frases",
  "full_content": "cuerpo de la noticia, 4-6 párrafos separados por \\n",
  "contexto": "contexto y antecedentes, 1-2 párrafos separados por \\n",
  "perspectivas_info": "cómo difieren los enfoques de los medios presentes, 1-2 párrafos",
  "desglose": ["clave 1", "clave 2", "clave 3", "clave 4"],
  "consenso_izq": "narrativa de los medios de izquierda (o la frase de ausencia)",
  "consenso_centro": "narrativa de los medios de centro (o la frase de ausencia)",
  "consenso_dcha": "narrativa de los medios de derecha (o la frase de ausencia)",
  "analytical_snippet": "síntesis editorial de TNE, 1-2 frases",
  "blind_spot": "el ángulo importante que la mayoría ignora",
  "fact_check": "estado de verificación de las afirmaciones principales",
  "verificacion_info": "detalle de qué está confirmado y qué no",
  "impacto_social": ["efecto social 1", "efecto social 2"],
  "impacto_sistemico": ["implicación sistémica 1", "implicación sistémica 2"],
  "cifras_clave": [{"label":"concepto","value":"dato"}],
  "protagonistas": {"beneficiados":"quién gana","afectados":"quién pierde"},
  "preguntas": ["pregunta abierta 1", "pregunta abierta 2"],
  "articulos": [{"idx":0,"tipo":"REPORTAJE|OPINIÓN|ANÁLISIS|NOTICIA","tono":"p.ej. Neutral/Crítico","angulo":"el ángulo del medio","enfoque":"qué enfatiza frente a otros","resumen":"resumen de 1 frase del artículo"}]
}`;

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          max_completion_tokens: MAX_TOKENS,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error(`OpenAI ${resp.status} for ${story.id}: ${t.slice(0, 200)}`);
        errors++; continue;
      }
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      let p: any = {};
      try { p = JSON.parse(content); } catch {
        const m = content.match(/\{[\s\S]*\}/);
        if (m) { try { p = JSON.parse(m[0]); } catch { /* ignore */ } }
      }
      if (!p || !p.summary) { console.error(`Bad JSON for ${story.id}: ${content.slice(0,160)}`); errors++; continue; }

      const asArr = (v: any) => Array.isArray(v) ? v.filter((x) => x != null && String(x).trim() !== '') : [];
      const asStr = (v: any) => (typeof v === 'string' ? v.trim() : '');
      const ABSENT = 'Sin cobertura de medios de este espectro en esta historia.';
      const narrPart = (v: any) => asStr(v) || ABSENT;
      const narr = [narrPart(p.consenso_izq), narrPart(p.consenso_centro), narrPart(p.consenso_dcha)].join(' | ');
      const cifras = asArr(p.cifras_clave).map((c: any) => ({ label: asStr(c?.label), value: asStr(c?.value) })).filter((c: any) => c.label || c.value);
      const prot = (p.protagonistas && typeof p.protagonistas === 'object')
        ? { beneficiados: asStr(p.protagonistas.beneficiados), afectados: asStr(p.protagonistas.afectados) }
        : { beneficiados: '', afectados: '' };

      const perArt: Record<number, any> = {};
      for (const a of asArr(p.articulos)) { if (typeof a?.idx === 'number') perArt[a.idx] = a; }
      const mergedArticles = articles.map((a: any, i: number) => {
        const x = perArt[i] || {};
        return {
          ...a,
          type: asStr(x.tipo) || a.type || 'NOTICIA',
          tone: asStr(x.tono) || a.tone || 'Informativo',
          angle: asStr(x.angulo) || a.angle || '',
          diff: asStr(x.enfoque) || a.diff || '',
          summary: asStr(x.resumen) || a.summary || a.excerpt || '',
          whyOpened: a.whyOpened || asStr(x.angulo) || 'Análisis comparativo',
        };
      });

      const category = CATEGORIES.includes((p.category || '').toUpperCase()) ? p.category.toUpperCase() : (story.category || 'GENERAL');
      const medios = [...new Set(mergedArticles.map((a: any) => a.source).filter((s: any) => s && !UUID_RE.test(String(s))))];

      const update: Record<string, unknown> = {
        category,
        consensus: ['ALTO', 'MEDIO', 'BAJO', 'POLARIZADO'].includes((p.consensus || '').toUpperCase()) ? p.consensus.toUpperCase() : 'MEDIO',
        impact: ['ALTO', 'MEDIO', 'BAJO'].includes((p.impact || '').toUpperCase()) ? p.impact.toUpperCase() : 'MEDIO',
        factuality: ['ALTA', 'MIXTA', 'BAJA'].includes((p.factuality || '').toUpperCase()) ? p.factuality.toUpperCase() : 'ALTA',
        summary: asStr(p.summary),
        excerpt: asStr(p.summary).slice(0, 300),
        full_content: asStr(p.full_content),
        contexto: asStr(p.contexto),
        perspectivas_info: asStr(p.perspectivas_info),
        analytical_snippet: asStr(p.analytical_snippet),
        desglose: asArr(p.desglose).map(asStr),
        consenso_narrativo: narr,
        consensus_narrative: narr,
        blind_spot: asStr(p.blind_spot),
        fact_check: asStr(p.fact_check),
        verificacion_info: asStr(p.verificacion_info),
        impacto_social: asArr(p.impacto_social).map(asStr),
        impacto_sistemico: asArr(p.impacto_sistemico).map(asStr),
        cifras_clave: cifras,
        key_figures: cifras.map((c: any) => `${c.label}: ${c.value}`),
        disputed_claims: asArr(p.preguntas).map(asStr),
        protagonistas_info: prot,
        preguntas_info: asArr(p.preguntas).map(asStr),
        origen_info: medios,
        medios_analizados: medios,
        articles: mergedArticles,
        updated_at: new Date().toISOString(),
      };

      // Titular: la IA siempre propone; lo escribimos si el actual falta, es
      // placeholder, o si estamos re-sintetizando a la fuerza.
      const aiTitle = asStr(p.titular);
      if (aiTitle && (!story.title || story.title === 'Sin título' || forceStoryId)) {
        update.title = aiTitle.slice(0, 200);
      }

      const { error: upErr } = await supabase.from('stories').update(update).eq('id', story.id);
      if (upErr) { console.error(`Update ${story.id}: ${upErr.message}`); errors++; continue; }
      processed++;
      details.push({ id: story.id, title: (update.title as string) || story.title, category, medios: medios.length, cifras: cifras.length });
    } catch (err) {
      console.error(`Exception ${story.id}: ${String(err)}`); errors++;
    }
  }

  return new Response(JSON.stringify({ message: 'Synthesis complete', processed, errors, total: stories.length, details }),
    { status: 200, headers: { 'Content-Type': 'application/json' } });
});
