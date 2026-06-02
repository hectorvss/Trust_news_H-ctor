// RSS/Atom feed parser using native fetch + manual XML parsing (no external deps)

const FETCH_TIMEOUT_MS = 5000;
const EXCERPT_MAX_CHARS = 300;

function log(msg) {
  const t = new Date().toTimeString().slice(0, 8);
  console.log(`[${t}] [rssParser] ${msg}`);
}

// Extracts content between first matching open/close tag pair
function extractTag(xml, tag) {
  // Try CDATA first: <tag><![CDATA[...]]></tag>
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();

  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(re);
  if (match) return stripHtml(match[1].trim());

  return null;
}

// Extracts an attribute value from a self-closing or opening tag
function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, 'i');
  const match = xml.match(re);
  return match ? match[1].trim() : null;
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function truncate(str, max) {
  if (!str) return null;
  return str.length > max ? str.slice(0, max) : str;
}

// Splits XML into individual item/entry blocks
function splitItems(xml) {
  // RSS 2.0 uses <item>, Atom uses <entry>
  const isAtom = /<feed[\s>]/i.test(xml);
  const tag = isAtom ? 'entry' : 'item';
  const re = new RegExp(`<${tag}[\\s>]([\\s\\S]*?)</${tag}>`, 'gi');
  const items = [];
  let match;
  while ((match = re.exec(xml)) !== null) {
    items.push(match[1]);
  }
  return { items, isAtom };
}

function parseItem(block, isAtom) {
  let url = null;
  let title = null;
  let excerpt = null;
  let author = null;
  let publishedAt = null;
  let imageUrl = null;

  // URL
  if (isAtom) {
    // Atom: <link href="..." rel="alternate"/> or <link href="..."/>
    const linkHref = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
    url = linkHref ? linkHref[1].trim() : extractTag(block, 'link');
  } else {
    // RSS: <link> is a text node (not self-closing)
    url = extractTag(block, 'link');
    // Sometimes <link> is self-closing with href (RSS 1.0 / RDF)
    if (!url) {
      const linkHref = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
      url = linkHref ? linkHref[1].trim() : null;
    }
    // Guid as fallback if it looks like a URL
    if (!url) {
      const guid = extractTag(block, 'guid');
      if (guid && guid.startsWith('http')) url = guid;
    }
  }

  // Title
  title = extractTag(block, 'title');

  // Excerpt: prefer content:encoded, then description/summary/content
  const content = extractTag(block, 'content:encoded') || extractTag(block, 'content') || extractTag(block, 'description') || extractTag(block, 'summary');
  excerpt = content ? truncate(content, EXCERPT_MAX_CHARS) : null;

  // Author
  author = extractTag(block, 'dc:creator') || extractTag(block, 'author') || extractTag(block, 'name');

  // Published date
  const dateRaw = extractTag(block, isAtom ? 'published' : 'pubDate') || extractTag(block, 'updated') || extractTag(block, 'dc:date');
  if (dateRaw) {
    const d = new Date(dateRaw);
    publishedAt = isNaN(d.getTime()) ? null : d.toISOString();
  }

  // Image: enclosure, media:content, media:thumbnail
  const enclosureUrl = extractAttr(block, 'enclosure', 'url');
  const enclosureType = extractAttr(block, 'enclosure', 'type') || '';
  if (enclosureUrl && enclosureType.startsWith('image')) {
    imageUrl = enclosureUrl;
  }
  if (!imageUrl) imageUrl = extractAttr(block, 'media:content', 'url') || extractAttr(block, 'media:thumbnail', 'url');

  return { url, title, excerpt, author, publishedAt, imageUrl, rawMetadata: {} };
}

export async function parseRSSFeed(feedUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TrustNewsBot/1.0 (+https://trustnews.es/bot)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const xml = await res.text();
    const { items, isAtom } = splitItems(xml);

    const parsed = items
      .map(block => parseItem(block, isAtom))
      .filter(item => item.url && item.title); // require at least url + title

    log(`${feedUrl} → ${parsed.length} items (${isAtom ? 'Atom' : 'RSS'})`);
    return parsed;
  } catch (err) {
    if (err.name === 'AbortError') {
      log(`TIMEOUT fetching ${feedUrl}`);
    } else {
      log(`ERROR fetching ${feedUrl}: ${err.message}`);
    }
    return [];
  } finally {
    clearTimeout(timer);
  }
}
