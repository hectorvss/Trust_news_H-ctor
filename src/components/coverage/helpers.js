// ============================================================
// Coverage helpers — label maps, color scales, formatting
// Shared by all coverage analytical components (TNE design language).
// ============================================================

// Granular 5-point lean → Spanish label
export const BIAS_LABEL = {
  LEFT: 'Izquierda',
  LEAN_LEFT: 'Centro-Izq.',
  CENTER: 'Centro',
  LEAN_RIGHT: 'Centro-Der.',
  RIGHT: 'Derecha'
};

// 3-bucket → Spanish label
export const BUCKET_LABEL = { LEFT: 'Izquierda', CENTER: 'Centro', RIGHT: 'Derecha' };

// Grayscale bias palette (matches --bias-* tokens in index.css)
export const BIAS_COLOR = {
  LEFT: '#000000',
  LEAN_LEFT: '#3a3a3a',
  CENTER: '#888888',
  LEAN_RIGHT: '#b8b8b8',
  RIGHT: '#d8d8d8'
};
export const BUCKET_COLOR = { LEFT: '#000000', CENTER: '#888888', RIGHT: '#d8d8d8' };

// Map a granular rating to its 3-bucket
export const normalizeBiasRating = (rating) => {
  const value = String(rating || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-');

  if (['LEFT', 'FAR-LEFT', 'IZQUIERDA'].includes(value)) return 'LEFT';
  if (['LEAN-LEFT', 'CENTER-LEFT', 'CENTRE-LEFT', 'CENTRO-IZQUIERDA', 'CENTROIZQUIERDA'].includes(value)) return 'LEAN_LEFT';
  if (['RIGHT', 'FAR-RIGHT', 'DERECHA'].includes(value)) return 'RIGHT';
  if (['LEAN-RIGHT', 'CENTER-RIGHT', 'CENTRE-RIGHT', 'CENTRO-DERECHA', 'CENTRODERECHA'].includes(value)) return 'LEAN_RIGHT';
  return 'CENTER';
};

export const toBucket = (rating) => {
  const normalized = normalizeBiasRating(rating);
  return ['LEFT', 'LEAN_LEFT'].includes(normalized) ? 'LEFT'
  : ['RIGHT', 'LEAN_RIGHT'].includes(normalized) ? 'RIGHT'
  : 'CENTER';
};

// Factuality canonical → Spanish label + ordered scale (high→low)
export const FACTUALITY_LABEL = {
  VERY_HIGH: 'Muy alta',
  HIGH: 'Alta',
  MIXED: 'Mixta',
  LOW: 'Baja',
  VERY_LOW: 'Muy baja',
  UNKNOWN: 'Sin dato'
};
export const FACTUALITY_ORDER = ['VERY_HIGH', 'HIGH', 'MIXED', 'LOW', 'VERY_LOW', 'UNKNOWN'];
export const FACTUALITY_COLOR = {
  VERY_HIGH: '#000000',
  HIGH: '#444444',
  MIXED: '#999999',
  LOW: '#c4c4c4',
  VERY_LOW: '#e2e2e2',
  UNKNOWN: '#f0f0f0'
};

// Ownership category → Spanish label
export const OWNERSHIP_LABEL = {
  CONGLOMERATE: 'Conglomerado',
  INDEPENDENT: 'Independiente',
  PUBLIC: 'Público / Estatal',
  NONPROFIT: 'Sin ánimo de lucro',
  PRIVATE: 'Privado',
  UNKNOWN: 'Sin dato'
};
export const OWNERSHIP_ORDER = ['CONGLOMERATE', 'PRIVATE', 'INDEPENDENT', 'PUBLIC', 'NONPROFIT', 'UNKNOWN'];
export const OWNERSHIP_COLOR = {
  CONGLOMERATE: '#000000',
  PRIVATE: '#3a3a3a',
  INDEPENDENT: '#777777',
  PUBLIC: '#a8a8a8',
  NONPROFIT: '#cccccc',
  UNKNOWN: '#ececec'
};

// "hace X" relative time in Spanish
export const relativeTime = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora mismo';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

// Convert a counts object {KEY: n} into ordered [{key,label,color,count,pct}]
export const toSegments = (breakdown = {}, order, labelMap, colorMap) => {
  const total = Object.values(breakdown).reduce((a, b) => a + (b || 0), 0) || 0;
  return order
    .filter(k => (breakdown[k] || 0) > 0)
    .map(k => ({
      key: k,
      label: labelMap[k] || k,
      color: colorMap[k] || '#999',
      count: breakdown[k] || 0,
      pct: total > 0 ? Math.round(((breakdown[k] || 0) / total) * 100) : 0
    }));
};
