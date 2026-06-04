import { supabase } from './supabaseClient';

const CATEGORY_ALIASES = {
  'ECONOMÍA': ['ECONOMÍA', 'FINANZAS'],
  'SOCIEDAD': ['SOCIEDAD', 'SOCIAL'],
  'DEPORTES': ['DEPORTES', 'DEPORTE'],
};

export const normalizeCategory = (value) => {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return 'SOCIEDAD';
  if (raw === 'FINANZAS') return 'ECONOMÍA';
  if (raw === 'SOCIAL') return 'SOCIEDAD';
  if (raw === 'DEPORTE') return 'DEPORTES';
  return raw;
};

const categoryQueryValues = (value) => {
  const canonical = normalizeCategory(value);
  return CATEGORY_ALIASES[canonical] || [canonical];
};

// ==========================================
// READING HISTORY
// ==========================================================

export const logReading = async (userId, storyId) => {
  // Legacy history log kept for UI display, but now we should also trigger usage tracking separately
  try {
    const { error } = await supabase
      .from('reading_history')
      .upsert({
        user_id: userId,
        story_id: String(storyId),
        read_at: new Date().toISOString()
      }, { onConflict: 'user_id, story_id' });

    if (error && error.code !== '23503') { // Ignore foreign key violation for mock stories
      console.error('Error logging reading:', error);
    }
  } catch (e) {
    // Silent fail
  }
};

// ==========================================
// SUBSCRIPTION USAGE TRACKING
// ==========================================

export const getSessionId = () => {
  let sessionId = localStorage.getItem('tne_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10) + '-' + Date.now();
    localStorage.setItem('tne_session_id', sessionId);
  }
  return sessionId;
};

export const pingUsage = async (userId, storyId, readSeconds = 0, biasCategory = null, sourceName = null) => {
  const sessionId = getSessionId();
  try {
    // 1. Log generic usage for limits
    const { error: usageError } = await supabase.rpc('log_article_read', {
      p_session_id: sessionId,
      p_user_id: userId || null,
      p_story_id: String(storyId),
      p_read_seconds: readSeconds
    });

    if (usageError) console.error('Error tracking usage:', usageError);

    // 2. Log bias data if provided (real-time analysis)
    if (biasCategory && readSeconds > 0) {
      const { error: biasError } = await supabase.rpc('log_bias_read', {
        p_session_id: sessionId,
        p_user_id: userId || null,
        p_story_id: String(storyId),
        p_bias_category: biasCategory,
        p_source_name: sourceName || 'Unknown',
        p_seconds_read: readSeconds
      });
      if (biasError) console.error('Error tracking bias:', biasError);
    }
  } catch (err) {
    console.error('Error ping usage:', err);
  }
};

export const getBiasStats = async (userId, days = null) => {
  const sessionId = getSessionId();
  try {
    let query = supabase.from('bias_logs').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }
    if (days) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', since);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) return null;

    const totalSeconds = data.reduce((acc, log) => acc + (log.seconds_read || 0), 0);
    const biasCounts = data.reduce((acc, log) => {
      if (log.bias_category) acc[log.bias_category] = (acc[log.bias_category] || 0) + 1;
      return acc;
    }, {});

    const sourceCounts = data.reduce((acc, log) => {
      if (log.source_name) acc[log.source_name] = (acc[log.source_name] || 0) + 1;
      return acc;
    }, {});

    const uniqueSources = Object.keys(sourceCounts).length;
    const totalBias = Object.values(biasCounts).reduce((a, b) => a + b, 0) || 1;
    const maxBias = Math.max(...Object.values(biasCounts), 0);
    const diversityFromBias = Math.round((1 - maxBias / totalBias) * 150);
    const diversityFromSources = Math.min(100, Math.round((uniqueSources / 10) * 100));
    const diversity = Math.min(100, Math.max(diversityFromBias, diversityFromSources));

    return {
      total_articles: new Set(data.map(l => l.story_id)).size,
      bias_distribution: biasCounts,
      top_sources: Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / data.length) * 100) })),
      diversity_pct: diversity,
      total_seconds: totalSeconds,
      unique_sources: uniqueSources,
    };
  } catch (err) {
    console.error('Error fetching bias stats:', err);
    return null;
  }
};


export const getUsageMetrics = async (userId) => {
  const sessionId = getSessionId();
  let query = supabase.from('usage_metrics').select('*');
  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error('Error fetching usage metrics:', error);
    return null;
  }
  return data || { articles_read: 0, reading_seconds: 0, read_article_ids: [] };
};


export const getReadingHistory = async (userId) => {
  const { data, error } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', userId)
    .order('read_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching reading history:', error);
    return [];
  }
  return data || [];
};

// Mapper to convert DB snake_case to Frontend camelCase
const mapStory = (s) => {
  if (!s) return null;
  // Derived coverage from the real pipeline columns (coverage_left/center/right).
  // Normalizing the three values works whether they are counts or percentages.
  const _cl = Number(s.coverage_left) || 0, _cc = Number(s.coverage_center) || 0, _cr = Number(s.coverage_right) || 0;
  const _sum = _cl + _cc + _cr;
  const _articlesLen = Array.isArray(s.articles) ? s.articles.length : 0;
  // sources_count is the pipeline figure; editorial stories carry source_count
  // instead (sources_count = 0, NOT null), so coalesce on truthiness — `??`
  // would wrongly keep the 0 and zero out totalSources for every editorial story.
  const _total = s.sources_count || s.source_count || _articlesLen || 0;
  // Coverage distribution: prefer the pipeline columns (coverage_left/center/right);
  // fall back to the editorial `bias` jsonb the manager curates by hand, so manually
  // edited stories still render their bias bar (they have no coverage_* data).
  let _dist = null;
  if (_sum > 0) {
    _dist = { left: Math.round(_cl / _sum * 100), center: Math.round(_cc / _sum * 100), right: Math.round(_cr / _sum * 100) };
  } else if (s.bias && typeof s.bias === 'object') {
    const _bl = Number(s.bias.left) || 0, _bc = Number(s.bias.center) || 0, _br = Number(s.bias.right) || 0;
    const _bsum = _bl + _bc + _br;
    if (_bsum > 0) _dist = { left: Math.round(_bl / _bsum * 100), center: Math.round(_bc / _bsum * 100), right: Math.round(_br / _bsum * 100) };
  }
  const _lean = _dist
    ? (_dist.left >= _dist.center && _dist.left >= _dist.right ? 'LEFT' : (_dist.right >= _dist.center ? 'RIGHT' : 'CENTER'))
    : null;
  return {
    ...s,
    id: s.id,
    title: s.title,
    summary: s.summary,
    category: normalizeCategory(s.category || 'SOCIEDAD'),
    image: s.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
    time: s.time_label || 'recientemente',
    location: s.location || 'España',
    sourceCount: s.source_count || 0,
    bias: s.bias || { left: 33, center: 33, right: 34 },
    factuality: s.factuality || 'ALTA',
    consensus: s.consensus || 'MEDIO',
    impact: s.impact || 'ALTO',
    analyticalSnippet: s.analytical_snippet || s.summary,
    contexto: s.contexto,
    desglose: Array.isArray(s.desglose) ? s.desglose.join('\n') : (s.desglose || ''),
    cifrasClave: Array.isArray(s.cifras_clave) ? s.cifras_clave : [],
    verificacionInfo: s.verificacion_info || '',
    origenInfo: Array.isArray(s.origen_info) ? s.origen_info : [],
    fullContent: s.full_content,
    perspectivasInfo: s.perspectivas_info,
    cronologiaInfo: s.cronologia_info,
    impactoSocial: Array.isArray(s.impacto_social) ? s.impacto_social.join('\n') : (s.impacto_social || ''),
    impactoSistemico: Array.isArray(s.impacto_sistemico) ? s.impacto_sistemico.join('\n') : (s.impacto_sistemico || ''),
    consensoNarrativo: s.consenso_narrativo,
    generationMetadata: s.generation_metadata || {},
    editorialValidation: s.editorial_validation || {},
    factCheck: s.fact_check,
    blindSpot: s.blind_spot,
    mediosAnalizados: Array.isArray(s.medios_analizados) ? s.medios_analizados : [],
    documentosInfo: Array.isArray(s.documentos_info) ? s.documentos_info : [],
    protagonistasInfo: s.protagonistas_info || { beneficiados: '', afectados: '' },
    preguntasInfo: Array.isArray(s.preguntas_info) ? s.preguntas_info : [],
    // ── Derived coverage fields consumed by StoryCard / StoryDetail / coverage UI ──
    totalSources: _total,
    biasDistribution: _dist,
    leaningLeft: _dist ? Math.round(_dist.left / 100 * _total) : 0,
    leaningCenter: _dist ? Math.round(_dist.center / 100 * _total) : 0,
    leaningRight: _dist ? Math.round(_dist.right / 100 * _total) : 0,
    dominantLean: _lean,
    dominantLeanPct: _dist ? Math.max(_dist.left, _dist.center, _dist.right) : 0,
    factualityBreakdown: {},
    ownershipBreakdown: {},
    coverageUpdatedAt: s.pipeline_generated_at || s.updated_at || null
  };
};

// ── Sources catalog (consumed by Discover + per-article enrichment in StoryDetail) ──
// Bound to the LIVE schema: nombre/name, bias_label/bias_score, ownership, activo.
let _sourcesCache = null;

export const fetchSources = async (force = false) => {
  if (_sourcesCache && !force) return _sourcesCache;
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true });
  if (error) {
    console.error('Error fetching sources:', error);
    return [];
  }
  // The live catalog contains duplicate rows per outlet — dedupe by display name.
  const seen = new Set();
  _sourcesCache = (data || []).filter(s => {
    const key = (s.nombre || s.name || s.id || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return _sourcesCache;
};

// Normalize the live bias representation (numeric bias_score / text bias_label) to
// the 5-point vocabulary the coverage UI expects.
const _biasFromSource = (s) => {
  const score = typeof s.bias_score === 'number' ? s.bias_score : null;
  if (score !== null) {
    return score <= -2 ? 'LEFT' : score === -1 ? 'LEAN_LEFT' : score === 0 ? 'CENTER' : score === 1 ? 'LEAN_RIGHT' : 'RIGHT';
  }
  const value = String(s.bias_label || s.political_lean || s.bias || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-');
  return {
    'LEFT': 'LEFT', 'IZQUIERDA': 'LEFT',
    'CENTER-LEFT': 'LEAN_LEFT', 'LEAN-LEFT': 'LEAN_LEFT', 'LEAN_LEFT': 'LEAN_LEFT', 'CENTRO-IZQUIERDA': 'LEAN_LEFT', 'CENTROIZQUIERDA': 'LEAN_LEFT',
    'CENTER': 'CENTER', 'CENTRO': 'CENTER',
    'CENTER-RIGHT': 'LEAN_RIGHT', 'LEAN-RIGHT': 'LEAN_RIGHT', 'LEAN_RIGHT': 'LEAN_RIGHT', 'CENTRO-DERECHA': 'LEAN_RIGHT', 'CENTRODERECHA': 'LEAN_RIGHT',
    'RIGHT': 'RIGHT', 'DERECHA': 'RIGHT'
  }[value] || 'CENTER';
};

export const mapSource = (s) => {
  if (!s) return null;
  const biasRating = _biasFromSource(s);
  const biasBucket = ['LEFT', 'LEAN_LEFT'].includes(biasRating) ? 'LEFT'
    : ['RIGHT', 'LEAN_RIGHT'].includes(biasRating) ? 'RIGHT' : 'CENTER';
  let domain = null;
  try { if (s.url) domain = new URL(s.url).hostname.replace(/^www\./, ''); } catch { /* ignore */ }
  return {
    id: s.id,
    name: s.nombre || s.name || s.id,
    domain,
    logoUrl: s.logo_url || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null),
    biasRating,
    biasLabel: s.bias_label || s.political_lean || s.bias || biasRating,
    biasBucket,
    factuality: s.factuality,
    ownershipName: s.ownership || null,
    ownershipCategory: s.tipo || null,
    country: s.country || s.pais
  };
};

export const buildSourceIndex = async () => {
  const list = await fetchSources();
  const idx = {};
  list.forEach(s => {
    const m = mapSource(s);
    const name = s.nombre || s.name;
    if (name) idx[name.toLowerCase()] = m;
    if (s.id) idx[String(s.id).toLowerCase()] = m;
  });
  return idx;
};

export const searchStories = async (query) => {
  const term = query?.trim();
  if (!term) return [];

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${term}%,summary.ilike.%${term}%,category.ilike.%${term}%,location.ilike.%${term}%`)
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) {
    console.error('Error searching stories:', error);
    return [];
  }
  return (data || []).map(mapStory);
};

export const fetchStories = async (category = 'TODO') => {
  let query = supabase
    .from('stories')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (category !== 'TODO' && category !== 'PARA TI' && category !== 'PARA_TI' && category) {
    query = query.in('category', categoryQueryValues(category));
  }

  let { data, error } = await query;

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  // Secondary client-side sort as safety measure
  if (data) {
    data = data.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    });
  }

  return (data || []).map(mapStory);
};

export const fetchStoryById = async (id) => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching story detail:', error);
    return null;
  }
  return mapStory(data);
};

// ==========================================
// APP CONFIG (Global Level)
// ==========================================

export const fetchAppConfig = async () => {
  const { data, error } = await supabase
    .from('app_config')
    .select('*')
    .eq('id', 'global_sidebar')
    .single();

  if (error) {
    console.error('Error fetching app config:', error);
    return null;
  }
  return data;
};

export const updateAppConfig = async (configData) => {
  const { data, error } = await supabase
    .from('app_config')
    .update(configData)
    .eq('id', 'global_sidebar')
    .select()
    .single();

  if (error) {
    console.error('Error updating app config:', error);
    return null;
  }
  return data;
};

// ==========================================
// SPECIAL SECTIONS (Front-page editorial blocks)
// ==========================================

export const fetchSpecialSections = async () => {
  const { data, error } = await supabase
    .from('special_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching special sections:', error);
    return [];
  }
  return data || [];
};

export const saveSpecialSection = async (section) => {
  if (section.id) {
    const { data, error } = await supabase
      .from('special_sections')
      .update(section)
      .eq('id', section.id)
      .select()
      .single();
    if (error) { console.error('Error updating special section:', error); return null; }
    return data;
  } else {
    const { data, error } = await supabase
      .from('special_sections')
      .insert(section)
      .select()
      .single();
    if (error) { console.error('Error inserting special section:', error); return null; }
    return data;
  }
};

export const deleteSpecialSection = async (id) => {
  const { error } = await supabase
    .from('special_sections')
    .delete()
    .eq('id', id);
  if (error) { console.error('Error deleting special section:', error); return false; }
  return true;
};

// ==========================================
// EDITORIAL STORIES (MANAGER)
// ==========================================

export const saveStory = async (storyData) => {
  // Convert camelCase frontend mapped object back to snake_case
  const dbPayload = {
    title: storyData.title,
    category: normalizeCategory(storyData.category),
    summary: storyData.summary || '',
    time_label: storyData.time || storyData.time_label || 'Reciente',
    image_url: storyData.image || storyData.image_url || '',
    source_count: storyData.sourceCount || storyData.source_count || (storyData.articles ? storyData.articles.length : 1),
    full_content: storyData.fullContent || storyData.full_content || '',
    location: storyData.location || 'España',
    bias: storyData.bias || { left: 33, center: 34, right: 33 },
    consensus: storyData.consensus || 'MEDIO',
    impact: storyData.impact || 'ALTO',
    factuality: storyData.factuality || 'ALTA',
    perspectivas_info: storyData.perspectivasInfo || storyData.perspectivas_info || null,
    cronologia_info: storyData.cronologiaInfo || storyData.cronologia_info || null,
    impacto_social: typeof storyData.impactoSocial === 'string' ? storyData.impactoSocial.split('\n').filter(l => l.trim()) : (storyData.impacto_social || []),
    impacto_sistemico: typeof storyData.impactoSistemico === 'string' ? storyData.impactoSistemico.split('\n').filter(l => l.trim()) : (storyData.impacto_sistemico || []),
    consenso_narrativo: storyData.consensoNarrativo || storyData.consenso_narrativo || null,
    fact_check: storyData.factCheck || storyData.fact_check || null,
    blind_spot: storyData.blindSpot || storyData.blind_spot || null,
    articles: storyData.articles || [],
    analytical_snippet: storyData.analyticalSnippet || storyData.analytical_snippet || null,
    contexto: storyData.contexto || null,
    desglose: typeof storyData.desglose === 'string' ? storyData.desglose.split('\n').filter(l => l.trim()) : (storyData.desglose || []),
    // New analytical fields
    cifras_clave: storyData.cifrasClave || [],
    verificacion_info: storyData.verificacionInfo || null,
    origen_info: storyData.origenInfo || [],
    medios_analizados: storyData.mediosAnalizados || [],
    documentos_info: storyData.documentosInfo || [],
    protagonistas_info: storyData.protagonistasInfo || { beneficiados: '', afectados: '' },
    preguntas_info: storyData.preguntasInfo || []
  };

  try {
    let result;
    if (storyData.id) {
      result = await supabase
        .from('stories')
        .update({ ...dbPayload, updated_at: new Date().toISOString() })
        .eq('id', storyData.id)
        .select()
        .single();
    } else {
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      result = await supabase
        .from('stories')
        .insert({ ...dbPayload, id: newId, created_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return mapStory(result.data);
  } catch (err) {
    console.error('CRITICAL: Error in saveStory ->', err);
    return null;
  }
};

export const updateStoryArticles = async (storyId, articles) => {
  const { data, error } = await supabase
    .from('stories')
    .update({ articles, source_count: articles.length, updated_at: new Date().toISOString() })
    .eq('id', storyId)
    .select()
    .single();
  if (error) { console.error('Error updating articles:', error); return null; }
  return mapStory(data);
};

export const deleteStory = async (storyId) => {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (error) {
    console.error('Error deleting story:', error);
    return false;
  }
  return true;
};

// ==========================================
// NOTIFICATIONS (in-app)
// ==========================================

export const getNotifications = async (userId, limit = 30) => {
  if (!userId) return [];
  // Fetch user-specific + broadcast notifications
  const { data: notifs, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  // Fetch read receipts for broadcasts (broadcasts are unread per-user)
  const broadcastIds = (notifs || []).filter(n => !n.user_id).map(n => n.id);
  let readSet = new Set();
  if (broadcastIds.length > 0) {
    const { data: reads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', userId)
      .in('notification_id', broadcastIds);
    readSet = new Set((reads || []).map(r => r.notification_id));
  }

  return (notifs || []).map(n => ({
    ...n,
    is_read: n.user_id ? n.is_read : readSet.has(n.id),
    is_broadcast: !n.user_id
  }));
};

export const getUnreadNotificationCount = async (userId) => {
  if (!userId) return 0;
  const list = await getNotifications(userId, 50);
  return list.filter(n => !n.is_read).length;
};

export const markNotificationRead = async (userId, notification) => {
  if (!userId || !notification) return;
  if (notification.is_broadcast) {
    await supabase
      .from('notification_reads')
      .upsert({ user_id: userId, notification_id: notification.id }, { onConflict: 'user_id, notification_id' });
  } else {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id)
      .eq('user_id', userId);
  }
};

export const markAllNotificationsRead = async (userId, notifications) => {
  if (!userId) return;
  await Promise.all((notifications || []).filter(n => !n.is_read).map(n => markNotificationRead(userId, n)));
};

export const createNotification = async ({ userId = null, type = 'info', title, message = '', link = '' }) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, message, link })
    .select()
    .single();
  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }
  return data;
};

export const fetchAllNotifications = async (limit = 100) => {
  // Manager-only: list all notifications regardless of audience
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('Error fetching all notifications:', error); return []; }
  return data || [];
};

export const deleteNotification = async (id) => {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) { console.error('Error deleting notification:', error); return false; }
  return true;
};

// ==========================================
// NEWSLETTER
// ==========================================

export const subscribeToNewsletter = async ({ email, fullName = null, frequency = 'weekly', userId = null, source = 'footer' }) => {
  if (!email) return { error: 'Email obligatorio' };
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert({
      email: email.toLowerCase().trim(),
      full_name: fullName,
      frequency,
      user_id: userId,
      source,
      is_active: true,
      unsubscribed_at: null
    }, { onConflict: 'email' })
    .select()
    .single();
  if (error) {
    console.error('Error subscribing to newsletter:', error);
    return { error: error.message };
  }
  return { data };
};

export const fetchNewsletterSubscribers = async () => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching subscribers:', error); return []; }
  return data || [];
};

export const updateSubscriberStatus = async (id, isActive) => {
  const payload = { is_active: isActive };
  if (!isActive) payload.unsubscribed_at = new Date().toISOString();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update(payload)
    .eq('id', id);
  if (error) { console.error('Error updating subscriber:', error); return false; }
  return true;
};

// ==========================================
// ADMIN: USERS PANEL
// ==========================================

export const fetchAdminUsers = async () => {
  const { data, error } = await supabase
    .from('admin_users_overview')
    .select('*')
    .order('signed_up_at', { ascending: false });
  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
  return data || [];
};

export const updateUserRole = async (userId, role) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) { console.error('Error updating role:', error); return false; }
  return true;
};

export const updateUserSubscriptionTier = async (userId, tier) => {
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) { console.error('Error updating subscription tier:', error); return false; }
  return true;
};

// ==========================================
// IMAGE UPLOAD (Storage)
// ==========================================

export const uploadStoryImage = async (storyId, file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${storyId}/cover.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('story-images')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('story-images').getPublicUrl(path);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) return null;

  const { error: dbError } = await supabase
    .from('stories')
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', storyId);

  if (dbError) {
    console.error('Error saving image_url to story:', dbError);
    return null;
  }

  return publicUrl;
};

// ==========================================
// PROFILE & SETTINGS (User Level)
// ==========================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, subscription_tier')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      ...profileData,
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
};

export const updateUserSettings = async (userId, settings) => {
  return updateProfile(userId, { settings });
};

// ==========================================
// FAVORITES (User Level)
// ==========================================

export const getFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  // Batch fetch full story data where available
  const storyIds = data.map(f => f.story_id);
  const { data: storiesData } = await supabase
    .from('stories')
    .select('*')
    .in('id', storyIds);
  
  const storiesMap = new Map((storiesData || []).map(s => [s.id, mapStory(s)]));
  
  return data.map(fav => {
    const story = storiesMap.get(fav.story_id);
    if (story) {
      return { ...story, story_id: fav.story_id };
    }
    // Fallback to denormalized data stored in favorite record
    return {
      id: fav.story_id,
      story_id: fav.story_id,
      title: fav.story_title || 'Noticia guardada',
      time: 'Reciente',
      image: fav.story_image,
      location: fav.story_category || 'España',
      bias: { left: 33, center: 34, right: 33 },
      consensus: 'MEDIO',
      impact: 'ALTO',
      sourceCount: 1
    };
  });
};

export const addFavorite = async (userId, story) => {
  const { data, error } = await supabase
    .from('favorites')
    .upsert({
      user_id: userId,
      story_id: String(story.id || story.story_id),
      story_title: story.title || story.story_title || 'Guardada',
      story_category: story.location || story.category || story.story_category || 'España',
      story_image: story.image || story.story_image || ''
    }, { onConflict: 'user_id, story_id' })
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
  return data;
};

export const removeFavorite = async (userId, storyId) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .match({ user_id: userId, story_id: storyId });

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
  return true;
};

// ==========================================
// PIPELINE REVIEW QUEUE (A.11)
// ==========================================

export const fetchPipelineDrafts = async () => {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, category, summary, image_url, source_count, sources_count, coverage_left, coverage_center, coverage_right, consensus_narrative, consenso_narrativo, blind_spot, cifras_clave, verificacion_info, articles, medios_analizados, generated_at, pipeline_generated_at, cluster_status, review_status, editorial_validation, generation_metadata, is_auto_generated, pipeline_cluster_id, cluster_id')
    .eq('status', 'draft')
    .eq('is_auto_generated', true)
    .order('source_count', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching pipeline drafts:', error);
    return [];
  }
  return (data || []).map((story) => ({
    ...story,
    category: normalizeCategory(story.category),
  }));
};

const validateDraftForApproval = (story) => {
  const missing = [];
  const articles = Array.isArray(story?.articles) ? story.articles : [];
  const figures = Array.isArray(story?.cifras_clave) ? story.cifras_clave : [];
  const coverage = Number(story?.coverage_left || 0) + Number(story?.coverage_center || 0) + Number(story?.coverage_right || 0);
  const validation = story?.editorial_validation || {};
  const metadata = story?.generation_metadata || {};
  const llm = metadata.llm || {};
  const segmentSummary = validation.segment_summary || metadata.segment_summary || {};
  const evidenceScore = Number(metadata?.evidence?.quality?.overall_score ?? metadata?.evidence_quality?.overall_score ?? 1);
  if (!story?.title) missing.push('title');
  if (!story?.summary) missing.push('summary');
  if (!articles.length) missing.push('articles');
  if (coverage <= 0) missing.push('coverage');
  if (!(story?.consensus_narrative || story?.consenso_narrativo)) missing.push('consensus_narrative');
  if (!figures.length && !story?.verificacion_info) missing.push('cifras_clave_or_verificacion_info');
  if (story?.review_status === 'analysis_failed') missing.push('analysis_failed');
  if (validation.ready === false) missing.push(...(validation.missing || ['editorial_validation']));
  if (Array.isArray(validation.errors) && validation.errors.length) missing.push('schema_errors');
  if (llm.status && llm.status !== 'completed') missing.push('llm_not_completed');
  if (evidenceScore < 0.35 && !(metadata.missing_evidence || []).length) missing.push('weak_evidence_without_explanation');
  if (figures.some((figure) => figure?.value && !(figure.source_article_id || figure.article_id))) missing.push('unreferenced_figures');
  if ((segmentSummary?.core_missing_count || 0) > 0 || (segmentSummary?.core_partial_count || 0) > 0) missing.push('segmentos_incompletos');
  return { ready: missing.length === 0, missing };
};

export const approveDraftStory = async (storyId) => {
  const { data: draft, error: fetchError } = await supabase
    .from('stories')
    .select('id, title, summary, coverage_left, coverage_center, coverage_right, consensus_narrative, consenso_narrativo, cifras_clave, verificacion_info, articles, editorial_validation, generation_metadata, review_status')
    .eq('id', storyId)
    .maybeSingle();

  if (fetchError || !draft) {
    console.error('Error loading draft before approval:', fetchError);
    return false;
  }

  const validation = validateDraftForApproval(draft);
  if (!validation.ready) {
    console.error('Draft is not publishable:', validation.missing);
    await supabase
      .from('stories')
      .update({
        review_status: 'analysis_failed',
        editorial_validation: { ready: false, missing: validation.missing, errors: validation.missing, checked_at: new Date().toISOString() },
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId);
    return false;
  }

  const { error } = await supabase
    .from('stories')
    .update({
      status: 'published',
      cluster_status: 'approved',
      review_status: 'approved',
      editorial_validation: { ready: true, missing: [], checked_at: new Date().toISOString() },
      reviewed_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    })
    .eq('id', storyId);

  if (error) {
    console.error('Error approving draft story:', error);
    return false;
  }
  return true;
};

export const rejectDraftStory = async (storyId, reason = '') => {
  const { error } = await supabase
    .from('stories')
    .update({
      status: 'rejected',
      cluster_status: 'rejected',
      review_status: 'rejected',
      pipeline_rejected_reason: reason || null,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', storyId);

  if (error) {
    console.error('Error rejecting draft story:', error);
    return false;
  }
  return true;
};

// ==========================================
// PIPELINE / INGESTION ENGINE — read-only dashboards (Manager)
// Reads the live engine tables: ingestion_jobs, raw_articles, story_clusters,
// sources, stories. NOTE: visibility depends on RLS allowing manager reads on
// these tables (infra/pipeline owns the policies).
// ==========================================

// Aggregate counters for the engine dashboard.
export const fetchPipelineStats = async () => {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const countOf = async (table, build) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count, error } = await q;
    if (error) { console.error(`count ${table}:`, error.message); return 0; }
    return count || 0;
  };

  const [
    sourcesActive, sourcesTotal, rawTotal, rawEmbedded,
    rawExtractionPending, contentExtracted, contentPaywalled, contentBlocked, lowQualityExtractions,
    clusters, refreshPending, draftsPending, draftsReady, draftsFailed, published, jobs24h, jobErr24h
  ] = await Promise.all([
    countOf('sources', q => q.eq('activo', true)),
    countOf('sources'),
    countOf('raw_articles'),
    countOf('raw_articles', q => q.eq('embedded', true)),
    countOf('raw_articles', q => q.in('extraction_status', ['pending', 'failed'])),
    countOf('article_content', q => q.eq('extraction_status', 'completed')),
    countOf('article_content', q => q.eq('paywall_detected', true)),
    countOf('article_content', q => q.not('blocked_reason', 'is', null)),
    countOf('article_content', q => q.lt('extraction_quality_score', 0.35).not('extraction_status', 'eq', 'skipped_policy')),
    countOf('story_clusters'),
    countOf('story_clusters', q => q.eq('status', 'refresh_pending')),
    countOf('stories', q => q.eq('status', 'draft').eq('is_auto_generated', true)),
    countOf('stories', q => q.eq('status', 'draft').eq('is_auto_generated', true).eq('review_status', 'ready_for_review')),
    countOf('stories', q => q.eq('status', 'draft').eq('is_auto_generated', true).eq('review_status', 'analysis_failed')),
    countOf('stories', q => q.eq('status', 'published')),
    countOf('ingestion_jobs', q => q.gte('created_at', since24h)),
    countOf('ingestion_jobs', q => q.gte('created_at', since24h).or('status.eq.failed,status.eq.error')),
  ]);

  let lastIngestAt = null;
  const { data: lastJob } = await supabase
    .from('ingestion_jobs').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (lastJob) lastIngestAt = lastJob.created_at;

  const { data: recentGenerated } = await supabase
    .from('stories')
    .select('generation_metadata, review_status, updated_at')
    .eq('is_auto_generated', true)
    .gte('updated_at', since24h)
    .limit(300);
  const llmStats = (recentGenerated || []).reduce((acc, row) => {
    const llm = row.generation_metadata?.llm || {};
    const usage = llm.token_usage || {};
    const segmentSummary = row.generation_metadata?.segment_summary || row.generation_metadata?.segment_trace?.summary || {};
    acc.inputTokens += Number(usage.input_tokens || 0);
    acc.outputTokens += Number(usage.output_tokens || 0);
    acc.cacheReadTokens += Number(usage.cache_read_input_tokens || 0);
    if (llm.repair_used) acc.repairs += 1;
    if (Array.isArray(llm.validation_errors) && llm.validation_errors.length) acc.schemaFailures += 1;
    if (row.review_status === 'analysis_failed') acc.blockedDrafts += 1;
    if ((segmentSummary?.core_missing_count || 0) > 0 || (segmentSummary?.core_partial_count || 0) > 0) acc.segmentIncomplete += 1;
    return acc;
  }, { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, repairs: 0, schemaFailures: 0, blockedDrafts: 0, segmentIncomplete: 0 });

  const { data: toddyRows } = await supabase
    .from('toddy_messages')
    .select('role, depth, credits_charged, token_usage, status, created_at')
    .gte('created_at', since24h)
    .limit(1000);
  const toddyStats = (toddyRows || []).reduce((acc, row) => {
    if (row.role !== 'assistant') return acc;
    const usage = row.token_usage || {};
    acc.responses += 1;
    acc.credits += Number(row.credits_charged || 0);
    acc.inputTokens += Number(usage.input_tokens || 0);
    acc.outputTokens += Number(usage.output_tokens || 0);
    if (row.credits_charged === 0) acc.free += 1;
    if (row.status === 'low_confidence') acc.lowConfidence += 1;
    if (row.depth) acc.depths[row.depth] = (acc.depths[row.depth] || 0) + 1;
    return acc;
  }, { responses: 0, credits: 0, inputTokens: 0, outputTokens: 0, free: 0, lowConfidence: 0, depths: {} });

  return {
    sourcesActive, sourcesTotal,
    rawTotal, rawEmbedded, rawBacklog: Math.max(0, rawTotal - rawEmbedded), rawExtractionPending,
    contentExtracted, contentPaywalled, contentBlocked, lowQualityExtractions,
    clusters, refreshPending, draftsPending, draftsReady, draftsFailed, published,
    jobs24h, jobErr24h, jobOk24h: Math.max(0, jobs24h - jobErr24h),
    llmTokens24h: llmStats.inputTokens + llmStats.outputTokens,
    llmInputTokens24h: llmStats.inputTokens,
    llmOutputTokens24h: llmStats.outputTokens,
    llmCacheReadTokens24h: llmStats.cacheReadTokens,
    llmRepairs24h: llmStats.repairs,
    llmSchemaFailures24h: llmStats.schemaFailures,
    llmBlockedDrafts24h: llmStats.blockedDrafts,
    llmSegmentIncomplete24h: llmStats.segmentIncomplete,
    toddyResponses24h: toddyStats.responses,
    toddyCredits24h: toddyStats.credits,
    toddyTokens24h: toddyStats.inputTokens + toddyStats.outputTokens,
    toddyFreeUsed24h: toddyStats.free,
    toddyLowConfidence24h: toddyStats.lowConfidence,
    toddyDepthDistribution24h: toddyStats.depths,
    lastIngestAt,
  };
};

// Recent ingestion runs, enriched with the source display name.
export const fetchIngestionJobs = async (limit = 60) => {
  const { data, error } = await supabase
    .from('ingestion_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('fetchIngestionJobs:', error.message); return []; }
  const jobs = data || [];
  const ids = [...new Set(jobs.map(j => j.source_id).filter(Boolean))];
  const nameById = {};
  if (ids.length) {
    const { data: srcs } = await supabase.from('sources').select('id, nombre, name').in('id', ids);
    (srcs || []).forEach(s => { nameById[s.id] = s.nombre || s.name || s.id; });
  }
  return jobs.map(j => ({
    ...j,
    sourceName: nameById[j.source_id] || '—',
    articlesNew: j.articles_new ?? j.articulos_nuevos ?? 0,
    articlesFound: j.articles_found ?? j.articulos_encontrados ?? 0,
    when: j.created_at || j.started_at || null,
  }));
};

// Per-source health (deduped by display name), worst (most errors) first.
export const fetchSourcesHealth = async () => {
  const { data, error } = await supabase
    .from('sources')
    .select('id, nombre, activo, rss_url, error_count, last_checked_at, last_error_at, articles_ingested, political_lean, bias, pais, country, source_status, source_scope, fact_check_score, bias_confidence')
    .order('error_count', { ascending: false, nullsFirst: false });
  if (error) { console.error('fetchSourcesHealth:', error.message); return []; }
  const seen = new Set();
  return (data || []).filter(s => {
    const key = (s.nombre || s.name || s.id || '').toLowerCase();
    if (seen.has(key)) return false; seen.add(key); return true;
  }).map(s => ({
    id: s.id,
    name: s.nombre || s.id,
    active: s.activo ?? false,
    rssUrl: s.rss_url,
    errorCount: s.error_count || 0,
    lastIngestedAt: s.last_checked_at || null,
    ingested: s.articles_ingested || 0,
    biasLabel: s.political_lean || s.bias || null,
    country: s.country || s.pais || null,
    status: s.source_status || null,
    scope: s.source_scope || null,
    factCheckScore: s.fact_check_score ?? null,
    biasConfidence: s.bias_confidence ?? null,
  }));
};

// Clustering: recent clusters with a normalized bias distribution.
export const fetchClusters = async (limit = 80) => {
  const { data, error } = await supabase
    .from('story_clusters')
    .select('id, topic_summary, topic_keywords, article_count, source_count, coverage_left, coverage_center, coverage_right, left_pct, center_pct, right_pct, status, story_id, article_ids, last_seen_at, created_at')
    .order('last_seen_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) { console.error('fetchClusters:', error.message); return []; }
  return (data || []).map(c => {
    const cl = Number(c.coverage_left ?? c.left_pct ?? 0), cc = Number(c.coverage_center ?? c.center_pct ?? 0), cr = Number(c.coverage_right ?? c.right_pct ?? 0);
    const sum = cl + cc + cr;
    return {
      ...c,
      articleCount: c.article_count || (Array.isArray(c.article_ids) ? c.article_ids.length : 0),
      sourceCount: c.source_count || 0,
      keywords: Array.isArray(c.topic_keywords) ? c.topic_keywords : [],
      biasDistribution: sum > 0 ? { left: Math.round(cl / sum * 100), center: Math.round(cc / sum * 100), right: Math.round(cr / sum * 100) } : null,
    };
  });
};

// Raw articles that were grouped into a cluster (pass a cluster object).
export const fetchClusterArticles = async (cluster) => {
  if (!cluster) return [];
  const ids = Array.isArray(cluster.article_ids) ? cluster.article_ids : [];
  let query = supabase.from('raw_articles')
    .select('id, title, titulo, url, excerpt, content_excerpt, summary, source_id, published_at, fecha_publicacion, image_url, imagen_url, bias, language, event_signature, entity_fingerprint, article_content(extraction_quality_score, parser_used, content_source, paywall_detected, blocked_reason)')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(80);
  if (ids.length) query = query.in('id', ids);
  else query = query.eq('cluster_id', cluster.id);
  const { data, error } = await query;
  if (error) { console.error('fetchClusterArticles:', error.message); return []; }
  const sids = [...new Set((data || []).map(a => a.source_id).filter(Boolean))];
  const srcById = {};
  if (sids.length) {
    const { data: srcs } = await supabase.from('sources').select('id, nombre, bias, political_lean, url').in('id', sids);
    (srcs || []).forEach(s => {
      let logoUrl = null;
      try {
        const domain = s.url ? new URL(s.url).hostname.replace(/^www\./, '') : null;
        logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
      } catch { /* ignore */ }
      srcById[s.id] = { name: s.nombre || s.id, biasLabel: s.political_lean || s.bias, logoUrl, url: s.url };
    });
  }
  return (data || []).map(a => {
    const content = Array.isArray(a.article_content) ? a.article_content[0] : a.article_content;
    return ({
    id: a.id,
    title: a.title || a.titulo || '(sin título)',
    url: a.url,
    excerpt: a.excerpt || a.content_excerpt || a.summary || '',
    publishedAt: a.published_at || a.fecha_publicacion || null,
    image: a.image_url || a.imagen_url || null,
    bias: a.bias || null,
    language: a.language || null,
    eventSignature: a.event_signature || null,
    entityFingerprint: a.entity_fingerprint || null,
    extractionQualityScore: content?.extraction_quality_score ?? null,
    parserUsed: content?.parser_used || null,
    contentSource: content?.content_source || null,
    paywallDetected: Boolean(content?.paywall_detected),
    blockedReason: content?.blocked_reason || null,
    source: srcById[a.source_id] || { name: '—' },
    });
  });
};

// Full review payload for one auto-generated draft: the mapped story + its
// cluster + the raw articles that were clustered into it. Powers the review
// dashboard/sidebar where the manager verifies the auto-created story.
export const fetchDraftReview = async (storyId) => {
  const { data: story, error } = await supabase.from('stories').select('*').eq('id', storyId).maybeSingle();
  if (error || !story) { console.error('fetchDraftReview:', error?.message); return null; }
  let cluster = null;
  const clusterId = story.pipeline_cluster_id || story.cluster_id || null;
  if (clusterId) {
    const { data: c } = await supabase.from('story_clusters').select('*').eq('id', clusterId).maybeSingle();
    cluster = c || null;
  }
  const articles = cluster ? await fetchClusterArticles(cluster) : [];
  const generationMetadata = story.generation_metadata || {};
  const clusterAnalysis = cluster?.analysis || {};
  return {
    story: mapStory(story),
    cluster,
    articles,
    trace: {
      generationMetadata,
      editorialValidation: story.editorial_validation || {},
      clusterAnalysis,
      evidence: generationMetadata.evidence || clusterAnalysis.evidence_pack_summary || null,
      evidenceQuality: generationMetadata.evidence_quality || generationMetadata.evidence?.quality || clusterAnalysis.evidence_pack_summary?.quality || null,
      claimsMatrix: generationMetadata.claims_matrix || clusterAnalysis.claims_matrix || [],
      sourceTrace: generationMetadata.source_trace || clusterAnalysis.source_trace || [],
      missingEvidence: generationMetadata.missing_evidence || [],
      segmentTrace: story.editorial_validation?.segment_trace || generationMetadata.segment_trace || clusterAnalysis.segment_trace || [],
      segmentSummary: story.editorial_validation?.segment_summary || generationMetadata.segment_summary || clusterAnalysis.segment_summary || null,
      llm: generationMetadata.llm || {},
    },
  };
};
