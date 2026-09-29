import { getSupabaseClient } from '../config/database.js';

/**
 * Track Model / Data Access Layer
 * Encapsulates all PostgreSQL / Supabase queries for the `tracks` table.
 */
export const TrackModel = {
  tableName: 'tracks',

  /**
   * Retrieves all active tracks ordered alphabetically by name.
   *
   * @returns {Promise<Array>}
   */
  findAllActiveTracks: async () => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('tracks')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Find a track by its database UUID.
   *
   * @param {string} id - Track UUID
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('tracks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Find a track by its unique URL slug.
   *
   * @param {string} slug - Track URL slug
   * @returns {Promise<Object|null>}
   */
  findBySlug: async (slug) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('tracks')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Find all active events belonging to a specific track by track UUID.
   *
   * @param {string} trackId - Track UUID
   * @returns {Promise<Array>}
   */
  findEventsByTrackId: async (trackId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('track_id', trackId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },
};

export default TrackModel;
