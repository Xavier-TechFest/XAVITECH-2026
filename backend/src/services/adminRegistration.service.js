import { getSupabaseClient } from '../config/database.js';
import logger from '../utils/logger.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Sanitize search inputs for PostgREST query filter safety.
 */
const sanitizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return '';
  return term.trim().replace(/[,()"'%]/g, '');
};

export const adminRegistrationService = {
  /**
   * Calculate live festival overview metrics from the PostgreSQL database.
   * Strictly uses real database records (no mock numbers).
   */
  getDashboardStats: async () => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    // 1. Fetch total registrations and their team links
    const { data: registrations, error: regError } = await client
      .from('registrations')
      .select('id, registration_type, team_id');

    if (regError) {
      logger.error('Error fetching registration stats:', regError);
      throw regError;
    }

    // 2. Fetch total teams count
    const { count: totalTeams, error: teamError } = await client
      .from('teams')
      .select('id', { count: 'exact', head: true });

    if (teamError) {
      logger.error('Error fetching teams count:', teamError);
      throw teamError;
    }

    // 3. Fetch active events count
    const { count: activeEvents, error: eventError } = await client
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (eventError) {
      logger.error('Error fetching active events count:', eventError);
      throw eventError;
    }

    // 4. Fetch team members to compute accurate participant counts
    const { data: teamMembers, error: memberError } = await client
      .from('team_members')
      .select('id, team_id');

    if (memberError) {
      logger.error('Error fetching team members count:', memberError);
      throw memberError;
    }

    // Build lookup for team member counts: team_id -> count
    const memberCountByTeam = {};
    if (Array.isArray(teamMembers)) {
      for (const m of teamMembers) {
        if (m.team_id) {
          memberCountByTeam[m.team_id] = (memberCountByTeam[m.team_id] || 0) + 1;
        }
      }
    }

    // Calculate total actual participants:
    // Individual = 1 participant
    // Team = 1 team leader + team_members
    let totalParticipants = 0;
    if (Array.isArray(registrations)) {
      for (const r of registrations) {
        if (r.registration_type === 'INDIVIDUAL') {
          totalParticipants += 1;
        } else if (r.registration_type === 'TEAM') {
          const extraMembers = r.team_id && memberCountByTeam[r.team_id] ? memberCountByTeam[r.team_id] : 0;
          totalParticipants += 1 + extraMembers; // 1 leader + extra members
        }
      }
    }

    return {
      totalRegistrations: Array.isArray(registrations) ? registrations.length : 0,
      totalParticipants,
      totalTeams: totalTeams || 0,
      activeEvents: activeEvents || 0,
    };
  },

  /**
   * Paginated, searchable, and filterable list of registrations.
   */
  listRegistrations: async ({
    page = 1,
    limit = 20,
    search = '',
    trackId = '',
    eventId = '',
    registrationType = '',
    status = '',
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const cleanSearch = sanitizeSearchTerm(search);

    // If search is provided, find matching user IDs and team IDs
    let matchingUserIds = [];
    let matchingTeamIds = [];

    if (cleanSearch) {
      const [usersRes, teamsRes] = await Promise.all([
        client
          .from('users')
          .select('id')
          .or(`email.ilike.%${cleanSearch}%,name.ilike.%${cleanSearch}%`)
          .limit(100),
        client
          .from('teams')
          .select('id')
          .ilike('team_name', `%${cleanSearch}%`)
          .limit(100),
      ]);

      if (usersRes.data) {
        matchingUserIds = usersRes.data.map((u) => u.id);
      }
      if (teamsRes.data) {
        matchingTeamIds = teamsRes.data.map((t) => t.id);
      }
    }

    // Build base query
    let query = client
      .from('registrations')
      .select(
        `
        id,
        registration_id,
        registration_type,
        status,
        created_at,
        updated_at,
        event:events(id, name, slug, category, registration_type, fee, track_id),
        user:users(id, name, email, phone, college_name),
        team:teams(id, team_name, status, members:team_members(id, name, member_order))
      `,
        { count: 'exact' }
      );

    // Apply search condition
    if (cleanSearch) {
      const orClauses = [`registration_id.ilike.%${cleanSearch}%`];
      if (matchingUserIds.length > 0) {
        orClauses.push(`user_id.in.(${matchingUserIds.join(',')})`);
      }
      if (matchingTeamIds.length > 0) {
        orClauses.push(`team_id.in.(${matchingTeamIds.join(',')})`);
      }
      query = query.or(orClauses.join(','));
    }

    // Apply event filter or track filter
    if (eventId && UUID_REGEX.test(eventId)) {
      query = query.eq('event_id', eventId);
    } else if (trackId && typeof trackId === 'string' && trackId.trim()) {
      const cleanTrackId = trackId.trim();
      let targetTrackId = cleanTrackId;
      if (!UUID_REGEX.test(cleanTrackId)) {
        const { data: trackRow } = await client
          .from('tracks')
          .select('id')
          .eq('slug', cleanTrackId.toLowerCase())
          .maybeSingle();
        if (trackRow) {
          targetTrackId = trackRow.id;
        }
      }

      if (UUID_REGEX.test(targetTrackId)) {
        const { data: trackEvents } = await client
          .from('events')
          .select('id')
          .eq('track_id', targetTrackId);

        const trackEventIds = (trackEvents || []).map((e) => e.id);
        if (trackEventIds.length === 0) {
          return {
            registrations: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              totalRecords: 0,
              totalPages: 1,
            },
          };
        }
        query = query.in('event_id', trackEventIds);
      }
    }

    // Apply registration type filter
    if (registrationType && ['INDIVIDUAL', 'TEAM'].includes(registrationType.toUpperCase())) {
      query = query.eq('registration_type', registrationType.toUpperCase());
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply ordering & pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: rows, count: totalRecords, error } = await query;

    if (error) {
      logger.error('Error querying registrations list:', error);
      throw error;
    }

    // Transform registrations with safe presentation attributes
    const formattedRegistrations = (rows || []).map((reg) => {
      const members = reg.team?.members || [];
      const participantCount =
        reg.registration_type === 'TEAM'
          ? 1 + members.length // 1 leader + team members
          : 1;

      return {
        id: reg.id,
        registrationId: reg.registration_id,
        registrationType: reg.registration_type,
        status: reg.status,
        createdAt: reg.created_at,
        updatedAt: reg.updated_at,
        event: reg.event
          ? {
              id: reg.event.id,
              name: reg.event.name,
              slug: reg.event.slug,
              category: reg.event.category,
              fee: reg.event.fee,
              trackId: reg.event.track_id,
            }
          : null,
        user: reg.user
          ? {
              id: reg.user.id,
              name: reg.user.name,
              email: reg.user.email,
              phone: reg.user.phone,
              institution: reg.user.college_name,
            }
          : null,
        team: reg.team
          ? {
              id: reg.team.id,
              teamName: reg.team.team_name,
              status: reg.team.status,
              memberCount: members.length,
              totalTeamSize: 1 + members.length,
            }
          : null,
        participantCount,
      };
    });

    const total = totalRecords || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      registrations: formattedRegistrations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: total,
        totalPages,
      },
    };
  },

  /**
   * Fetch complete registration details by UUID or human-readable registration_id.
   */
  getRegistrationDetails: async (registrationIdentifier) => {
    if (!registrationIdentifier || typeof registrationIdentifier !== 'string') {
      return null;
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const cleanIdentifier = registrationIdentifier.trim();
    const isUUID = UUID_REGEX.test(cleanIdentifier);

    let query = client
      .from('registrations')
      .select(
        `
        id,
        registration_id,
        event_id,
        registration_type,
        status,
        created_at,
        updated_at,
        event:events(*),
        user:users(id, name, email, phone, college_name, profile_image, role, is_active, created_at),
        team:teams(
          id,
          team_name,
          status,
          created_at,
          updated_at,
          leader:users(id, name, email, phone, college_name),
          members:team_members(id, name, member_order, created_at)
        )
      `
      );

    if (isUUID) {
      query = query.eq('id', cleanIdentifier);
    } else {
      query = query.eq('registration_id', cleanIdentifier);
    }

    const { data: reg, error } = await query.maybeSingle();

    if (error) {
      logger.error('Error fetching registration details:', error);
      throw error;
    }

    if (!reg) {
      return null;
    }

    // Sort team members by member_order
    let members = [];
    if (reg.team && Array.isArray(reg.team.members)) {
      members = [...reg.team.members].sort(
        (a, b) => (a.member_order || 0) - (b.member_order || 0)
      );
    }

    const totalParticipants =
      reg.registration_type === 'TEAM'
        ? 1 + members.length // 1 leader + team members
        : 1;

    return {
      id: reg.id,
      registrationId: reg.registration_id,
      eventId: reg.event_id || reg.event?.id,
      registrationType: reg.registration_type,
      status: reg.status,
      createdAt: reg.created_at,
      updatedAt: reg.updated_at,
      totalParticipants,
      event: reg.event
        ? {
            id: reg.event.id,
            name: reg.event.name,
            slug: reg.event.slug,
            description: reg.event.description,
            category: reg.event.category,
            trackId: reg.event.track_id,
            track_id: reg.event.track_id,
            registrationType: reg.event.registration_type,
            minTeamSize: reg.event.min_team_size,
            maxTeamSize: reg.event.max_team_size,
            fee: reg.event.fee,
            isActive: reg.event.is_active,
            registrationOpen: reg.event.registration_open,
          }
        : null,
      leader: reg.user
        ? {
            id: reg.user.id,
            name: reg.user.name,
            email: reg.user.email,
            phone: reg.user.phone,
            institution: reg.user.college_name,
            profileImage: reg.user.profile_image,
            role: reg.user.role,
            isActive: reg.user.is_active,
            createdAt: reg.user.created_at,
          }
        : null,
      team: reg.team
        ? {
            id: reg.team.id,
            teamName: reg.team.team_name,
            status: reg.team.status,
            createdAt: reg.team.created_at,
            updatedAt: reg.team.updated_at,
            leader: reg.team.leader
              ? {
                  id: reg.team.leader.id,
                  name: reg.team.leader.name,
                  email: reg.team.leader.email,
                  phone: reg.team.leader.phone,
                  institution: reg.team.leader.college_name,
                }
              : null,
            members: members.map((m) => ({
              id: m.id,
              name: m.name,
              memberOrder: m.member_order,
              createdAt: m.created_at,
            })),
            memberCount: members.length,
            totalTeamSize: 1 + members.length,
          }
        : null,
    };
  },

  /**
   * Paginated, searchable, and filterable list of teams.
   */
  listTeams: async ({
    page = 1,
    limit = 20,
    search = '',
    eventId = '',
    status = '',
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const cleanSearch = sanitizeSearchTerm(search);

    let matchingLeaderIds = [];
    if (cleanSearch) {
      const { data: matchedUsers } = await client
        .from('users')
        .select('id')
        .or(`email.ilike.%${cleanSearch}%,name.ilike.%${cleanSearch}%`)
        .limit(100);

      if (matchedUsers) {
        matchingLeaderIds = matchedUsers.map((u) => u.id);
      }
    }

    let query = client
      .from('teams')
      .select(
        `
        id,
        team_name,
        status,
        created_at,
        updated_at,
        event:events(id, name, slug, fee, min_team_size, max_team_size),
        leader:users(id, name, email, phone, college_name),
        members:team_members(id, name, member_order),
        registration:registrations(id, registration_id, status)
      `,
        { count: 'exact' }
      );

    if (cleanSearch) {
      const orClauses = [`team_name.ilike.%${cleanSearch}%`];
      if (matchingLeaderIds.length > 0) {
        orClauses.push(`leader_user_id.in.(${matchingLeaderIds.join(',')})`);
      }
      query = query.or(orClauses.join(','));
    }

    if (eventId && UUID_REGEX.test(eventId)) {
      query = query.eq('event_id', eventId);
    }

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: rows, count: totalRecords, error } = await query;

    if (error) {
      logger.error('Error querying teams list:', error);
      throw error;
    }

    const formattedTeams = (rows || []).map((t) => {
      const members = t.members || [];
      const reg = Array.isArray(t.registration) && t.registration.length > 0 ? t.registration[0] : null;

      return {
        id: t.id,
        teamName: t.team_name,
        status: t.status,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        event: t.event
          ? {
              id: t.event.id,
              name: t.event.name,
              slug: t.event.slug,
              fee: t.event.fee,
              minTeamSize: t.event.min_team_size,
              maxTeamSize: t.event.max_team_size,
            }
          : null,
        leader: t.leader
          ? {
              id: t.leader.id,
              name: t.leader.name,
              email: t.leader.email,
              phone: t.leader.phone,
              institution: t.leader.college_name,
            }
          : null,
        memberCount: members.length,
        totalTeamSize: 1 + members.length,
        registration: reg
          ? {
              id: reg.id,
              registrationId: reg.registration_id,
              status: reg.status,
            }
          : null,
      };
    });

    const total = totalRecords || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      teams: formattedTeams,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: total,
        totalPages,
      },
    };
  },

  /**
   * Fetch complete team details by UUID.
   */
  getTeamDetails: async (teamId) => {
    if (!teamId || !UUID_REGEX.test(teamId)) {
      return null;
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const { data: team, error } = await client
      .from('teams')
      .select(
        `
        id,
        team_name,
        status,
        created_at,
        updated_at,
        event:events(*),
        leader:users(id, name, email, phone, college_name, profile_image, role, is_active, created_at),
        members:team_members(id, name, member_order, created_at),
        registration:registrations(id, registration_id, status, registration_type, created_at)
      `
      )
      .eq('id', teamId)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching team details:', error);
      throw error;
    }

    if (!team) {
      return null;
    }

    let members = [];
    if (Array.isArray(team.members)) {
      members = [...team.members].sort(
        (a, b) => (a.member_order || 0) - (b.member_order || 0)
      );
    }

    const reg = Array.isArray(team.registration) && team.registration.length > 0 ? team.registration[0] : null;

    return {
      id: team.id,
      teamName: team.team_name,
      status: team.status,
      createdAt: team.created_at,
      updatedAt: team.updated_at,
      totalTeamSize: 1 + members.length,
      event: team.event
        ? {
            id: team.event.id,
            name: team.event.name,
            slug: team.event.slug,
            description: team.event.description,
            category: team.event.category,
            registrationType: team.event.registration_type,
            minTeamSize: team.event.min_team_size,
            maxTeamSize: team.event.max_team_size,
            fee: team.event.fee,
            isActive: team.event.is_active,
            registrationOpen: team.event.registration_open,
          }
        : null,
      leader: team.leader
        ? {
            id: team.leader.id,
            name: team.leader.name,
            email: team.leader.email,
            phone: team.leader.phone,
            institution: team.leader.college_name,
            profileImage: team.leader.profile_image,
            role: team.leader.role,
            isActive: team.leader.is_active,
            createdAt: team.leader.created_at,
          }
        : null,
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        memberOrder: m.member_order,
        createdAt: m.created_at,
      })),
      memberCount: members.length,
      registration: reg
        ? {
            id: reg.id,
            registrationId: reg.registration_id,
            status: reg.status,
            registrationType: reg.registration_type,
            createdAt: reg.created_at,
          }
        : null,
    };
  },
};

export default adminRegistrationService;
