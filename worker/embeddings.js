// Generates vector embeddings using OpenAI text-embedding-3-small (1536 dims)
// If OPENAI_API_KEY is not set, returns null (degraded mode — clustering falls back to Jaccard)

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const MODEL = 'text-embedding-3-small';
const MAX_BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

function log(msg) {
  const t = new Date().toTimeString().slice(0, 8);
  console.log(`[${t}] [embeddings] ${msg}`);
}

function getApiKey() {
  return process.env.OPENAI_API_KEY || null;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function callOpenAI(inputs, attempt = 1) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, input: inputs }),
    });

    if (res.status === 429 || res.status >= 500) {
      if (attempt <= MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        log(`Rate limit / server error (attempt ${attempt}), retrying in ${delay}ms`);
        await sleep(delay);
        return callOpenAI(inputs, attempt + 1);
      }
      throw new Error(`OpenAI API error ${res.status} after ${MAX_RETRIES} retries`);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    // Sort by index to guarantee order matches input order
    return data.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
  } catch (err) {
    if (attempt <= MAX_RETRIES && err.name !== 'AbortError') {
      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      log(`Error (attempt ${attempt}): ${err.message}, retrying in ${delay}ms`);
      await sleep(delay);
      return callOpenAI(inputs, attempt + 1);
    }
    throw err;
  }
}

// Returns a single embedding vector or null
export async function generateEmbedding(text) {
  if (!getApiKey()) return null;
  try {
    const results = await callOpenAI([text]);
    return results ? results[0] : null;
  } catch (err) {
    log(`generateEmbedding failed: ${err.message}`);
    return null;
  }
}

// Returns array of embedding vectors (same order as input) or null
export async function generateBatchEmbeddings(texts) {
  if (!getApiKey()) return null;
  if (!texts || texts.length === 0) return [];

  try {
    const allEmbeddings = [];

    // Process in chunks of MAX_BATCH_SIZE
    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);
      log(`Embedding batch ${Math.floor(i / MAX_BATCH_SIZE) + 1} (${batch.length} texts)`);
      const results = await callOpenAI(batch);
      if (!results) return null;
      allEmbeddings.push(...results);
    }

    return allEmbeddings;
  } catch (err) {
    log(`generateBatchEmbeddings failed: ${err.message}`);
    return null;
  }
}

// Builds the text input for embedding from article fields
export function buildEmbeddingInput(title, excerpt) {
  const parts = [];
  if (title) parts.push(title.trim());
  if (excerpt) parts.push(excerpt.trim());
  return parts.join('. ');
}
