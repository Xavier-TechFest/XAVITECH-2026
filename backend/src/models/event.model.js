import { getSupabaseClient } from '../config/database.js';

/**
 * Event Model / Data Access Layer
 * Encapsulates all PostgreSQL / Supabase queries for the `events` table.
 */
export const EventModel = {
  tableName: 'events',

  /**
   * Retrieves all active events.
   * By default, returns all active events regardless of registration_open status
   * so frontend catalogs can display accurate status buttons (Closed, Coming Soon, Full, etc.).
   *
   * @param {Object} options
   * @param {boolean} options.registrationOpenOnly - Filter strictly by registration_open flag
   * @returns {Promise<Array>}
   */
  getAllActiveEvents: async ({ registrationOpenOnly = false } = {}) => {
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
   * Retrieves all events in the system (active and inactive) with tracks.
   * Used for superadmin management.
   *
   * @returns {Promise<Array>}
   */
  getAllEvents: async () => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('events')
      .select('*, tracks(id, name, slug)')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Count active (non-cancelled) registrations for a single event.
   *
   * @param {string} eventId - Event UUID
   * @returns {Promise<number>}
   */
  getRegistrationCountByEventId: async (eventId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { count, error } = await client
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .neq('status', 'CANCELLED');

    if (error) {
      throw error;
    }

    return count || 0;
  },

  /**
   * Count active (non-cancelled) registrations grouped by event_id for all events.
   *
   * @returns {Promise<Record<string, number>>}
   */
  getRegistrationCountsForAllEvents: async () => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select('event_id')
      .neq('status', 'CANCELLED');

    if (error) {
      throw error;
    }

    const counts = {};
    for (const reg of data || []) {
      if (reg.event_id) {
        counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
      }
    }
    return counts;
  },

  /**
   * Check if a registration belongs to an event and is non-cancelled.
   *
   * @param {string} registrationId - UUID or registration_id code
   * @param {string} eventId - Event UUID
   * @returns {Promise<{ count: number }>}
   */
  checkIfRegistrationBelongsToEvent: async (registrationId, eventId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    let query = client
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .neq('status', 'CANCELLED');

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(registrationId)) {
      query = query.eq('id', registrationId);
    } else {
      query = query.eq('registration_id', registrationId);
    }

    const { count, error } = await query;
    if (error) {
      throw error;
    }

    return { count: count || 0 };
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
      .select('*, tracks(id, name, slug)')
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
      .select('*, tracks(id, name, slug)')
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
      .select('*, tracks(id, name, slug)')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export default EventModel;
