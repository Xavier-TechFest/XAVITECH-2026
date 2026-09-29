import { getSupabaseClient } from '../config/database.js';

/**
 * Event Model / Data Access Layer
 * Encapsulates all PostgreSQL / Supabase queries for the `events` table.
 */
export const EventModel = {
  tableName: 'events',

  /**
   * Retrieves all active events.
   * By default, returns only events where registration_open is true.
   *
   * @param {Object} options
   * @param {boolean} options.registrationOpenOnly - Filter by registration_open flag
   * @returns {Promise<Array>}
   */
  getAllActiveEvents: async ({ registrationOpenOnly = true } = {}) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    let query = client
      .from('events')
      .select('*, tracks(id, name, slug)')
      .eq('is_active', true);

    if (registrationOpenOnly) {
      query = query.eq('registration_open', true);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Find an event by its database UUID.
   *
   * @param {string} id - Event UUID
   * @returns {Promise<Object|null>}
   */
  getEventById: async (id) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('events')
      .select('*, tracks(id, name, slug)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Find an event by its unique URL slug.
   *
   * @param {string} slug - Event unique slug
   * @returns {Promise<Object|null>}
   */
  getEventBySlug: async (slug) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('events')
      .select('*, tracks(id, name, slug)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Create a new event record.
   *
   * @param {Object} eventData
   * @returns {Promise<Object>}
   */
  createEvent: async (eventData) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Update an existing event by UUID.
   *
   * @param {string} id - Event UUID
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  updateEvent: async (id, updateData) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Soft-deactivates an event by setting is_active = false.
   *
   * @param {string} id - Event UUID
   * @returns {Promise<Object>}
   */
  deactivateEvent: async (id) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('events')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export default EventModel;
