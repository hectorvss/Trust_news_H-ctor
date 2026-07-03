// Empareja un texto editorial (titular destacado, punto ciego, bloque especial)
// con la noticia real más parecida del feed, para que esos bloques —que no
// llevan un story_id fiable— puedan abrir su cobertura correspondiente como
// una noticia normal. Si no hay match razonable, devuelve null y el llamante
// cae a una búsqueda.

const STOP = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'en',
  'a', 'que', 'del', 'al', 'por', 'para', 'con', 'se', 'su', 'sus', 'lo', 'le',
  'es', 'son', 'como', 'mas', 'pero', 'este', 'esta', 'estos', 'estas',
  'the', 'of', 'and', 'to', 'in', 'on', 'for', 'is', 'are',
]);

const tokenize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/**
 * @returns la mejor noticia coincidente, o null si el solape es insuficiente.
 */
export const findStoryByText = (text, stories = []) => {
  const q = tokenize(text);
  if (!q.length || !stories.length) return null;

  const qset = new Set(q);
  let best = null;
  let bestScore = 0;

  for (const s of stories) {
    const hay = tokenize(`${s.title || ''} ${s.summary || ''} ${s.category || ''} ${s.location || ''}`);
    if (!hay.length) continue;
    const hset = new Set(hay);
    let overlap = 0;
    for (const w of qset) if (hset.has(w)) overlap++;
    const score = overlap / qset.size; // fracción de tokens de la consulta hallados
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }

  // Exigir un solape mínimo para no abrir una noticia al azar.
  return bestScore >= 0.34 ? best : null;
};
