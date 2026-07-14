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
// 1 noticia por ciclo: cada una lanza varias llamadas OpenAI y la Edge Function
// tiene ~150s de wall-clock; procesar más de una en serie se pasaría del límite.
const BATCH_SIZE = 1;
const MAX_ARTICLES = 16;
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const MAX_TOKENS = 11000;

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

// Una llamada a OpenAI con salida JSON. Devuelve el objeto parseado o null.
async function openaiOnce(openaiKey: string, prompt: string, maxTokens: number): Promise<any | null> {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_completion_tokens: maxTokens,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!resp.ok) {
    console.error(`OpenAI ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
    return null;
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || '';
  try { return JSON.parse(content); } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch { /* ignore */ } }
  }
  return null;
}

// gpt-4o-mini a veces se auto-trunca (cuerpo corto, array incompleto). Reintenta
// hasta que `valid` acepte el resultado o se agoten los intentos.
async function openaiJSON(openaiKey: string, prompt: string, maxTokens: number, valid?: (r: any) => boolean, tries = 2): Promise<any | null> {
  let last: any = null;
  for (let t = 0; t < tries; t++) {
    const r = await openaiOnce(openaiKey, prompt, maxTokens);
    if (r) { last = r; if (!valid || valid(r)) return r; }
  }
  return last;
}

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
            .select('title, excerpt, content_excerpt, url, source_id, published_at').in('id', ids.slice(0, MAX_ARTICLES));
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

      const articlesText = articles.slice(0, MAX_ARTICLES).map((a: any, i: number) => {
        const body2 = String(a.excerpt || a.summary || '').slice(0, 500);
        return `[ARTÍCULO ${i} | medio: ${a.source} | sesgo: ${a.bias || 'CENTER'}]\nTitular: ${a.title || ''}${body2 ? `\nExtracto: ${body2}` : ''}`;
      }).join('\n\n');

      const header = `Eres el redactor jefe de Trust News España, un agregador que compara la cobertura mediática de una misma noticia. Trabaja EXCLUSIVAMENTE con los artículos reales de abajo, en español de España.

NOTICIA (tema del cluster): "${story.title && story.title !== 'Sin título' ? story.title : (articles[0]?.title || 'ver artículos')}"
Distribución de cobertura por sesgo de las fuentes: Izquierda ${covL}% · Centro ${covC}% · Derecha ${covR}%
Medios de izquierda presentes: ${sides.left.join(', ') || 'NINGUNO'}
Medios de centro presentes: ${sides.center.join(', ') || 'NINGUNO'}
Medios de derecha presentes: ${sides.right.join(', ') || 'NINGUNO'}

ARTÍCULOS:
${articlesText}`;

      // ── LLAMADA 1: FICHA EDITORIAL (cuerpo, contexto, análisis, cifras...) ──
      // Prompt enfocado → el modelo no se queda sin presupuesto y el cuerpo sale
      // completo (antes, con todo en una sola llamada, se truncaba).
      const editorialPrompt = `${header}

OBJETIVO DE CALIDAD: la ficha debe ser tan completa, clara y bien contada que el lector entienda por entero la noticia y NO necesite ir a la fuente original. Menciona frases o datos TEXTUALES de los medios (SIEMPRE entre comillas y atribuidos: según [medio], en palabras de [persona] citadas por [medio]) y coméntalos/analízalos de forma OBJETIVA, sin opinar ni tomar partido. Redacción propia, fluida y periodística. NO inventes cifras, nombres, hechos ni citas que no aparezcan en los extractos.

LONGITUDES OBLIGATORIAS (respétalas para que la ficha quede completa):
- "titular": 60-110 caracteres, específico, sin clickbait. NUNCA "Sin título".
- "summary": 2-3 frases (300-450 caracteres).
- "analytical_snippet": 2 frases con la lectura editorial de TNE (200-350 caracteres).
- "full_content": CUERPO PRINCIPAL, 6-8 párrafos separados por \\n (2400-3600 caracteres). Es lo más importante: tan completo que el lector no necesite el original. Estructura párrafo a párrafo:
    (1) Entradilla con los hechos esenciales: qué, quién, cuándo, dónde.
    (2-3) Desarrollo con DETALLES y DECLARACIONES: incorpora 2-4 frases o datos TEXTUALES de los extractos, ENTRECOMILLADOS y atribuidos (p.ej.: según recoge Infobae, Teresa Perales subrayó que Messi se implica para "ayudar a muchísimas personas").
    (4) Contexto y antecedentes para comprender por qué ocurre y por qué importa.
    (5) ANÁLISIS OBJETIVO del significado e implicaciones, con neutralidad.
    (6) Cómo lo han cubierto los distintos medios (coincidencias y matices), citando nombres.
    (7) Qué queda abierto o pendiente.
  Las comillas SOLO para frases textuales reales; nunca inventes citas.
- "contexto": 2-3 párrafos separados por \\n (600-1000 caracteres): antecedentes, por qué importa ahora.
- "perspectivas_info": 2 párrafos (500-800 caracteres) comparando enfoques SOLO de los lados presentes; de los ausentes constata la ausencia.
- "bias_info": 1 párrafo (300-500 caracteres) que asigne cada periódico a su bloque: "De los N medios analizados, X se sitúan en la izquierda (nombres), Y en el centro (nombres) y Z en la derecha (nombres)", y qué implica ese reparto.
- "desglose": 4-6 claves, cada una una frase completa de 12-25 palabras.
- "consenso_izq/centro/dcha": 2-3 frases cada uno (250-450 caracteres) citando NOMBRES de medios. Si un lado no tiene medios presentes escribe EXACTAMENTE: "Sin cobertura de medios de este espectro en esta historia."
- "blind_spot": 2 frases (200-350 caracteres).
- "fact_check": 2-3 frases sobre el estado de verificación de las afirmaciones principales.
- "verificacion_info": 3-4 frases (300-500 caracteres): qué está confirmado por varios medios, qué solo por uno, qué falta.
- "impacto_social": 3-4 frases completas. "impacto_sistemico": 3 frases completas.
- "protagonistas": beneficiados y afectados, 1-2 frases cada uno.
- "preguntas": 3-4 preguntas abiertas relevantes.
- "cifras_clave": extrae SOLO datos CONCRETOS, NUMÉRICOS y CIERTOS que aparezcan literalmente en algún extracto o titular (un número, porcentaje, año, edad, importe, cantidad exacta). Reglas ESTRICTAS:
    · El "value" DEBE contener una cifra concreta y verdadera (ej.: "8", "2026", "20 millones", "3,5%"). PROHIBIDO valores vagos como "todos los títulos posibles", "varios", "muchos", "numerosos", o nombres propios (p.ej. "Serena Williams" NO es una cifra).
    · Si no estás seguro de que el dato sea cierto, NO lo incluyas. Prefiere pocas cifras verdaderas a muchas dudosas.
    · El "label" empieza SIEMPRE en Mayúscula y es claro (ej.: "Balones de Oro de Messi").
  Ej. válido: "ocho Balones de Oro" → {"label":"Balones de Oro de Messi","value":"8"}. Reúne las que de verdad existan (idealmente 4-6); si solo hay 2-3 ciertas, devuelve esas. No rellenes ni inventes.
- "documentos_info": SOLO documentos/informes/sentencias citados textualmente; si no hay, [].

Devuelve SOLO JSON válido, sin markdown, con EXACTAMENTE estas claves:
{"titular":"...","category":"una de: ${CATEGORIES.join(', ')}","consensus":"ALTO|MEDIO|BAJO|POLARIZADO","impact":"ALTO|MEDIO|BAJO","factuality":"ALTA|MIXTA|BAJA","summary":"...","full_content":"...","contexto":"...","perspectivas_info":"...","bias_info":"...","desglose":["...","...","...","..."],"consenso_izq":"...","consenso_centro":"...","consenso_dcha":"...","analytical_snippet":"...","blind_spot":"...","fact_check":"...","verificacion_info":"...","impacto_social":["...","...","..."],"impacto_sistemico":["...","...","..."],"cifras_clave":[{"label":"concepto","value":"dato con unidad"}],"documentos_info":[{"name":"documento","context":"qué aporta"}],"protagonistas":{"beneficiados":"...","afectados":"..."},"preguntas":["...","...","..."]}`;

      // ── LLAMADA(S) 2: PIEZA DESARROLLADA POR FUENTE (contenido "dentro") ──
      // Cada fuente lleva una pieza propia LARGA (≈70% del cuerpo, casi todo
      // comentario/análisis nuestro). 14 piezas largas no caben en una llamada,
      // así que troceamos las fuentes en lotes y los generamos en paralelo. Cada
      // lote ve TODOS los artículos (para comparar) pero solo redacta los suyos.
      const nArts = Math.min(articles.length, MAX_ARTICLES);
      // Lotes pequeños (2 fuentes) = llamadas cortas y fiables. Van en paralelo,
      // así que más lotes NO suman wall-clock, solo concurrencia.
      const CHUNK = 2;
      const chunks: number[][] = [];
      for (let s = 0; s < nArts; s += CHUNK) {
        const g: number[] = [];
        for (let k = s; k < Math.min(s + CHUNK, nArts); k++) g.push(k);
        chunks.push(g);
      }
      const sourceRules = (idxList: number[]) => `${header}

TAREA: para los artículos con idx ${idxList.join(', ')} redacta, por cada uno, una PIEZA PROPIA y EXTENSA de Trust News España que cuente y analice a fondo lo que publica ese medio, de modo que el lector la entienda por completo SIN abrir el original. Ves TODOS los artículos arriba solo para comparar; redacta ÚNICAMENTE los idx indicados. NO inventes datos ni citas; usa solo lo que aparece en cada extracto, pero DESARROLLA con contexto y análisis propios.

Por cada artículo devuelve:
- "tipo": REPORTAJE|OPINIÓN|ANÁLISIS|NOTICIA|CRÓNICA|ENTREVISTA.
- "tono": 1-3 palabras específicas.
- "autor": firma si aparece; si no, "Redacción" o la agencia (EFE, Europa Press...).
- "origen": ciudad/ámbito si se deduce, si no "Nacional".
- "teaser": UNA frase breve (≤110 caracteres) para la vista previa.
- "parrafos": array de 6-8 párrafos (cada uno 260-420 caracteres; en total 1600-2600 caracteres, aprox. el 70% de la noticia principal). Es una pieza LARGA en la que la mayor parte es COMENTARIO Y ANÁLISIS NUESTRO. Estructura sugerida:
    (1) qué publica este medio: los hechos que da.
    (2) el detalle o declaración central, con una frase TEXTUAL del extracto ENTRECOMILLADA y atribuida.
    (3-4) NUESTRO análisis objetivo del encuadre: qué prioriza, qué lenguaje usa, qué enfatiza u OMITE frente a los otros medios, qué revela su tratamiento.
    (5) contexto y antecedentes que ayuden a entender la noticia.
    (6) implicaciones y qué queda abierto.
    (7-8) cierre analítico.
  Comentario abundante y objetivo, sin opinar ni tomar partido. Redacción fluida y periodística. Comillas SOLO para frases textuales reales del extracto; nunca inventes citas ni cifras.
- "cita": la frase textual más representativa del extracto como {"texto":"...","autor":"quién la dice o el medio"}. Si no hay ninguna citable, {"texto":"","autor":""}.
- "clave": 1 frase con el ángulo o dato ÚNICO que aporta este medio frente a los demás.

Devuelve SOLO JSON válido, sin markdown, SOLO con esos idx: {"articulos":[{"idx":${idxList[0]},"tipo":"NOTICIA","tono":"Neutral factual","autor":"Redacción","origen":"Nacional","teaser":"...","parrafos":["...","...","...","...","...","..."],"cita":{"texto":"...","autor":"..."},"clave":"..."}]}`;

      const editorialValid = (r: any) => !!r?.summary && String(r?.full_content || '').length >= 1400;
      const chunkValid = (g: number[]) => (r: any) =>
        Array.isArray(r?.articulos) && r.articulos.length >= g.length &&
        r.articulos.every((a: any) => Array.isArray(a?.parrafos) && a.parrafos.filter((x: any) => String(x || '').trim()).length >= 4);
      // tries acotados: editorial 2, lotes 2. Todo en paralelo (Promise.all), así
      // el wall-clock ≈ el de la rama más lenta con su reintento, no la suma.
      const [pEditorial, ...pSourceChunks] = await Promise.all([
        openaiJSON(openaiKey, editorialPrompt, 5000, editorialValid, 2),
        ...chunks.map((g) => openaiJSON(openaiKey, sourceRules(g), 6000, chunkValid(g), 2)),
      ]);
      const p = pEditorial || {};
      if (!p.summary) { console.error(`Bad editorial JSON for ${story.id}`); errors++; continue; }
      p.articulos = pSourceChunks.flatMap((pc: any) => (pc && Array.isArray(pc.articulos)) ? pc.articulos : []);

      const asArr = (v: any) => Array.isArray(v) ? v.filter((x) => x != null && String(x).trim() !== '') : [];
      const asStr = (v: any) => (typeof v === 'string' ? v.trim() : '');
      const ABSENT = 'Sin cobertura de medios de este espectro en esta historia.';
      const narrPart = (v: any) => asStr(v) || ABSENT;
      const narr = [narrPart(p.consenso_izq), narrPart(p.consenso_centro), narrPart(p.consenso_dcha)].join(' | ');
      // Cifras: solo datos NUMÉRICOS y CIERTOS. Descartamos valores vagos o sin
      // dígito (nombres propios, "todos los títulos...") y capitalizamos el label.
      // El usuario prefiere pocas verdaderas a muchas dudosas → umbral bajo (3).
      const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
      const VAGUE = /\b(todos?|toda?s?|varios?|muchos?|numerosos?|m[úu]ltiples|posibles?|diversos?)\b/i;
      const cifrasRaw = asArr(p.cifras_clave)
        .map((c: any) => ({ label: cap(asStr(c?.label)), value: asStr(c?.value) }))
        .filter((c: any) => c.label && c.value && /\d/.test(c.value) && !VAGUE.test(c.value));
      const cifras = cifrasRaw.length >= 2 ? cifrasRaw : [];
      const prot = (p.protagonistas && typeof p.protagonistas === 'object')
        ? { beneficiados: asStr(p.protagonistas.beneficiados), afectados: asStr(p.protagonistas.afectados) }
        : { beneficiados: '', afectados: '' };

      const perArt: Record<number, any> = {};
      for (const a of asArr(p.articulos)) { if (typeof a?.idx === 'number') perArt[a.idx] = a; }
      const mergedArticles = articles.map((a: any, i: number) => {
        const x = perArt[i] || {};
        const paras = asArr(x.parrafos).map(asStr);
        const citaTexto = asStr(x.cita?.texto);
        const citaAutor = asStr(x.cita?.autor) || a.source;
        const teaser = asStr(x.teaser);
        // readerContent alimenta la vista "dentro" (StoryReader): pieza propia
        // con párrafos desarrollados, una cita destacada y comentario objetivo.
        const readerContent = paras.length ? {
          body: paras,
          claims: citaTexto ? [{ text: citaTexto, source: citaAutor }] : [],
          blindSpot: asStr(x.clave),
          // Compatibilidad con el render estructurado antiguo (fallback).
          whatHappened: paras[0] || '',
          context: paras[1] || '',
          preQuoteAnalysis: '',
          postQuoteAnalysis: paras.slice(2).join('\n\n'),
          implications: { owner: '' },
        } : (a.readerContent || null);
        return {
          ...a,
          type: asStr(x.tipo) || a.type || 'NOTICIA',
          tone: asStr(x.tono) || a.tone || 'Informativo',
          author: asStr(x.autor) || a.author || 'Redacción',
          origin: asStr(x.origen) || a.origin || 'Nacional',
          // teaser = línea mínima para la PREVIEW; el desarrollo va en readerContent.
          teaser: teaser || paras[0]?.slice(0, 110) || '',
          diff: teaser || a.diff || '',
          summary: paras.join(' ') || asStr(x.resumen) || a.summary || a.excerpt || '',
          angle: asStr(x.angulo) || a.angle || '',
          whyOpened: asStr(x.clave) || a.whyOpened || 'Análisis comparativo',
          readerContent,
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
        bias_info: asStr(p.bias_info),
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
        documentos_info: asArr(p.documentos_info).map((d: any) => ({ name: asStr(d?.name), context: asStr(d?.context) })).filter((d: any) => d.name),
        key_figures: cifras.map((c: any) => `${c.label}: ${c.value}`),
        disputed_claims: asArr(p.preguntas).map(asStr),
        protagonistas_info: prot,
        preguntas_info: asArr(p.preguntas).map(asStr),
        origen_info: medios,
        medios_analizados: medios,
        articles: mergedArticles,
        updated_at: new Date().toISOString(),
      };

      // Titular: en drafts auto-generados manda la IA (el titular previo era un
      // placeholder o el titular prestado del primer artículo). El manager puede
      // editarlo en revisión antes de publicar.
      const aiTitle = asStr(p.titular);
      if (aiTitle) update.title = aiTitle.slice(0, 200);

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
