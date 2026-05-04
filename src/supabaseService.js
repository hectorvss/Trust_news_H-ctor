import { supabase } from './supabaseClient';

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
  return {
    ...s,
    id: s.id,
    title: s.title,
    summary: s.summary,
    category: s.category || 'SOCIAL',
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
    factCheck: s.fact_check,
    blindSpot: s.blind_spot,
    mediosAnalizados: Array.isArray(s.medios_analizados) ? s.medios_analizados : [],
    documentosInfo: Array.isArray(s.documentos_info) ? s.documentos_info : [],
    protagonistasInfo: s.protagonistas_info || { beneficiados: '', afectados: '' },
    preguntasInfo: Array.isArray(s.preguntas_info) ? s.preguntas_info : []
  };
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
    query = query.ilike('category', category);
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
    category: storyData.category,
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
