const encoder = new TextEncoder();

export const config = {
  userAgent: Deno.env.get("PIPELINE_USER_AGENT") ?? "TrustNewsBot/2.0 (+https://trustnews.es/bot)",
  fetchTimeoutMs: Number(Deno.env.get("PIPELINE_FETCH_TIMEOUT_MS") ?? 8000),
  excerptMaxChars: Number(Deno.env.get("PIPELINE_EXCERPT_MAX_CHARS") ?? 300),
  fullContentMaxChars: Number(Deno.env.get("PIPELINE_FULL_CONTENT_MAX_CHARS") ?? 12000),
  extractionMaxPerRun: Number(Deno.env.get("PIPELINE_EXTRACTION_MAX_PER_RUN") ?? 120),
  ingestConcurrency: Number(Deno.env.get("PIPELINE_INGEST_CONCURRENCY") ?? 5),
  embedBatchSize: Number(Deno.env.get("PIPELINE_EMBED_BATCH_SIZE") ?? 50),
  embedMaxPerRun: Number(Deno.env.get("PIPELINE_EMBED_MAX_PER_RUN") ?? 250),
  clusterWindowHours: Number(Deno.env.get("PIPELINE_CLUSTER_WINDOW_HOURS") ?? 72),
  clusterExistingWindowHours: Number(Deno.env.get("PIPELINE_CLUSTER_EXISTING_WINDOW_HOURS") ?? 48),
  clusterSimilarityHigh: Number(Deno.env.get("PIPELINE_CLUSTER_SIMILARITY_HIGH") ?? 0.82),
  clusterSimilarityLow: Number(Deno.env.get("PIPELINE_CLUSTER_SIMILARITY_LOW") ?? 0.55),
  clusterMinSourcesReady: Number(Deno.env.get("PIPELINE_CLUSTER_MIN_SOURCES_READY") ?? 3),
  clusterMinArticles: Number(Deno.env.get("PIPELINE_CLUSTER_MIN_ARTICLES") ?? 2),
  analysisMinSources: Number(Deno.env.get("PIPELINE_ANALYSIS_MIN_SOURCES") ?? 5),
  analysisMinAgeMinutes: Number(Deno.env.get("PIPELINE_ANALYSIS_MIN_AGE_MINUTES") ?? 30),
  analysisMaxClustersPerRun: Number(Deno.env.get("PIPELINE_ANALYSIS_MAX_CLUSTERS_PER_RUN") ?? 15),
  analysisMaxArticlesInPrompt: Number(Deno.env.get("PIPELINE_ANALYSIS_MAX_ARTICLES_IN_PROMPT") ?? 24),
  openaiEmbeddingModel: Deno.env.get("OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small",
  anthropicModel: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6",
};

const trackingParams = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_source_platform", "fbclid", "gclid", "msclkid",
  "ref", "referrer", "source", "mc_cid", "mc_eid",
]);

export const stripHtml = (value: string) =>
  (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const truncate = (value: string | null | undefined, max: number) =>
  !value ? null : value.length > max ? value.slice(0, max) : value;

export const normalizeUrl = (rawUrl: string) => {
  try {
    const u = new URL(rawUrl);
    for (const param of trackingParams) u.searchParams.delete(param);
    u.hash = "";
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
};

export const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const buildEmbeddingInput = (title?: string | null, excerpt?: string | null) =>
  [title?.trim(), excerpt?.trim()].filter(Boolean).join(". ");

const textContent = (root: Element, selectors: string[]) => {
  for (const selector of selectors) {
    const el = root.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return null;
};

const attrValue = (root: Element, selector: string, attr: string) => {
  const el = root.querySelector(selector);
  const value = el?.getAttribute(attr)?.trim();
  return value || null;
};

export const parseRssFeed = async (feedUrl: string, userAgent = config.userAgent) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.fetchTimeoutMs);

  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (!doc) throw new Error("Invalid XML document");

    const isAtom = !!doc.querySelector("feed");
    const items = Array.from(doc.querySelectorAll(isAtom ? "entry" : "item"));

    return items
      .map((item) => {
        const url = isAtom
          ? item.querySelector('link[rel="alternate"]')?.getAttribute("href")?.trim()
            || item.querySelector("link")?.getAttribute("href")?.trim()
            || textContent(item, ["id"])
          : textContent(item, ["link"]) || item.querySelector("link")?.getAttribute("href")?.trim();

        const title = textContent(item, ["title"]);
        const content = textContent(item, [
          "content\\:encoded",
          "content",
          "description",
          "summary",
        ]);
        const author = textContent(item, ["dc\\:creator", "author", "name"]);
        const publishedRaw = textContent(item, [
          isAtom ? "published" : "pubDate",
          "updated",
          "dc\\:date",
        ]);
        const enclosureUrl = attrValue(item, "enclosure", "url");
        const enclosureType = attrValue(item, "enclosure", "type") || "";
        const imageUrl =
          (enclosureUrl && enclosureType.startsWith("image") ? enclosureUrl : null)
          || attrValue(item, "media\\:content", "url")
          || attrValue(item, "media\\:thumbnail", "url");

        let publishedAt: string | null = null;
        if (publishedRaw) {
          const parsed = new Date(publishedRaw);
          if (!Number.isNaN(parsed.getTime())) publishedAt = parsed.toISOString();
        }

        return {
          url: url || null,
          title: title || null,
          excerpt: content ? truncate(stripHtml(content), config.excerptMaxChars) : null,
          author: author || null,
          publishedAt,
          imageUrl: imageUrl || null,
          rawMetadata: {},
        };
      })
      .filter((item) => item.url && item.title);
  } finally {
    clearTimeout(timer);
  }
};

export const extractArticleMetadata = async (url: string, userAgent = config.userAgent) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.fetchTimeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const meta = (property: string) => {
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=[\"']${property}[\"'][^>]+content=[\"']([^\"']+)[\"'][^>]*>`, "i"),
        new RegExp(`<meta[^>]+content=[\"']([^\"']+)[\"'][^>]+(?:property|name)=[\"']${property}[\"'][^>]*>`, "i"),
      ];
      for (const re of patterns) {
        const match = html.match(re);
        if (match) return match[1]?.trim() || null;
      }
      return null;
    };

    const title = meta("og:title") || meta("twitter:title");
    const description = meta("og:description") || meta("twitter:description") || meta("description");
    const imageUrl = meta("og:image") || meta("twitter:image");
    const author = meta("article:author") || meta("author");
    const publishedRaw = meta("article:published_time") || meta("article:modified_time");

    let publishedAt: string | null = null;
    if (publishedRaw) {
      const parsed = new Date(publishedRaw);
      if (!Number.isNaN(parsed.getTime())) publishedAt = parsed.toISOString();
    }

    return {
      title: title || null,
      author: author || null,
      publishedAt,
      imageUrl: imageUrl || null,
      excerpt: truncate(description, config.excerptMaxChars),
    };
  } finally {
    clearTimeout(timer);
  }
};

const removeBoilerplate = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ");

export const extractReadableArticle = async (url: string, userAgent = config.userAgent) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.fetchTimeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const doc = new DOMParser().parseFromString(removeBoilerplate(html), "text/html");
    const title = doc.querySelector("h1")?.textContent?.trim() || null;
    const subtitle =
      doc.querySelector("h2")?.textContent?.trim() ||
      doc.querySelector('[class*="subtitle"]')?.textContent?.trim() ||
      doc.querySelector('[class*="entradilla"]')?.textContent?.trim() ||
      null;
    const section =
      doc.querySelector("meta[property='article:section']")?.getAttribute("content")?.trim() ||
      doc.querySelector("meta[name='section']")?.getAttribute("content")?.trim() ||
      null;
    const paragraphs = Array.from(doc.querySelectorAll("article p, main p, [role='main'] p, p"))
      .map((el) => stripHtml(el.textContent || ""))
      .filter((text) => text.length >= 40);

    const unique: string[] = [];
    const seen = new Set<string>();
    for (const paragraph of paragraphs) {
      const key = paragraph.toLowerCase().slice(0, 140);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(paragraph);
      }
    }

    const contentText = truncate(unique.join("\n\n"), config.fullContentMaxChars) || "";
    return {
      title,
      subtitle,
      section,
      contentText,
      contentExcerpt: truncate(contentText, config.excerptMaxChars),
      wordCount: contentText ? contentText.split(/\s+/).filter(Boolean).length : 0,
      charCount: contentText.length,
      structured: extractStructuredSignals(contentText),
    };
  } finally {
    clearTimeout(timer);
  }
};

export const extractStructuredSignals = (text: string) => {
  const figures = Array.from(text.matchAll(/\b\d+(?:[.,]\d+)?\s?(?:%|euros?|millones?|miles?|personas?|votos?|años?|meses?|días?)\b/gi))
    .slice(0, 12)
    .map((match) => ({ value: match[0], context: text.slice(Math.max(0, match.index! - 80), match.index! + 120).trim() }));
  const quotes = Array.from(text.matchAll(/[“"]([^”"]{25,240})[”"]/g))
    .slice(0, 8)
    .map((match) => ({ quote: match[1] }));
  const entities = Array.from(new Set(Array.from(text.matchAll(/\b[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ-]+(?:\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ-]+){0,3}\b/g))
    .map((match) => match[0])
    .filter((value) => value.length > 3)))
    .slice(0, 30)
    .map((name) => ({ name }));
  const documents = Array.from(text.matchAll(/\b(?:BOE|informe|sentencia|decreto|ley|resolución|documento|expediente)\b[^.]{0,180}/gi))
    .slice(0, 10)
    .map((match) => ({ name: match[0].trim() }));
  const claims = text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => /\b(?:asegura|afirma|denuncia|sostiene|critica|acusa|promete|confirma)\b/i.test(sentence))
    .slice(0, 12)
    .map((claim) => ({ claim }));

  return { entities, figures, quotes, documents, claims };
};

export const cosineSimilarity = (a: number[] | null | undefined, b: number[] | null | undefined) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
};

export const tokenSet = (value: string) =>
  new Set(
    (value || "")
      .toLowerCase()
      .split(/\W+/)
      .filter((token) => token.length > 3),
  );

export const jaccard = (a: Set<string>, b: Set<string>) => {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
};

export const calculateBiasDistribution = (articles: Array<{ source_id: string | null }>, sourcesMap: Record<string, any>) => {
  const counts = { izquierda: 0, centroizquierda: 0, centro: 0, centroderecha: 0, derecha: 0 };
  let total = 0;
  for (const article of articles) {
    const source = article.source_id ? sourcesMap[article.source_id] : null;
    if (source?.bias && counts[source.bias as keyof typeof counts] !== undefined) {
      counts[source.bias as keyof typeof counts]++;
      total++;
    }
  }
  if (total === 0) return counts;
  return Object.fromEntries(
    Object.entries(counts).map(([key, value]) => [key, Number((value / total).toFixed(3))]),
  );
};

export const calculateCoverage = (biasDistribution: Record<string, number>) => {
  const left = Number(biasDistribution.izquierda || 0) + Number(biasDistribution.centroizquierda || 0);
  const center = Number(biasDistribution.centro || 0);
  const right = Number(biasDistribution.centroderecha || 0) + Number(biasDistribution.derecha || 0);
  return { left, center, right };
};

export const generateClusterTitle = (articles: Array<{ title?: string | null }>) => {
  if (!articles.length) return "Sin título";
  if (articles.length === 1) return articles[0].title || "Sin título";

  const words = articles
    .flatMap((article) => (article.title || "").toLowerCase().split(/\W+/))
    .filter((word) => word.length > 3);
  const freq: Record<string, number> = {};
  for (const word of words) freq[word] = (freq[word] || 0) + 1;

  let best = articles[0];
  let bestScore = -1;
  for (const article of articles) {
    const titleWords = (article.title || "").toLowerCase().split(/\W+/).filter((word) => word.length > 3);
    const score = titleWords.reduce((sum, word) => sum + (freq[word] || 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = article;
    }
  }
  return best.title || "Sin título";
};

export const computeCentroid = (embeddings: number[][]) => {
  if (!embeddings.length || !embeddings[0]) return null;
  const dims = embeddings[0].length;
  const centroid = new Array(dims).fill(0);
  for (const emb of embeddings) {
    for (let i = 0; i < dims; i++) centroid[i] += emb[i];
  }
  for (let i = 0; i < dims; i++) centroid[i] /= embeddings.length;
  return centroid;
};

export const toVectorLiteral = (values: number[] | null | undefined) => {
  if (!values) return null;
  return `[${values.join(",")}]`;
};

export const parseVector = (value: unknown) => {
  if (!value) return null;
  if (Array.isArray(value)) return value.map((entry) => Number(entry));
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/^\[/, "").replace(/\]$/, "");
    if (!cleaned) return null;
    const parts = cleaned.split(",").map((entry) => Number(entry.trim())).filter((entry) => !Number.isNaN(entry));
    return parts.length ? parts : null;
  }
  return null;
};

export const parseAnthropicJson = (text: string) => {
  const match =
    text.match(/```json\s*([\s\S]*?)\s*```/) ||
    text.match(/```\s*([\s\S]*?)\s*```/) ||
    text.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error("No JSON payload found in model response");
  return JSON.parse(match[1]);
};

export const pickMainImage = (articles: Array<{ image_url?: string | null }>) =>
  articles.find((article) => article.image_url)?.image_url || null;

export const validateEditorialStory = (story: any) => {
  const missing: string[] = [];
  const articles = Array.isArray(story.articles) ? story.articles : [];
  const figures = Array.isArray(story.cifras_clave) ? story.cifras_clave : [];
  const hasCoverage =
    Number(story.coverage_left || 0) + Number(story.coverage_center || 0) + Number(story.coverage_right || 0) > 0;

  if (!story.title) missing.push("title");
  if (!story.summary) missing.push("summary");
  if (!articles.length) missing.push("articles");
  if (!hasCoverage) missing.push("coverage");
  if (!(story.consensus_narrative || story.consenso_narrativo)) missing.push("consensus_narrative");
  if (!figures.length && !story.verificacion_info) missing.push("cifras_clave_or_verificacion_info");

  return {
    ready: missing.length === 0,
    missing,
    checked_at: new Date().toISOString(),
  };
};
