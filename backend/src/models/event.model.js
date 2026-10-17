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
  'battleground-blitz': 'loot-goblins',
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
   * Count registrations and delegates with verified successful payment for a single event.
   *
   * Only registrations in CONFIRMED or PAYMENT_SUCCESS status,
   * or having at least one SUCCESS payment transaction (and not CANCELLED),
   * are counted. Excludes PAYMENT_PENDING, PAYMENT_FAILED, CANCELLED, and DRAFT.
   *
   * @param {string} eventId - Event UUID
   * @returns {Promise<{ registrationCount: number, delegateCount: number }>}
   */
  getCountsByEventId: async (eventId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select(`
        id,
        status,
        registration_type,
        team_id,
        payment_transactions(status),
        registration_participants(id)
      `)
      .eq('event_id', eventId)
      .neq('status', 'CANCELLED')
      .limit(10000);

    if (error) {
      throw error;
    }

    let registrationCount = 0;
    let delegateCount = 0;
    const legacyTeamIds = [];

    for (const reg of data || []) {
      const isConfirmed = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      const hasSuccessTxn =
        Array.isArray(reg.payment_transactions) &&
        reg.payment_transactions.some((tx) => tx?.status === 'SUCCESS');

      if (isConfirmed || hasSuccessTxn) {
        registrationCount++;
        const pCount = Array.isArray(reg.registration_participants) ? reg.registration_participants.length : 0;
        if (pCount > 0) {
          delegateCount += pCount;
        } else if (reg.registration_type === 'INDIVIDUAL') {
          delegateCount += 1;
        } else if (reg.registration_type === 'TEAM' && reg.team_id) {
          legacyTeamIds.push(reg.team_id);
        } else {
          delegateCount += 1;
        }
      }
    }

    if (legacyTeamIds.length > 0) {
      const { data: tmRows } = await client
        .from('team_members')
        .select('team_id')
        .in('team_id', legacyTeamIds);

      const teamExtraMap = {};
      for (const tm of tmRows || []) {
        teamExtraMap[tm.team_id] = (teamExtraMap[tm.team_id] || 0) + 1;
      }
      for (const tId of legacyTeamIds) {
        delegateCount += 1 + (teamExtraMap[tId] || 0); // 1 leader + extra team members
      }
    }

    return { registrationCount, delegateCount };
  },

  /**
   * Count registrations with verified successful payment for a single event.
   *
   * @param {string} eventId - Event UUID
   * @returns {Promise<number>}
   */
  getRegistrationCountByEventId: async (eventId) => {
    const counts = await EventModel.getCountsByEventId(eventId);
    return counts.registrationCount;
  },

  /**
   * Count delegates (participants) with verified successful payment for a single event.
   *
   * @param {string} eventId - Event UUID
   * @returns {Promise<number>}
   */
  getDelegateCountByEventId: async (eventId) => {
    const counts = await EventModel.getCountsByEventId(eventId);
    return counts.delegateCount;
  },

  /**
   * Count registrations and delegates with verified successful payment grouped by event_id for all events.
   *
   * @returns {Promise<Record<string, { registrationCount: number, delegateCount: number }>>}
   */
  getCountsForAllEvents: async () => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select(`
        id,
        event_id,
        status,
        registration_type,
        team_id,
        payment_transactions(status),
        registration_participants(id)
      `)
      .neq('status', 'CANCELLED')
      .limit(10000);

    if (error) {
      throw error;
    }

    const counts = {};
    const legacyTeamIds = [];
    const legacyRegList = [];

    for (const reg of data || []) {
      const isConfirmed = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      const hasSuccessTxn =
        Array.isArray(reg.payment_transactions) &&
        reg.payment_transactions.some((tx) => tx?.status === 'SUCCESS');

      if ((isConfirmed || hasSuccessTxn) && reg.event_id) {
        if (!counts[reg.event_id]) {
          counts[reg.event_id] = { registrationCount: 0, delegateCount: 0 };
        }
        counts[reg.event_id].registrationCount += 1;

        const pCount = Array.isArray(reg.registration_participants) ? reg.registration_participants.length : 0;
        if (pCount > 0) {
          counts[reg.event_id].delegateCount += pCount;
        } else if (reg.registration_type === 'INDIVIDUAL') {
          counts[reg.event_id].delegateCount += 1;
        } else if (reg.registration_type === 'TEAM' && reg.team_id) {
          legacyTeamIds.push(reg.team_id);
          legacyRegList.push(reg);
        } else {
          counts[reg.event_id].delegateCount += 1;
        }
      }
    }

    if (legacyTeamIds.length > 0) {
      const { data: tmRows } = await client
        .from('team_members')
        .select('team_id')
        .in('team_id', legacyTeamIds);

      const teamExtraMap = {};
      for (const tm of tmRows || []) {
        teamExtraMap[tm.team_id] = (teamExtraMap[tm.team_id] || 0) + 1;
      }
      for (const reg of legacyRegList) {
        counts[reg.event_id].delegateCount += 1 + (teamExtraMap[reg.team_id] || 0);
      }
    }

    return counts;
  },

  /**
   * Count registrations with verified successful payment grouped by event_id for all events.
   *
   * @returns {Promise<Record<string, number>>}
   */
  getRegistrationCountsForAllEvents: async () => {
    const allCounts = await EventModel.getCountsForAllEvents();
    const result = {};
    for (const eventId of Object.keys(allCounts)) {
      result[eventId] = allCounts[eventId].registrationCount;
    }
    return result;
  },

  /**
   * Count delegates with verified successful payment grouped by event_id for all events.
   *
   * @returns {Promise<Record<string, number>>}
   */
  getDelegateCountsForAllEvents: async () => {
    const allCounts = await EventModel.getCountsForAllEvents();
    const result = {};
    for (const eventId of Object.keys(allCounts)) {
      result[eventId] = allCounts[eventId].delegateCount;
    }
    return result;
  },

  /**
   * Check if a registration belongs to an event and has verified successful payment.
   *
   * @param {string} registrationId - UUID or registration_id code
   * @param {string} eventId - Event UUID
   * @returns {Promise<{ count: number, delegateCount: number }>}
   */
  checkIfRegistrationBelongsToEvent: async (registrationId, eventId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    let query = client
      .from('registrations')
      .select('id, status, registration_type, team_id, payment_transactions(status), registration_participants(id)')
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
    let delegateCount = 0;
    for (const reg of data || []) {
      const isConfirmed = reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS';
      const hasSuccessTxn =
        Array.isArray(reg.payment_transactions) &&
        reg.payment_transactions.some((tx) => tx?.status === 'SUCCESS');

      if (isConfirmed || hasSuccessTxn) {
        count++;
        const pCount = Array.isArray(reg.registration_participants) ? reg.registration_participants.length : 0;
        delegateCount += pCount > 0 ? pCount : 1;
      }
    }

    return { count, delegateCount };
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
