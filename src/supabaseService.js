import { supabase } from './supabaseClient';

// ==========================================
// READING HISTORY
// ==========================================================

export const logReading = async (userId, storyId) => {
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
    time: s.time_label,
    image: s.image_url,
    sourceCount: s.source_count,
    fullContent: s.full_content,
    summary: s.summary,
    perspectivasInfo: s.perspectivas_info,
    cronologiaInfo: s.cronologia_info,
    // Handle jsonb arrays for social/systemic impact if they come as arrays
    impactoSocial: Array.isArray(s.impacto_social) ? s.impacto_social.join('\n') : (s.impacto_social || ''),
    impactoSistemico: Array.isArray(s.impacto_sistemico) ? s.impacto_sistemico.join('\n') : (s.impacto_sistemico || ''),
    consensoNarrativo: s.consenso_narrativo,
    factCheck: s.fact_check,
    blindSpot: s.blind_spot,
    factuality: s.factuality,
    analyticalSnippet: s.analytical_snippet,
    contexto: s.contexto,
    desglose: Array.isArray(s.desglose) ? s.desglose.join('\n') : (s.desglose || ''),
    cifrasClave: Array.isArray(s.cifras_clave) ? s.cifras_clave : [],
    verificacionInfo: s.verificacion_info || '',
    origenInfo: Array.isArray(s.origen_info) ? s.origen_info : [],
    mediosAnalizados: Array.isArray(s.medios_analizados) ? s.medios_analizados : [],
    documentosInfo: Array.isArray(s.documentos_info) ? s.documentos_info : [],
    protagonistasInfo: s.protagonistas_info || { beneficiados: '', afectados: '' },
    preguntasInfo: Array.isArray(s.preguntas_info) ? s.preguntas_info : []
  };
};

export const fetchStories = async (category = 'TODO') => {
  let query = supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (category !== 'TODO' && category !== 'PARA TI') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
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
// PROFILE & SETTINGS (User Level)
// ==========================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateUserSettings = async (userId, settings) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      settings: settings, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }
  return data;
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
