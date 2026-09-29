import { getSupabaseClient } from '../config/database.js';

/**
 * Track Leader Assignment Model
 * Encapsulates track assignment mapping, one-active-track constraint logic, and audit retention.
 */
export const TrackLeaderAssignmentModel = {
  /**
   * Assign a track to a Track Leader.
   * Atomically deactivates any existing active assignment before creating the new active assignment.
   *
   * @param {string} trackLeaderUserId
   * @param {string} trackId
   * @returns {Promise<Object>} The new active assignment record with track details
   */
  assignTrack: async (trackLeaderUserId, trackId) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const now = new Date().toISOString();

    // 1. Deactivate any existing active assignment for this leader
    await client
      .from('track_leader_assignments')
      .update({ is_active: false, updated_at: now })
      .eq('track_leader_user_id', trackLeaderUserId)
      .eq('is_active', true);

    // 2. Insert new active assignment
    const { data, error } = await client
      .from('track_leader_assignments')
      .insert([
        {
          track_leader_user_id: trackLeaderUserId,
          track_id: trackId,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ])
      .select('*, track:tracks(id, name, slug, description, is_active)')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch currently active track assignment for a Track Leader.
   *
   * @param {string} trackLeaderUserId
   * @returns {Promise<Object|null>}
   */
  getActiveAssignment: async (trackLeaderUserId) => {
    if (!trackLeaderUserId) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('track_leader_assignments')
      .select('*, track:tracks(id, name, slug, description, is_active)')
      .eq('track_leader_user_id', trackLeaderUserId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Batch fetch active assignments for a list of user IDs.
   *
   * @param {string[]} userIds
   * @returns {Promise<Array<Object>>}
   */
  getActiveAssignmentsForUsers: async (userIds) => {
    if (!userIds || userIds.length === 0) return [];
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('track_leader_assignments')
      .select('id, track_leader_user_id, track_id, is_active, track:tracks(id, name, slug, description, is_active)')
      .in('track_leader_user_id', userIds)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch all Track Leader user IDs actively assigned to a specific track.
   *
   * @param {string} trackId
   * @returns {Promise<string[]>}
   */
  getLeaderUserIdsForTrack: async (trackId) => {
    if (!trackId) return [];
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('track_leader_assignments')
      .select('track_leader_user_id')
      .eq('track_id', trackId)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map((row) => row.track_leader_user_id);
  },
};

export default TrackLeaderAssignmentModel;
