import { getSupabaseClient } from '../config/database.js';

/**
 * Track Leader Model / Data Access Layer
 * Encapsulates Track Leader user lookups, credentials, and dedicated session management.
 */
export const TrackLeaderModel = {
  /**
   * Find a Track Leader user record by email (case-insensitive).
   * Strictly matches role = 'TRACK_LEADER'.
   *
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  getTrackLeaderByEmail: async (email) => {
    if (!email) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const cleanEmail = String(email).toLowerCase().trim();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('role', 'TRACK_LEADER')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Find a Track Leader user record by database UUID.
   * Strictly matches role = 'TRACK_LEADER'.
   *
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  getTrackLeaderById: async (id) => {
    if (!id) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'TRACK_LEADER')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new Track Leader user record.
   *
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.name
   * @param {string} params.password_hash
   * @param {boolean} [params.is_active=true]
   * @param {boolean} [params.must_change_password=false]
   * @returns {Promise<Object>}
   */
  createTrackLeaderUser: async ({
    email,
    name,
    password_hash,
    is_active = true,
    must_change_password = false,
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const cleanEmail = String(email).toLowerCase().trim();

    const { data, error } = await client
      .from('users')
      .insert([
        {
          email: cleanEmail,
          name: name ? name.trim() : null,
          password_hash,
          role: 'TRACK_LEADER',
          is_active,
          must_change_password,
          firebase_uid: null,
        },
      ])
      .select('id, email, name, role, is_active, must_change_password, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a Track Leader user record.
   *
   * @param {string} id
   * @param {Object} updateFields
   * @returns {Promise<Object>}
   */
  updateTrackLeaderUser: async (id, updateFields) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('users')
      .update(updateFields)
      .eq('id', id)
      .eq('role', 'TRACK_LEADER')
      .select('id, email, name, role, is_active, must_change_password, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new Track Leader session entry in track_leader_sessions.
   * Supports concurrent multi-device logins.
   *
   * @param {Object} sessionData
   * @returns {Promise<Object>}
   */
  createSession: async ({
    user_id,
    token_hash,
    user_agent = null,
    ip_address = null,
    expires_at,
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('track_leader_sessions')
      .insert([
        {
          user_id,
          token_hash,
          user_agent,
          ip_address,
          expires_at,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Look up an active (non-revoked, non-expired) Track Leader session by token hash.
   * Joins the associated user record.
   *
   * @param {string} tokenHash
   * @returns {Promise<Object|null>}
   */
  getActiveSessionByHash: async (tokenHash) => {
    if (!tokenHash) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('track_leader_sessions')
      .select(`
        *,
        user:users(id, email, name, role, is_active, must_change_password)
      `)
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update session last_used_at timestamp.
   *
   * @param {string} sessionId
   */
  touchSession: async (sessionId) => {
    const client = getSupabaseClient();
    if (!client) return;

    await client
      .from('track_leader_sessions')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', sessionId);
  },

  /**
   * Revoke ONLY the specified session.
   * Other active sessions for the Track Leader remain intact.
   *
   * @param {string} sessionId
   * @returns {Promise<Object>}
   */
  revokeSession: async (sessionId) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('track_leader_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Count currently active sessions for a Track Leader.
   *
   * @param {string} userId
   * @returns {Promise<number>}
   */
  getActiveSessionsCount: async (userId) => {
    const client = getSupabaseClient();
    if (!client) return 0;

    const { count, error } = await client
      .from('track_leader_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;
    return count || 0;
  },

  /**
   * Fetch active sessions list for a Track Leader (safe metadata only).
   *
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  getActiveSessionsForUser: async (userId) => {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from('track_leader_sessions')
      .select('id, user_agent, ip_address, expires_at, created_at, last_used_at')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Revoke ALL active sessions for a Track Leader.
   * Invoked upon deactivation or credential reset.
   *
   * @param {string} userId
   * @returns {Promise<number>} Number of sessions revoked
   */
  revokeAllSessions: async (userId) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const now = new Date().toISOString();
    const { data, error } = await client
      .from('track_leader_sessions')
      .update({ revoked_at: now })
      .eq('user_id', userId)
      .is('revoked_at', null)
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  },
};

export default TrackLeaderModel;

