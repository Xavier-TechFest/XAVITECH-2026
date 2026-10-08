import { getSupabaseClient } from '../config/database.js';

/**
 * Registration Model / Data Access Layer
 * Encapsulates all PostgreSQL / Supabase queries for the `registrations` table.
 */
export const RegistrationModel = {
  tableName: 'registrations',

  /**
   * Create a new registration record.
   *
   * @param {Object} registrationData
   * @param {string} registrationData.registration_id - Human-readable unique code (e.g. XVT-2026-ABC123)
   * @param {string} registrationData.user_id - PostgreSQL users.id (UUID)
   * @param {string} registrationData.event_id - PostgreSQL events.id (UUID)
   * @param {string} registrationData.registration_type - 'INDIVIDUAL' | 'TEAM'
   * @param {string} registrationData.status - 'DRAFT'
   * @returns {Promise<Object>} Created registration record with joined event and user details
   */
  createRegistration: async (registrationData) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .insert([registrationData])
      .select(`
        *,
        event:events(id, name, slug, category, registration_type, fee, track_id, track:tracks(id, name, slug)),
        user:users(id, name, email, phone, college_name),
        team:teams(id, team_name, status, members:team_members(*)),
        participants:registration_participants(*),
        payment_transactions(id, transaction_id, amount, currency, status, gateway)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Find a registration by its database UUID.
   *
   * @param {string} id - Registration primary key (UUID)
   * @returns {Promise<Object|null>}
   */
  getRegistrationById: async (id) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || '').trim());
    if (!isUUID) {
      return null;
    }

    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select(`
        *,
        event:events(id, name, slug, category, registration_type, fee, track_id, track:tracks(id, name, slug)),
        user:users(id, name, email, phone, college_name),
        team:teams(id, team_name, status, members:team_members(*)),
        participants:registration_participants(*),
        payment_transactions(id, transaction_id, amount, currency, status, gateway)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Find a registration by its human-readable registration ID (e.g. XVT-2026-ABC123).
   *
   * @param {string} registrationId - Unique code
   * @returns {Promise<Object|null>}
   */
  getRegistrationByRegistrationId: async (registrationId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select(`
        *,
        event:events(id, name, slug, category, registration_type, fee, track_id, track:tracks(id, name, slug)),
        user:users(id, name, email, phone, college_name),
        team:teams(id, team_name, status, members:team_members(*)),
        participants:registration_participants(*),
        payment_transactions(id, transaction_id, amount, currency, status, gateway)
      `)
      .eq('registration_id', registrationId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Fetch all registrations created by a specific user.
   *
   * @param {string} userId - PostgreSQL users.id (UUID)
   * @returns {Promise<Array>}
   */
  getUserRegistrations: async (userId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select(`
        *,
        event:events(id, name, slug, category, registration_type, fee, track_id, track:tracks(id, name, slug)),
        team:teams(id, team_name, status, members:team_members(*)),
        participants:registration_participants(*),
        payment_transactions(id, transaction_id, amount, currency, status, gateway)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Fetch lightweight registration index for a user.
   * Excludes participants snapshot, documents, and payment transaction details.
   *
   * @param {string} userId - PostgreSQL users.id (UUID)
   * @returns {Promise<Array>}
   */
  getUserRegistrationIndex: async (userId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select(`
        id,
        registration_id,
        user_id,
        event_id,
        team_id,
        registration_type,
        status,
        created_at,
        updated_at,
        event:events(id, name, slug),
        team:teams(id, team_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Check if user already has an active registration for an event.
   * Used for server-side duplicate prevention.
   *
   * @param {string} userId - PostgreSQL users.id (UUID)
   * @param {string} eventId - PostgreSQL events.id (UUID)
   * @param {Array<string>} activeStatuses - Statuses that block new registrations
   * @returns {Promise<Object|null>}
   */
  checkExistingRegistration: async (
    userId,
    eventId,
    activeStatuses = ['DRAFT', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED']
  ) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registrations')
      .select('id, registration_id, event_id, status, created_at')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .in('status', activeStatuses)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Update the status of a registration.
   * Supports lookup by database UUID or human-readable registration ID.
   *
   * @param {string} identifier - Unique code (e.g. XVT-2026-ABC123) or UUID
   * @param {string} status - New registration status (e.g. 'PAYMENT_PENDING')
   * @returns {Promise<Object>}
   */
  updateRegistrationStatus: async (identifier, status) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(identifier || '').trim());
    const column = isUUID ? 'id' : 'registration_id';

    const { data, error } = await client
      .from('registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq(column, identifier)
      .select(`
        *,
        event:events(id, name, slug, category, registration_type, fee),
        user:users(id, name, email, phone, college_name),
        team:teams(id, team_name, status, members:team_members(*)),
        participants:registration_participants(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export default RegistrationModel;
