const encoder = new TextEncoder();

export const config = {
  userAgent: Deno.env.get("PIPELINE_USER_AGENT") ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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

const decodeEntities = (value: string) =>
  (value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(parseInt(code, 16)))
    .trim();

const tagText = (xml: string, tag: string) => {
  const escaped = tag.replace(/:/g, "\\:");
  const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return match ? stripHtml(decodeEntities(match[1])) : null;
};

const attrFromTag = (xml: string, tag: string, attr: string, extraPattern = "") => {
  const escaped = tag.replace(/:/g, "\\:");
  const re = new RegExp(`<${escaped}${extraPattern}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i");
  const match = xml.match(re);
  return match ? decodeEntities(match[1]) : null;
};

const splitFeedItems = (xml: string) => {
  const itemMatches = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  if (itemMatches.length) return { isAtom: false, items: itemMatches };
  return {
    isAtom: true,
    items: [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]),
  };
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
    const { isAtom, items } = splitFeedItems(xml);

    return items
      .map((item) => {
        const url = isAtom
          ? attrFromTag(item, "link", "href", `(?=[^>]*rel=["']alternate["'])`)
            || attrFromTag(item, "link", "href")
            || tagText(item, "id")
          : tagText(item, "link") || attrFromTag(item, "link", "href");

        const title = tagText(item, "title");
        const content =
          tagText(item, "content:encoded") ||
          tagText(item, "content") ||
          tagText(item, "description") ||
          tagText(item, "summary");
        const author = tagText(item, "dc:creator") || tagText(item, "author") || tagText(item, "name");
        const publishedRaw =
          tagText(item, isAtom ? "published" : "pubDate") ||
          tagText(item, "updated") ||
          tagText(item, "dc:date");
        const enclosureUrl = attrFromTag(item, "enclosure", "url");
        const enclosureType = attrFromTag(item, "enclosure", "type") || "";
        const imageUrl =
          (enclosureUrl && enclosureType.startsWith("image") ? enclosureUrl : null)
          || attrFromTag(item, "media:content", "url")
          || attrFromTag(item, "media:thumbnail", "url");

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

const domainOf = (rawUrl: string) => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

const firstTagText = (html: string, tag: string) => {
  const match = html.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(decodeEntities(match[1])) : null;
};

const metaContent = (html: string, name: string) => {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["'][^>]*>`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match) return decodeEntities(match[1]);
  }
  return null;
};

const metaList = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "gi"))]
    .map((match) => decodeEntities(match[1]))
    .filter(Boolean);

const attrValue = (tag: string, attr: string) => {
  const match = tag.match(new RegExp(`\\s${attr}=["']([^"']+)["']`, "i"));
  return match ? decodeEntities(match[1]) : null;
};

const classText = (html: string, classFragment: string) => {
  const re = new RegExp(`<[^>]+class=["'][^"']*${classFragment}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, "i");
  const match = html.match(re);
  return match ? stripHtml(decodeEntities(match[1])) : null;
};

const blockByClass = (html: string, fragments: string[]) => {
  for (const fragment of fragments) {
    const re = new RegExp(`<([a-z0-9]+)[^>]+class=["'][^"']*${fragment}[^"']*["'][^>]*>([\\s\\S]*?)<\\/\\1>`, "i");
    const match = html.match(re);
    if (match?.[2]) return match[2];
  }
  return null;
};

const extractParagraphsFromScope = (scope: string) =>
  [...scope.matchAll(/<(?:p|li)(?:\s[^>]*)?>([\s\S]*?)<\/(?:p|li)>/gi)]
    .map((match) => stripHtml(decodeEntities(match[1])))
    .filter((text) => text.length >= 35 && !/^(publicidad|newsletter|suscr[ií]bete|leer m[aá]s)$/i.test(text));

const jsonLdBlocks = (html: string) =>
  [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      try {
        const parsed = JSON.parse(decodeEntities(match[1]).trim());
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    });

const flattenJsonLd = (node: any): any[] => {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenJsonLd);
  const graph = Array.isArray(node["@graph"]) ? node["@graph"].flatMap(flattenJsonLd) : [];
  return [node, ...graph];
};

const findArticleJsonLd = (html: string) => {
  const nodes = jsonLdBlocks(html).flatMap(flattenJsonLd);
  return nodes.find((node) => {
    const type = Array.isArray(node["@type"]) ? node["@type"].join(" ") : String(node["@type"] || "");
    return /NewsArticle|Article|Reportage|BlogPosting/i.test(type);
  }) || null;
};

const jsonLdText = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string") return stripHtml(value);
  if (Array.isArray(value)) return value.map(jsonLdText).filter(Boolean).join(", ") || null;
  if (typeof value === "object") return jsonLdText(value.name || value.headline || value.text);
  return null;
};

const jsonLdDate = (value: any): string | null => {
  const raw = jsonLdText(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const absoluteUrl = (baseUrl: string, href: string | null) => {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
};

const extractImages = (html: string, baseUrl: string) => {
  const images: Array<{ url: string; alt: string | null }> = [];
  const seen = new Set<string>();
  for (const raw of [metaContent(html, "og:image"), metaContent(html, "twitter:image")]) {
    const url = absoluteUrl(baseUrl, raw);
    if (url && !seen.has(url)) {
      seen.add(url);
      images.push({ url, alt: null });
    }
  }
  for (const match of html.matchAll(/<img[^>]+>/gi)) {
    const src = attrValue(match[0], "src") || attrValue(match[0], "data-src") || attrValue(match[0], "data-original");
    const url = absoluteUrl(baseUrl, src);
    if (url && !seen.has(url)) {
      seen.add(url);
      images.push({ url, alt: attrValue(match[0], "alt") });
    }
    if (images.length >= 12) break;
  }
  return images;
};

const extractOutboundLinks = (html: string, baseUrl: string) => {
  const baseHost = domainOf(baseUrl);
  const links: Array<{ url: string; text: string }> = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = absoluteUrl(baseUrl, decodeEntities(match[1]));
    if (!url || seen.has(url) || domainOf(url) === baseHost) continue;
    seen.add(url);
    links.push({ url, text: truncate(stripHtml(match[2]), 120) || "" });
    if (links.length >= 20) break;
  }
  return links;
};

const sourceRules: Array<{ domain: RegExp; containers: string[]; parser: string }> = [
  { domain: /elpais\.com$/, containers: ["a_c", "articulo-cuerpo", "article_body"], parser: "elpais_rules" },
  { domain: /elmundo\.es$/, containers: ["ue-c-article__body", "article__body", "ue-l-article__body"], parser: "elmundo_rules" },
  { domain: /abc\.es$/, containers: ["voc-d-article", "article-body", "cuerpo"], parser: "abc_rules" },
  { domain: /eldiario\.es$/, containers: ["article-text", "story-content", "body"], parser: "eldiario_rules" },
  { domain: /lavanguardia\.com$/, containers: ["article-modules", "article-content", "story-leaf-body"], parser: "lavanguardia_rules" },
  { domain: /elconfidencial\.com$/, containers: ["news-body", "article-body", "EC_articulo"], parser: "elconfidencial_rules" },
  { domain: /20minutos\.es$/, containers: ["article-text", "article-content", "entry-content"], parser: "20minutos_rules" },
  { domain: /rtve\.es$/, containers: ["article-text", "body-text", "contenido"], parser: "rtve_rules" },
];

const detectPaywall = (html: string) =>
  /paywall|premium|solo para suscriptores|contenido exclusivo|suscr[ií]bete para continuar|reg[ií]strate para leer/i.test(html);

const chooseReadableScope = (html: string, url: string) => {
  const domain = domainOf(url);
  const rule = sourceRules.find((entry) => entry.domain.test(domain));
  if (rule) {
    const scope = blockByClass(html, rule.containers);
    if (scope) return { scope, parserUsed: rule.parser, contentSource: "source_rule" };
  }
  const articleMatch = html.match(/<article(?:\s[^>]*)?>([\s\S]*?)<\/article>/i);
  if (articleMatch?.[1]) return { scope: articleMatch[1], parserUsed: "generic_article", contentSource: "article_tag" };
  const mainMatch = html.match(/<main(?:\s[^>]*)?>([\s\S]*?)<\/main>/i);
  if (mainMatch?.[1]) return { scope: mainMatch[1], parserUsed: "generic_main", contentSource: "main_tag" };
  return { scope: html, parserUsed: "paragraph_fallback", contentSource: "page_fallback" };
};

const scoreExtraction = (args: {
  wordCount: number;
  paragraphCount: number;
  hasTitle: boolean;
  hasAuthor: boolean;
  hasDate: boolean;
  paywallDetected: boolean;
  blockedReason: string | null;
}) => {
  if (args.blockedReason) return 0;
  let score = 0;
  if (args.wordCount >= 900) score += 0.42;
  else if (args.wordCount >= 500) score += 0.34;
  else if (args.wordCount >= 220) score += 0.24;
  else if (args.wordCount >= 80) score += 0.12;
  score += Math.min(0.2, args.paragraphCount * 0.025);
  if (args.hasTitle) score += 0.1;
  if (args.hasAuthor) score += 0.08;
  if (args.hasDate) score += 0.08;
  if (args.paywallDetected) score -= 0.18;
  return Number(Math.max(0, Math.min(1, score)).toFixed(3));
};

const parseTags = (html: string, articleJsonLd: any) => {
  const keywords = jsonLdText(articleJsonLd?.keywords);
  const tags = [
    ...(keywords ? keywords.split(",") : []),
    ...metaList(html, "article:tag"),
    ...metaList(html, "keywords").flatMap((value) => value.split(",")),
  ].map((tag) => tag.trim()).filter((tag) => tag.length >= 2);
  return Array.from(new Set(tags)).slice(0, 20);
};

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

    if (!res.ok) {
      const blockedReason = `HTTP ${res.status}`;
      return {
        title: null,
        resolvedTitle: null,
        subtitle: null,
        lead: null,
        canonicalUrl: url,
        byline: null,
        section: null,
        publishedAt: null,
        modifiedAt: null,
        tags: [],
        images: [],
        outboundLinks: [],
        contentText: "",
        contentExcerpt: null,
        wordCount: 0,
        charCount: 0,
        structured: extractStructuredSignals(""),
        extractionQualityScore: 0,
        parserUsed: "fetch",
        contentSource: "http_error",
        paywallDetected: false,
        blockedReason,
      };
    }

    const rawHtml = await res.text();
    const articleJsonLd = findArticleJsonLd(rawHtml);
    const html = removeBoilerplate(rawHtml);
    const canonicalUrl =
      absoluteUrl(url, attrValue(html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] || "", "href")) ||
      metaContent(html, "og:url") ||
      url;
    const title = firstTagText(html, "h1");
    const resolvedTitle =
      jsonLdText(articleJsonLd?.headline) ||
      metaContent(html, "og:title") ||
      metaContent(html, "twitter:title") ||
      title;
    const subtitle =
      jsonLdText(articleJsonLd?.description) ||
      metaContent(html, "og:description") ||
      metaContent(html, "twitter:description") ||
      firstTagText(html, "h2") ||
      classText(html, "subtitle") ||
      classText(html, "entradilla") ||
      null;
    const lead = classText(html, "entradilla") || classText(html, "lead") || subtitle || null;
    const section =
      jsonLdText(articleJsonLd?.articleSection) ||
      metaContent(html, "article:section") ||
      metaContent(html, "section") ||
      null;
    const byline =
      jsonLdText(articleJsonLd?.author) ||
      metaContent(html, "article:author") ||
      metaContent(html, "author") ||
      classText(html, "author") ||
      classText(html, "byline") ||
      null;
    const publishedAt =
      jsonLdDate(articleJsonLd?.datePublished) ||
      jsonLdDate(metaContent(html, "article:published_time")) ||
      jsonLdDate(metaContent(html, "date")) ||
      null;
    const modifiedAt =
      jsonLdDate(articleJsonLd?.dateModified) ||
      jsonLdDate(metaContent(html, "article:modified_time")) ||
      null;
    const paywallDetected = detectPaywall(rawHtml);
    const articleBody = jsonLdText(articleJsonLd?.articleBody);
    const chosen = chooseReadableScope(html, url);
    const paragraphs = articleBody && articleBody.length > 400
      ? articleBody.split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/).map((part) => part.trim()).filter((part) => part.length >= 35)
      : extractParagraphsFromScope(chosen.scope);

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
    const wordCount = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;
    const blockedReason =
      !contentText && paywallDetected ? "paywall_or_subscription_wall" :
      !contentText ? "empty_or_unreadable_html" :
      null;
    const structured = extractStructuredSignals(contentText);
    const extractionQualityScore = scoreExtraction({
      wordCount,
      paragraphCount: unique.length,
      hasTitle: Boolean(resolvedTitle || title),
      hasAuthor: Boolean(byline),
      hasDate: Boolean(publishedAt),
      paywallDetected,
      blockedReason,
    });

    return {
      title,
      resolvedTitle,
      subtitle,
      lead,
      canonicalUrl,
      byline,
      section,
      publishedAt,
      modifiedAt,
      tags: parseTags(html, articleJsonLd),
      images: extractImages(html, canonicalUrl),
      outboundLinks: extractOutboundLinks(chosen.scope, canonicalUrl),
      contentText,
      contentExcerpt: truncate(contentText, config.excerptMaxChars),
      wordCount,
      charCount: contentText.length,
      structured,
      extractionQualityScore,
      parserUsed: articleBody && articleBody.length > 400 ? "json_ld_article_body" : chosen.parserUsed,
      contentSource: articleBody && articleBody.length > 400 ? "json_ld" : chosen.contentSource,
      paywallDetected,
      blockedReason,
    };
  } finally {
    clearTimeout(timer);
  }
};

export const extractStructuredSignalsLegacy = (text: string) => {
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

export const extractStructuredSignals = (text: string) => {
  const figures = Array.from(text.matchAll(/\b\d+(?:[.,]\d+)?\s?(?:%|euros?|millones?|miles?|personas?|votos?|anos?|a\u00f1os?|meses?|dias?|d\u00edas?)\b/gi))
    .slice(0, 12)
    .map((match) => ({ value: match[0], context: text.slice(Math.max(0, match.index! - 80), match.index! + 120).trim() }));
  const quotes = Array.from(text.matchAll(/["\u201c\u201d]([^"\u201c\u201d]{25,240})["\u201c\u201d]/g))
    .slice(0, 8)
    .map((match) => ({ quote: match[1] }));
  const entities = Array.from(new Set(Array.from(text.matchAll(/\b[A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00d1][\w\u00c1\u00c9\u00cd\u00d3\u00da\u00d1\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1-]+(?:\s+[A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00d1][\w\u00c1\u00c9\u00cd\u00d3\u00da\u00d1\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1-]+){0,3}\b/g))
    .map((match) => match[0])
    .filter((value) => value.length > 3)))
    .slice(0, 30)
    .map((name) => ({ name }));
  const documents = Array.from(text.matchAll(/\b(?:BOE|informe|sentencia|decreto|ley|resoluci[o\u00f3]n|documento|expediente|contrato|auto judicial)\b[^.]{0,180}/gi))
    .slice(0, 10)
    .map((match) => ({ name: match[0].trim() }));
  const claims = text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => /\b(?:asegura|afirma|denuncia|sostiene|critica|acusa|promete|confirma|niega|advierte|estima)\b/i.test(sentence))
    .slice(0, 12)
    .map((claim) => ({ claim }));

  return { entities, figures, quotes, documents, claims };
};

const normalizeFingerprintToken = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const entityFingerprintFromSignals = (signals: any, title = "") => {
  const entities = Array.isArray(signals?.entities)
    ? signals.entities
        .map((entry: any) => normalizeFingerprintToken(entry?.name || entry))
        .filter((entry: string) => entry.length >= 4)
    : [];
  const titleTokens = [...tokenSet(title)].slice(0, 8);
  return Array.from(new Set([...entities, ...titleTokens])).sort().slice(0, 24).join("|");
};

export const eventSignatureFromArticle = (article: {
  title?: string | null;
  excerpt?: string | null;
  published_at?: string | null;
  structured_data?: any;
}) => {
  const text = normalizeFingerprintToken([article.title, article.excerpt].filter(Boolean).join(" "));
  const coreTerms = [...tokenSet(text)]
    .filter((token) => !["ultima", "directo", "noticia", "noticias", "espana", "mundo"].includes(token))
    .slice(0, 10);
  const date = article.published_at ? new Date(article.published_at) : null;
  const day = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "unknown-day";
  const fingerprint = entityFingerprintFromSignals(article.structured_data || {}, article.title || "");
  return [day, coreTerms.slice(0, 6).sort().join("-"), fingerprint.split("|").slice(0, 6).join("-")]
    .filter(Boolean)
    .join("::")
    .slice(0, 300);
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

// Maps the live source schema (bias_label text / bias int -100..100 / bias_score -2..2)
// onto the 5-bucket Spanish vocabulary the pipeline reasons with.
export const biasBucketOf = (source: any): "izquierda" | "centroizquierda" | "centro" | "centroderecha" | "derecha" => {
  const label = String(source?.bias_label ?? source?.political_lean ?? "").toUpperCase().replace(/\s+/g, "-");
  const byLabel: Record<string, any> = {
    "LEFT": "izquierda", "FAR-LEFT": "izquierda",
    "CENTER-LEFT": "centroizquierda", "CENTRE-LEFT": "centroizquierda", "LEAN-LEFT": "centroizquierda",
    "CENTER": "centro", "CENTRE": "centro",
    "CENTER-RIGHT": "centroderecha", "CENTRE-RIGHT": "centroderecha", "LEAN-RIGHT": "centroderecha",
    "RIGHT": "derecha", "FAR-RIGHT": "derecha",
  };
  if (byLabel[label]) return byLabel[label];
  const direct = String(source?.bias ?? "").toLowerCase();
  if (["izquierda", "centroizquierda", "centro", "centroderecha", "derecha"].includes(direct)) return direct as any;
  const n = typeof source?.bias === "number" ? source.bias
    : typeof source?.bias_score === "number" ? source.bias_score * 30
    : null;
  if (n === null) return "centro";
  if (n <= -40) return "izquierda";
  if (n <= -10) return "centroizquierda";
  if (n < 10) return "centro";
  if (n < 40) return "centroderecha";
  return "derecha";
};

export const calculateBiasDistribution = (articles: Array<{ source_id: string | null }>, sourcesMap: Record<string, any>) => {
  const counts = { izquierda: 0, centroizquierda: 0, centro: 0, centroderecha: 0, derecha: 0 };
  let total = 0;
  for (const article of articles) {
    const source = article.source_id ? sourcesMap[article.source_id] : null;
    if (!source) continue;
    counts[biasBucketOf(source)]++;
    total++;
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
