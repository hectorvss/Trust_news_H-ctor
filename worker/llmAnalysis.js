// LLM analysis of story clusters using Claude API (Anthropic)
// Only runs when a cluster has >= 5 distinct sources
// Uses claude-sonnet-4-6 with prompt caching for the system prompt

const MIN_SOURCES_FOR_ANALYSIS = 5;
const MAX_INPUT_TOKENS = 2000;   // safety cap — truncate articles to fit
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

// Approximate tokens: 1 token ≈ 4 chars (conservative estimate)
const CHARS_PER_TOKEN = 4;
const MAX_INPUT_CHARS = MAX_INPUT_TOKENS * CHARS_PER_TOKEN;

function log(msg) {
  const t = new Date().toTimeString().slice(0, 8);
  console.log(`[${t}] [llmAnalysis] ${msg}`);
}

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY || null;
}

// The system prompt is static → perfect for prompt caching
const SYSTEM_PROMPT = `Eres un analista de medios especializado en el panorama informativo español. Tu tarea es analizar un conjunto de artículos sobre la misma noticia, publicados por medios de diferentes tendencias ideológicas, y extraer un análisis estructurado e imparcial.

Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después. El JSON debe tener exactamente esta estructura:

{
  "title": "Título conciso y neutral del evento (máx 100 chars)",
  "summary": "Resumen objetivo de los hechos en 2-3 frases (máx 300 chars)",
  "consenso_narrativo": "Qué puntos son ampliamente aceptados por todos los medios (máx 200 chars)",
  "blind_spot": "Qué ángulo importante está siendo ignorado por la mayoría de los medios (máx 200 chars)",
  "perspectivas_info": {
    "izquierda": "Cómo enfocan este tema los medios de izquierda (máx 150 chars)",
    "centro": "Cómo enfocan este tema los medios de centro (máx 150 chars)",
    "derecha": "Cómo enfocan este tema los medios de derecha (máx 150 chars)"
  },
  "cifras_clave": [
    { "cifra": "dato numérico o estadística", "contexto": "qué significa", "fuente": "medio o institución" }
  ],
  "claims_en_disputa": [
    { "claim": "afirmación controvertida", "posicion_izquierda": "postura", "posicion_derecha": "postura contraria" }
  ],
  "factuality": "alta | media | baja"
}

Si no hay suficientes artículos de algún espectro ideológico, indica "Sin cobertura" en ese campo.
Mantén siempre un tono objetivo y analítico.`;

function buildUserPrompt(cluster, articles, sourcesMap) {
  const lines = [];
  lines.push(`## Cluster: ${cluster.title || 'Sin título'}`);
  lines.push(`Artículos analizados: ${articles.length}`);
  lines.push('');
  lines.push('### Artículos:');

  let totalChars = lines.join('\n').length;
  const budgetPerArticle = Math.floor((MAX_INPUT_CHARS - totalChars - 200) / articles.length);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const source = sourcesMap[article.source_id];
    const sourceName = source ? source.nombre : 'Desconocido';
    const sourceBias = source ? source.bias : '?';

    const title = (article.title || '').slice(0, 200);
    const excerpt = (article.excerpt || '').slice(0, Math.max(50, budgetPerArticle - title.length - 60));

    const block = `\n[${i + 1}] **${sourceName}** (${sourceBias})\nTítulo: ${title}\nExcerpt: ${excerpt}`;

    totalChars += block.length;
    if (totalChars > MAX_INPUT_CHARS) {
      lines.push(`\n[...${articles.length - i} artículos más omitidos por límite de tokens]`);
      break;
    }
    lines.push(block);
  }

  lines.push('\n### Instrucción:\nAnaliza los artículos anteriores y responde con el JSON estructurado según el formato indicado en el system prompt.');
  return lines.join('\n');
}

function parseClaudeResponse(text) {
  // Extract JSON from response (Claude might wrap it in markdown code blocks)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                    text.match(/```\s*([\s\S]*?)\s*```/) ||
                    text.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) throw new Error('No JSON found in Claude response');
  return JSON.parse(jsonMatch[1]);
}

export async function analyzeCluster(cluster, articles, sourcesMap) {
  const apiKey = getApiKey();
  if (!apiKey) {
    log('ANTHROPIC_API_KEY not set — skipping LLM analysis');
    return null;
  }

  // Count distinct sources
  const distinctSources = new Set(articles.map(a => a.source_id).filter(Boolean));
  if (distinctSources.size < MIN_SOURCES_FOR_ANALYSIS) {
    log(`Cluster ${cluster.id} has only ${distinctSources.size} sources (need ${MIN_SOURCES_FOR_ANALYSIS}) — skipping`);
    return null;
  }

  log(`Analyzing cluster "${cluster.title}" (${articles.length} articles, ${distinctSources.size} sources)`);

  const userPrompt = buildUserPrompt(cluster, articles, sourcesMap);

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        // Enable prompt caching for the system prompt
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' }, // cache the system prompt
          },
        ],
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || '';

    if (!rawText) throw new Error('Empty response from Claude');

    const analysis = parseClaudeResponse(rawText);

    // Log cache hit info if available
    const usage = data.usage || {};
    if (usage.cache_read_input_tokens) {
      log(`Cache hit: ${usage.cache_read_input_tokens} tokens from cache, ${usage.input_tokens} new tokens`);
    }

    log(`Analysis complete for cluster ${cluster.id}. Factuality: ${analysis.factuality}`);
    return analysis;

  } catch (err) {
    log(`ERROR analyzing cluster ${cluster.id}: ${err.message}`);
    return null;
  }
}
