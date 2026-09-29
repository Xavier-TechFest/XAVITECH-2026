import { getSupabaseClient } from '../config/database.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Team Model / Data Access Layer
 * Encapsulates all PostgreSQL / Supabase queries for `teams` and `team_members` tables.
 */
export const TeamModel = {
  tableName: 'teams',
  membersTableName: 'team_members',

  /**
   * Create a new team record.
   */
  createTeam: async (teamData) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Find a team by its UUID.
   */
  getTeamById: async (teamId) => {
    if (!teamId || !UUID_REGEX.test(teamId)) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Find all teams led by a specific user.
   */
  getTeamsByLeader: async (leaderUserId) => {
    if (!leaderUserId || !UUID_REGEX.test(leaderUserId)) return [];
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('teams')
      .select(`
        *,
        event:events(*),
        members:team_members(*)
      `)
      .eq('leader_user_id', leaderUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Find an active team for a specific leader and event.
   * Active statuses: 'DRAFT', 'SUBMITTED'
   */
  findActiveTeamByLeaderAndEvent: async (leaderUserId, eventId) => {
    if (!leaderUserId || !eventId || !UUID_REGEX.test(leaderUserId) || !UUID_REGEX.test(eventId)) {
      return null;
    }
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('teams')
      .select('*')
      .eq('leader_user_id', leaderUserId)
      .eq('event_id', eventId)
      .in('status', ['DRAFT', 'SUBMITTED'])
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Get team details with event, leader user, and members.
   */
  getTeamWithMembers: async (teamId) => {
    if (!teamId || !UUID_REGEX.test(teamId)) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('teams')
      .select(`
        *,
        event:events(*),
        leader:users(id, name, email, phone, college_name),
        members:team_members(*)
      `)
      .eq('id', teamId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update team attributes by team UUID.
   */
  updateTeam: async (teamId, updateData) => {
    if (!teamId || !UUID_REGEX.test(teamId)) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('teams')
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a team by UUID.
   */
  deleteTeam: async (teamId) => {
    if (!teamId || !UUID_REGEX.test(teamId)) return false;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { error } = await client
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
    return true;
  },

  /**
   * Add a member to a team.
   */
  addTeamMember: async (memberData) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('team_members')
      .insert([memberData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Find a specific team member by UUID.
   */
  getTeamMemberById: async (memberId) => {
    if (!memberId || !UUID_REGEX.test(memberId)) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Get all members of a team ordered by member_order or created_at.
   */
  getTeamMembers: async (teamId) => {
    if (!teamId || !UUID_REGEX.test(teamId)) return [];
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('member_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update a team member's name.
   */
  updateTeamMember: async (memberId, updateData) => {
    if (!memberId || !UUID_REGEX.test(memberId)) return null;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data, error } = await client
      .from('team_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove a member from a team.
   */
  removeTeamMember: async (memberId) => {
    if (!memberId || !UUID_REGEX.test(memberId)) return false;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { error } = await client
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    return true;
  },

  /**
   * Count the number of members in a team (excluding leader).
   */
  countTeamMembers: async (teamId) => {
    if (!teamId || !UUID_REGEX.test(teamId)) return 0;
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { count, error } = await client
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);

    if (error) throw error;
    return count || 0;
  },
};

export default TeamModel;
