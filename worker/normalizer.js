import crypto from 'crypto';

// UTM and tracking parameters to strip from URLs
const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'utm_id', 'utm_source_platform', 'fbclid', 'gclid', 'msclkid',
  'ref', 'referrer', 'source', 'mc_cid', 'mc_eid',
];

// Common Spanish words for language detection
const ES_TOKENS = new Set([
  'de', 'la', 'el', 'en', 'y', 'que', 'un', 'una', 'los', 'las',
  'con', 'por', 'para', 'del', 'al', 'se', 'es', 'su', 'lo', 'no',
  'ha', 'una', 'más', 'este', 'esta', 'pero', 'como', 'son', 'sus',
]);

export function normalizeUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);

    // Strip tracking params
    for (const p of TRACKING_PARAMS) {
      u.searchParams.delete(p);
    }

    // Remove fragment
    u.hash = '';

    // Remove trailing slash from pathname (but keep root '/')
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }

    return u.toString();
  } catch {
    return rawUrl;
  }
}

export function urlHash(normalizedUrl) {
  return crypto.createHash('sha256').update(normalizedUrl).digest('hex');
}

function detectLanguage(title, url) {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.endsWith('.es')) return 'es';
  } catch {}

  if (!title) return 'es'; // default to es for this project

  const words = title.toLowerCase().split(/\s+/);
  let esCount = 0;
  for (const w of words) {
    if (ES_TOKENS.has(w)) esCount++;
  }
  // If at least 1 Spanish stopword in title, call it Spanish
  return esCount >= 1 ? 'es' : 'es'; // default es regardless (Spain-focused project)
}

export function normalizeArticle(rawItem, sourceId) {
  const cleanUrl = normalizeUrl(rawItem.url);
  const hash = urlHash(cleanUrl);
  const language = detectLanguage(rawItem.title, cleanUrl);

  return {
    source_id: sourceId,
    url: cleanUrl,
    url_hash: hash,
    title: rawItem.title ? rawItem.title.slice(0, 500) : null,
    excerpt: rawItem.excerpt || null, // already truncated to 300 by rssParser
    author: rawItem.author ? rawItem.author.slice(0, 255) : null,
    published_at: rawItem.publishedAt || null,
    image_url: rawItem.imageUrl ? rawItem.imageUrl.slice(0, 2048) : null,
    language,
    raw_metadata: rawItem.rawMetadata || {},
  };
}

// Returns true if url_hash already exists in raw_articles
export async function isDuplicate(urlHash, supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('raw_articles')
    .select('id')
    .eq('url_hash', urlHash)
    .limit(1)
    .maybeSingle();

  if (error) {
    // On error, assume not duplicate to avoid losing articles
    console.error(`[normalizer] isDuplicate error: ${error.message}`);
    return false;
  }

  return data !== null;
}
