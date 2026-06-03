import { biasBucketOf, buildEmbeddingInput, config, parseAnthropicJson } from "./pipeline.ts";

const openAiKey = () => Deno.env.get("OPENAI_API_KEY") || "";
const anthropicKey = () => Deno.env.get("ANTHROPIC_API_KEY") || "";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const postJson = async (url: string, headers: Record<string, string>, body: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return res;
};

export const embedBatch = async (texts: string[]) => {
  const apiKey = openAiKey();
  if (!apiKey) return null;
  if (!texts.length) return [];

  const res = await postJson(
    "https://api.openai.com/v1/embeddings",
    { Authorization: `Bearer ${apiKey}` },
    { model: config.openaiEmbeddingModel, input: texts },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI embeddings failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.data
    .sort((a: any, b: any) => a.index - b.index)
    .map((item: any) => item.embedding as number[]);
};

export const embedText = async (title?: string | null, excerpt?: string | null) => {
  const input = buildEmbeddingInput(title, excerpt);
  if (!input) return null;
  const batch = await embedBatch([input]);
  return batch?.[0] || null;
};

export const analyzeCluster = async (
  cluster: any,
  articles: Array<{
    source_id: string | null;
    title?: string | null;
    excerpt?: string | null;
    content_text?: string | null;
    content_excerpt?: string | null;
    url?: string | null;
    author?: string | null;
    published_at?: string | null;
    structured_data?: any;
  }>,
  sourcesMap: Record<string, any>,
) => {
  const apiKey = anthropicKey();
  if (!apiKey) return null;

  const distinctSources = new Set(articles.map((article) => article.source_id).filter(Boolean));
  if (distinctSources.size < config.analysisMinSources) return null;

  const systemPrompt = `Eres un analista editorial de Trust News especializado en el panorama informativo español. Analiza artículos que tratan la misma noticia, compara enfoques ideológicos y redacta TODOS los apartados editoriales.

Reglas:
- Usa extraction_quality_score, paywall_detected y blocked_reason para ponderar la evidencia; si un medio esta bloqueado o con poco texto, no lo trates como prueba fuerte.
- Separa hechos observados, interpretaciones de los medios, claims en disputa, cifras, citas, documentos y preguntas abiertas.
- Devuelve ÚNICAMENTE JSON válido.
- No inventes cifras, citas, documentos ni fuentes. Si no hay dato suficiente, dilo explícitamente en verificacion_info o preguntas_info.
- No copies texto largo de los medios: sintetiza y atribuye.
- Mantén tono neutral, claro y periodístico.
- consenso_narrativo debe tener exactamente 3 partes separadas con " | ": izquierda | centro | derecha.
- articles debe conservar URL y fuente de cada medio.

Estructura obligatoria:
{
  "category": "sección temática EXACTA, una de: POLÍTICA|INTERNACIONAL|ECONOMÍA|SOCIEDAD|CULTURA|TECNOLOGÍA|DEPORTES|MEDIO AMBIENTE",
  "title": "Título neutral",
  "summary": "2-3 frases objetivas",
  "full_content": "Análisis completo de 4-7 párrafos",
  "analytical_snippet": "Lectura analítica breve",
  "desglose": ["clave editorial 1", "clave editorial 2", "clave editorial 3"],
  "contexto": "Antecedentes y contexto histórico o institucional",
  "consenso_narrativo": "izquierda | centro | derecha",
  "blind_spot": "Ángulo importante que casi nadie cubre",
  "perspectivas_info": {
    "izquierda": "...",
    "centro": "...",
    "derecha": "..."
  },
  "impacto_social": ["impacto social 1", "impacto social 2"],
  "impacto_sistemico": ["impacto institucional/económico/político 1"],
  "cifras_clave": [
    { "label": "dato", "value": "valor", "contexto": "significado", "fuente": "medio o institución" }
  ],
  "verificacion_info": "Qué está verificado, qué falta y qué no debe afirmarse",
  "origen_info": ["medio/institución origen 1"],
  "documentos_info": [{ "name": "documento o norma", "url": null }],
  "protagonistas_info": { "beneficiados": "...", "afectados": "..." },
  "preguntas_info": ["pregunta abierta 1"],
  "factuality": "ALTA | MIXTA | BAJA",
  "consensus": "ALTO | MEDIO | BAJO | POLARIZADO",
  "impact": "ALTO | MEDIO | BAJO",
  "articles": [
    {
      "source": "medio",
      "url": "url",
      "bias": "izquierda|centroizquierda|centro|centroderecha|derecha",
      "title": "titular",
      "summary": "resumen sintético",
      "author": "autor o vacío",
      "publishedAt": "fecha o null",
      "tone": "tono detectado",
      "angle": "ángulo editorial",
      "diff": "diferencia frente al consenso",
      "whyOpened": "por qué aporta valor abrir esta fuente",
      "origin": "España",
      "type": "REPORTAJE|OPINIÓN|AGENCIA|ANÁLISIS"
    }
  ]
}`;

  const lines = [
    `Cluster: ${cluster.title || "Sin título"}`,
    `Artículos: ${articles.length}`,
    "",
    ...articles.slice(0, config.analysisMaxArticlesInPrompt).map((article, index) => {
      const source = article.source_id ? sourcesMap[article.source_id] : null;
      return [
        `[${index + 1}] ${source?.nombre || source?.name || article.source_id || "Desconocido"} (${source ? biasBucketOf(source) : "?"})`,
        `URL: ${article.url || ""}`,
        `Autor: ${article.author || ""}`,
        `Fecha: ${article.published_at || ""}`,
        `Título: ${article.title || ""}`,
        `Excerpt: ${(article.excerpt || "").slice(0, 500)}`,
        `Texto extraído: ${(article.content_text || article.content_excerpt || "").slice(0, 1800)}`,
        `Señales estructuradas y calidad: ${JSON.stringify(article.structured_data || {}).slice(0, 1800)}`,
        "",
      ].join("\n");
    }),
  ];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.anthropicModel,
      max_tokens: 3000,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: lines.join("\n") }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic analysis failed: ${res.status} ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  if (!text) throw new Error("Empty Anthropic response");

  return parseAnthropicJson(text);
};
