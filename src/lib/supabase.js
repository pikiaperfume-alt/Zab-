import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const STORAGE_BUCKETS = {
  sounds: 'sounds',
  videos: 'videos',
};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[ZAB] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseReady = Boolean(supabase);

export function getSupabaseStorageStatus() {
  return {
    ready: isSupabaseReady,
    url: SUPABASE_URL || '',
    bucketNames: Object.values(STORAGE_BUCKETS),
  };
}

/**
 * Store a wellness companion conversation in Supabase
 * @param {string} userId - unique user identifier
 * @param {Array} messages - conversation history
 * @param {string} mood - current mood
 * @returns {Promise<{id, error}>}
 */
export async function saveConversation(userId, messages, mood) {
  if (!isSupabaseReady) {
    console.warn('[ZAB] Supabase not ready, skipping conversation save');
    return { id: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          messages,
          mood,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('[ZAB] Error saving conversation:', error);
      return { id: null, error: error.message };
    }

    return { id: data?.id, error: null };
  } catch (err) {
    console.error('[ZAB] Exception saving conversation:', err);
    return { id: null, error: err.message };
  }
}

/**
 * Load user's conversation history from Supabase
 * @param {string} userId - unique user identifier
 * @param {number} limit - max records to fetch (default 10)
 * @returns {Promise<{conversations, error}>}
 */
export async function loadConversationHistory(userId, limit = 10) {
  if (!isSupabaseReady) {
    console.warn('[ZAB] Supabase not ready, skipping conversation load');
    return { conversations: [], error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ZAB] Error loading conversations:', error);
      return { conversations: [], error: error.message };
    }

    return { conversations: data || [], error: null };
  } catch (err) {
    console.error('[ZAB] Exception loading conversations:', err);
    return { conversations: [], error: err.message };
  }
}

/**
 * Store a wellness metric (mood, activity, etc.) for the user
 * @param {string} userId - unique user identifier
 * @param {string} metricType - e.g., 'mood', 'sleep_hours', 'exercise'
 * @param {any} value - metric value
 * @param {string} notes - optional notes
 * @returns {Promise<{id, error}>}
 */
export async function logWellnessMetric(userId, metricType, value, notes = '') {
  if (!isSupabaseReady) {
    console.warn('[ZAB] Supabase not ready, skipping metric log');
    return { id: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('wellness_metrics')
      .insert([
        {
          user_id: userId,
          metric_type: metricType,
          value,
          notes,
          logged_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('[ZAB] Error logging metric:', error);
      return { id: null, error: error.message };
    }

    return { id: data?.id, error: null };
  } catch (err) {
    console.error('[ZAB] Exception logging metric:', err);
    return { id: null, error: err.message };
  }
}

/**
 * Get user's wellness metrics summary
 * @param {string} userId - unique user identifier
 * @param {number} daysBack - how many days back to query (default 30)
 * @returns {Promise<{metrics, error}>}
 */
export async function getWellnessMetricsSummary(userId, daysBack = 30) {
  if (!isSupabaseReady) {
    console.warn('[ZAB] Supabase not ready, skipping metrics query');
    return { metrics: [], error: 'Supabase not configured' };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const { data, error } = await supabase
      .from('wellness_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('[ZAB] Error fetching metrics:', error);
      return { metrics: [], error: error.message };
    }

    return { metrics: data || [], error: null };
  } catch (err) {
    console.error('[ZAB] Exception fetching metrics:', err);
    return { metrics: [], error: err.message };
  }
}
