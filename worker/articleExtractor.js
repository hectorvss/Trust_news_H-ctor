// Extracts Open Graph / meta tag metadata from article URLs.
// Only public metadata is fetched — NO full article content stored (legal compliance).

const FETCH_TIMEOUT_MS = 8000;
const EXCERPT_MAX_CHARS = 300;

function log(msg) {
  const t = new Date().toTimeString().slice(0, 8);
  console.log(`[${t}] [articleExtractor] ${msg}`);
}

function extractMeta(html, property) {
  // Matches both property= and name= forms
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>` +
    '|' +
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["'][^>]*>`,
    'i'
  );
  const match = html.match(re);
  return match ? (match[1] || match[2] || '').trim() : null;
}

function truncate(str, max) {
  if (!str) return null;
  return str.length > max ? str.slice(0, max) : str;
}

export async function extractArticleMetadata(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrustNewsBot/1.0; +https://trustnews.es/bot)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
    });

    if (!res.ok) {
      log(`HTTP ${res.status} for ${url}`);
      return null;
    }

    // Only read the <head> section to avoid downloading huge bodies
    // We read up to 16 KB which is more than enough for meta tags
    const reader = res.body.getReader();
    let html = '';
    let done = false;
    while (!done && html.length < 16384) {
      const chunk = await reader.read();
      done = chunk.done;
      if (chunk.value) html += new TextDecoder().decode(chunk.value);
      // Stop once we hit </head> or <body>
      if (/<\/head>|<body[\s>]/i.test(html)) break;
    }
    reader.cancel().catch(() => {});

    const title = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
    const description = extractMeta(html, 'og:description') || extractMeta(html, 'twitter:description') || extractMeta(html, 'description');
    const imageUrl = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image');
    const author = extractMeta(html, 'article:author') || extractMeta(html, 'author');
    const publishedRaw = extractMeta(html, 'article:published_time') || extractMeta(html, 'article:modified_time');

    let publishedAt = null;
    if (publishedRaw) {
      const d = new Date(publishedRaw);
      if (!isNaN(d.getTime())) publishedAt = d.toISOString();
    }

    return {
      title: title || null,
      author: author || null,
      publishedAt,
      imageUrl: imageUrl || null,
      excerpt: truncate(description, EXCERPT_MAX_CHARS),
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      log(`TIMEOUT for ${url}`);
    } else {
      log(`ERROR for ${url}: ${err.message}`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
