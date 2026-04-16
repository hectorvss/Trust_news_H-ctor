import { supabase } from './supabaseClient';

// ==========================================
// FAVORITES
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
  return data || [];
};

export const addFavorite = async (userId, story) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      story_id: story.id,
      story_title: story.title,
      story_category: story.category || null
    })
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
    .eq('user_id', userId)
    .eq('story_id', storyId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
  return true;
};

// ==========================================
// READING HISTORY
// ==========================================

export const logReading = async (userId, storyId) => {
  const { error } = await supabase
    .from('reading_history')
    .insert({
      user_id: userId,
      story_id: storyId
    });

  if (error) {
    console.error('Error logging reading:', error);
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

// ==========================================
// PROFILE
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

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
};
