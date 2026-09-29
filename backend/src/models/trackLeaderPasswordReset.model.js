import { getSupabaseClient } from '../config/database.js';

/**
 * Track Leader Password Reset Model
 * Encapsulates token storage, single-use enforcement, invalidation of older tokens, and expiry checks.
 */
export const TrackLeaderPasswordResetModel = {
  /**
   * Create a new password reset entry.
   * Atomically invalidates any prior unused reset tokens for the same user.
   *
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.tokenHash - SHA-256 hash of random reset token
   * @param {string} params.expiresAt - ISO expiration timestamp
   * @returns {Promise<Object>} Created reset record
   */
  createResetToken: async ({ userId, tokenHash, expiresAt }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const now = new Date().toISOString();

    // 1. Invalidate any existing active tokens for this user
    await client
      .from('track_leader_password_resets')
      .update({ used_at: now })
      .eq('user_id', userId)
      .is('used_at', null);

    // 2. Insert new reset record
    const { data, error } = await client
      .from('track_leader_password_resets')
      .insert([
        {
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt,
          used_at: null,
          created_at: now,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Find an active, non-expired, unused reset record by token hash.
   * Joins user details to confirm account status.
   *
   * @param {string} tokenHash
   * @returns {Promise<Object|null>}
   */
  getActiveResetByHash: async (tokenHash) => {
    if (!tokenHash) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const now = new Date().toISOString();
    const { data, error } = await client
      .from('track_leader_password_resets')
      .select(`
        *,
        user:users(id, email, name, role, is_active)
      `)
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .gt('expires_at', now)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Mark a reset token as consumed.
   *
   * @param {string} id
   * @returns {Promise<Object>}
   */
  markResetTokenUsed: async (id) => {
    if (!id) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const now = new Date().toISOString();
    const { data, error } = await client
      .from('track_leader_password_resets')
      .update({ used_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default TrackLeaderPasswordResetModel;
