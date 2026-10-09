import { getSupabaseClient } from '../config/database.js';

/**
 * Canonical alias map for alternative/display slugs to primary database slugs.
 */
export const EVENT_SLUG_ALIASES = {
  'tech-quiz': 'circuit-of-minds',
  'data-analytics': 'vlookup',
  'model-united-nations': 'unscripted-nations',
  'mun': 'unscripted-nations',
  'ideathon': 'thoughtlab',
  'battlefield-blitz': 'loot-goblins',
  'bgmi': 'loot-goblins',
  'death-race': 'velocityx',
  'hack-the-skills': 'hack-the-skill',
};

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
   * Count registrations with verified successful payment for a single event.
   *
   * Only registrations in CONFIRMED or PAYMENT_SUCCESS status,
   * or having at least one SUCCESS payment transaction (and not CANCELLED),
   * are counted. Excludes PAYMENT_PENDING, PAYMENT_FAILED, CANCELLED, and DRAFT.
   * Duplicate transactions never cause a registration to be counted more than once.
   *
   * @param {string} eventId - Event UUID
   * @returns {Promise<number>}
   */
  getRegistrationCountByEventId: async (eventId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select('id, status, payment_transactions(status)')
      .eq('event_id', eventId)
      .neq('status', 'CANCELLED')
      .limit(10000);

    if (error) {
      throw error;
    }

    let count = 0;
    for (const reg of data || []) {
      const isConfirmed = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      const hasSuccessTxn =
        Array.isArray(reg.payment_transactions) &&
        reg.payment_transactions.some((tx) => tx?.status === 'SUCCESS');

      if (isConfirmed || hasSuccessTxn) {
        count++;
      }
    }

    return count;
  },

  /**
   * Count registrations with verified successful payment grouped by event_id for all events.
   *
   * Excludes PAYMENT_PENDING, PAYMENT_FAILED, CANCELLED, and DRAFT unless verified paid.
   * Deduplicates multiple transactions per registration so each eligible registration counts once.
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
      .select('id, event_id, status, payment_transactions(status)')
      .neq('status', 'CANCELLED')
      .limit(10000);

    if (error) {
      throw error;
    }

    const counts = {};
    for (const reg of data || []) {
      const isConfirmed = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      const hasSuccessTxn =
        Array.isArray(reg.payment_transactions) &&
        reg.payment_transactions.some((tx) => tx?.status === 'SUCCESS');

      if ((isConfirmed || hasSuccessTxn) && reg.event_id) {
        counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
      }
    }
    return counts;
  },

  /**
   * Check if a registration belongs to an event and has verified successful payment.
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
      .select('id, status, payment_transactions(status)')
      .eq('event_id', eventId)
      .neq('status', 'CANCELLED');

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(registrationId)) {
      query = query.eq('id', registrationId);
    } else {
      query = query.eq('registration_id', registrationId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    let count = 0;
    for (const reg of data || []) {
      const isConfirmed = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      const hasSuccessTxn =
        Array.isArray(reg.payment_transactions) &&
        reg.payment_transactions.some((tx) => tx?.status === 'SUCCESS');

      if (isConfirmed || hasSuccessTxn) {
        count++;
      }
    }

    return { count };
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
   * Supports canonical database slugs as well as common display aliases.
   *
   * @param {string} slug - Event unique slug or alias
   * @returns {Promise<Object|null>}
   */
  getEventBySlug: async (slug) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const normalizedSlug = (slug || '').trim().toLowerCase().replace(/\u0430/g, 'a');
    const targetSlug = EVENT_SLUG_ALIASES[normalizedSlug] || normalizedSlug;

    const { data, error } = await client
      .from('events')
      .select('*, tracks(id, name, slug)')
      .eq('slug', targetSlug)
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
