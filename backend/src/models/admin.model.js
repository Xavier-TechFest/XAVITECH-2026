import { getSupabaseClient } from '../config/database.js';

/**
 * Admin Model / Data Access Layer
 * Encapsulates single-admin lookups and multi-session operations.
 */
export const AdminModel = {
  /**
   * Find the single ADMIN user record.
   */
  getAdminUser: async () => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('role', 'ADMIN')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Find admin user by email (case-insensitive).
   */
  getAdminByEmail: async (email) => {
    if (!email) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const cleanEmail = email.toLowerCase().trim();
    const { data, error } = await client
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .eq('role', 'ADMIN')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create the single ADMIN account.
   * Enforces that an admin does not already exist.
   */
  createAdminUser: async ({ email, name, password_hash }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    // Pre-check for existing admin
    const existingAdmin = await AdminModel.getAdminUser();
    if (existingAdmin) {
      const error = new Error('An ADMIN account already exists in the system. XAVITECH permits exactly ONE admin account.');
      error.statusCode = 409;
      throw error;
    }

    const { data, error } = await client
      .from('users')
      .insert([
        {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          password_hash,
          role: 'ADMIN',
          is_active: true,
          firebase_uid: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        },
      ])
      .select('id, email, name, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update the single existing ADMIN account details.
   */
  updateAdminUser: async (adminId, updateFields) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('users')
      .update(updateFields)
      .eq('id', adminId)
      .eq('role', 'ADMIN')
      .select('id, email, name, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new session entry for concurrent multi-device logins.
   */
  createAdminSession: async ({
    admin_user_id,
    session_token_hash,
    user_agent = null,
    ip_address = null,
    expires_at,
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('admin_sessions')
      .insert([
        {
          admin_user_id,
          session_token_hash,
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
   * Look up an active (non-revoked, non-expired) session by token hash with joined admin user.
   */
  getActiveSessionByHash: async (sessionTokenHash) => {
    if (!sessionTokenHash) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('admin_sessions')
      .select(`
        *,
        user:users(id, email, name, role, is_active)
      `)
      .eq('session_token_hash', sessionTokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update session last_used_at timestamp.
   */
  touchSession: async (sessionId) => {
    const client = getSupabaseClient();
    if (!client) return;

    await client
      .from('admin_sessions')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', sessionId);
  },

  /**
   * Revoke ONLY the current session.
   * Invalidate this specific device login without affecting other active devices.
   */
  revokeSession: async (sessionId) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('admin_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Revoke all sessions for an admin (optional security/reset feature).
   */
  revokeAllSessionsForAdmin: async (adminUserId) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { error } = await client
      .from('admin_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('admin_user_id', adminUserId)
      .is('revoked_at', null);

    if (error) throw error;
    return true;
  },

  /**
   * Get count of currently active sessions for the admin.
   */
  getActiveSessionsCount: async (adminUserId) => {
    const client = getSupabaseClient();
    if (!client) return 0;

    const { count, error } = await client
      .from('admin_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('admin_user_id', adminUserId)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;
    return count || 0;
  },
};

export default AdminModel;
