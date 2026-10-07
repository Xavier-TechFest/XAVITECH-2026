import TeamModel from '../models/team.model.js';
import EventModel from '../models/event.model.js';
import UserModel from '../models/user.model.js';
import userService from './user.service.js';
import logger from '../utils/logger.util.js';

/**
 * Helper to resolve the authenticated PostgreSQL user from Firebase auth context.
 */
const resolvePostgresUser = async (firebaseUser) => {
  if (!firebaseUser?.uid) {
    const error = new Error('Authentication required. Missing verified Firebase user.');
    error.statusCode = 401;
    throw error;
  }

  let dbUser = await UserModel.findByFirebaseUid(firebaseUser.uid);
  if (!dbUser) {
    await userService.getOrCreateUserFromFirebase(firebaseUser);
    dbUser = await UserModel.findByFirebaseUid(firebaseUser.uid);
  }

  if (!dbUser) {
    const error = new Error('Unable to resolve user profile in database.');
    error.statusCode = 500;
    throw error;
  }

  return dbUser;
};

/**
 * Standardize team object response format
 */
export const formatTeamDetailsResponse = (teamWithDetails) => {
  if (!teamWithDetails) return null;

  const members = (teamWithDetails.members || []).map((m) => ({
    id: m.id,
    name: m.name,
    memberOrder: m.member_order,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }));

  const totalTeamSize = 1 + members.length; // Leader + team members

  return {
    team: {
      id: teamWithDetails.id,
      teamName: teamWithDetails.team_name,
      eventId: teamWithDetails.event_id,
      leaderUserId: teamWithDetails.leader_user_id,
      status: teamWithDetails.status,
      createdAt: teamWithDetails.created_at,
      updatedAt: teamWithDetails.updated_at,
    },
    event: teamWithDetails.event
      ? {
          id: teamWithDetails.event.id,
          name: teamWithDetails.event.name,
          slug: teamWithDetails.event.slug,
          track: teamWithDetails.event.track || teamWithDetails.event.category,
          eventType: teamWithDetails.event.event_type || null,
          registrationType: teamWithDetails.event.registration_type,
          minTeamSize: teamWithDetails.event.min_team_size,
          maxTeamSize: teamWithDetails.event.max_team_size,
          fee: Number(teamWithDetails.event.fee || 0),
          currency: teamWithDetails.event.currency || 'INR',
        }
      : undefined,
    leader: teamWithDetails.leader
      ? {
          id: teamWithDetails.leader.id,
          name: teamWithDetails.leader.name || null,
          email: teamWithDetails.leader.email,
          phone: teamWithDetails.leader.phone || null,
          institution: teamWithDetails.leader.college_name || null,
        }
      : undefined,
    members,
    teamSize: totalTeamSize,
    team_size: totalTeamSize,
    minTeamSize: teamWithDetails.event?.min_team_size || 1,
    min_team_size: teamWithDetails.event?.min_team_size || 1,
    maxTeamSize: teamWithDetails.event?.max_team_size || 1,
    max_team_size: teamWithDetails.event?.max_team_size || 1,
    status: teamWithDetails.status,
  };
};

/**
 * Team Service
 * Business logic layer for team creation, member management, team-size validation, and security ownership.
 */
export const teamService = {
  /**
   * Create a new team for an event.
   * Authenticated user automatically becomes the team leader.
   */
  createTeam: async (firebaseUser, payload) => {
    const leader = await resolvePostgresUser(firebaseUser);
    const eventId = (payload.event_id || payload.eventId || '').trim();
    const teamName = (payload.team_name || payload.teamName || '').trim();

    if (!teamName || teamName.length < 2) {
      const error = new Error('Team name must be at least 2 characters long');
      error.statusCode = 400;
      throw error;
    }

    if (teamName.length > 100) {
      const error = new Error('Team name cannot exceed 100 characters');
      error.statusCode = 400;
      throw error;
    }

    // 1. Fetch and validate event
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId);
    const event = isUUID ? await EventModel.getEventById(eventId) : await EventModel.getEventBySlug(eventId.toLowerCase());
    if (!event) {
      const error = new Error('Event not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    if (!event.is_active) {
      const error = new Error('This event is currently inactive');
      error.statusCode = 400;
      throw error;
    }

    if (!event.registration_open) {
      const error = new Error('Registration for this event is currently closed');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate event registration type (Must not be strictly individual)
    if (event.registration_type === 'INDIVIDUAL' && event.max_team_size === 1) {
      const error = new Error('This event is for individual participants only and does not support teams');
      error.statusCode = 400;
      throw error;
    }

    // 3. Prevent duplicate active team for the same leader + same event
    const existingActiveTeam = await TeamModel.findActiveTeamByLeaderAndEvent(leader.id, event.id);
    if (existingActiveTeam) {
      const error = new Error(
        `You already have an active team for this event ("${existingActiveTeam.team_name}", Status: ${existingActiveTeam.status})`
      );
      error.statusCode = 409;
      error.data = {
        existingTeamId: existingActiveTeam.id,
        teamName: existingActiveTeam.team_name,
        status: existingActiveTeam.status,
      };
      throw error;
    }

    // 4. Create the team in database
    const createdTeam = await TeamModel.createTeam({
      event_id: event.id,
      leader_user_id: leader.id,
      team_name: teamName,
      status: 'DRAFT',
    });

    logger.info(`Team created: "${teamName}" (${createdTeam.id}) by leader ${leader.id} for event ${eventId}`);

    return {
      team: {
        id: createdTeam.id,
        team_name: createdTeam.team_name,
        teamName: createdTeam.team_name,
        event_id: createdTeam.event_id,
        eventId: createdTeam.event_id,
        status: createdTeam.status,
        createdAt: createdTeam.created_at,
        updatedAt: createdTeam.updated_at,
      },
      leader: {
        id: leader.id,
        name: leader.name || null,
        email: leader.email,
        institution: leader.college_name || null,
      },
      members: [],
      team_size: 1,
      teamSize: 1,
    };
  },

  /**
   * Fetch all teams led by the authenticated user.
   */
  getMyTeams: async (firebaseUser) => {
    const leader = await resolvePostgresUser(firebaseUser);
    const teams = await TeamModel.getTeamsByLeader(leader.id);

    return teams.map((team) => {
      const members = team.members || [];
      const totalSize = 1 + members.length;
      return {
        id: team.id,
        teamName: team.team_name,
        team_name: team.team_name,
        status: team.status,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
        event: team.event
          ? {
              id: team.event.id,
              name: team.event.name,
              slug: team.event.slug,
              track: team.event.track || team.event.category,
              fee: Number(team.event.fee || 0),
              minTeamSize: team.event.min_team_size,
              maxTeamSize: team.event.max_team_size,
            }
          : null,
        leader: {
          id: leader.id,
          name: leader.name || null,
          email: leader.email,
          institution: leader.college_name || null,
        },
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          memberOrder: m.member_order,
        })),
        teamSize: totalSize,
        team_size: totalSize,
        minTeamSize: team.event?.min_team_size || 1,
        maxTeamSize: team.event?.max_team_size || 1,
      };
    });
  },

  /**
   * Fetch complete team details with strict ownership verification.
   */
  getTeamDetails: async (firebaseUser, teamId) => {
    const user = await resolvePostgresUser(firebaseUser);
    const teamWithDetails = await TeamModel.getTeamWithMembers(teamId);

    if (!teamWithDetails) {
      const error = new Error('Team not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    // Ownership check: only team leader or admin can access
    if (teamWithDetails.leader_user_id !== user.id && user.role !== 'ADMIN') {
      logger.warn(
        `Unauthorized team access: User ${user.id} (${user.email}) attempted to access team ${teamId} led by ${teamWithDetails.leader_user_id}`
      );
      const error = new Error('Access denied. You do not have permission to view this team.');
      error.statusCode = 403;
      throw error;
    }

    return formatTeamDetailsResponse(teamWithDetails);
  },

  /**
   * Rename a team. Only allowed while team is in DRAFT status.
   */
  updateTeam: async (firebaseUser, teamId, payload) => {
    const user = await resolvePostgresUser(firebaseUser);
    const team = await TeamModel.getTeamById(teamId);

    if (!team) {
      const error = new Error('Team not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader_user_id !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied. You do not have permission to update this team.');
      error.statusCode = 403;
      throw error;
    }

    if (team.status !== 'DRAFT') {
      const error = new Error('Only teams in DRAFT status can be modified.');
      error.statusCode = 400;
      throw error;
    }

    const teamName = (payload.team_name || payload.teamName || '').trim();
    const updated = await TeamModel.updateTeam(teamId, {
      team_name: teamName,
    });

    return {
      id: updated.id,
      teamName: updated.team_name,
      team_name: updated.team_name,
      status: updated.status,
      updatedAt: updated.updated_at,
    };
  },

  /**
   * Delete a team. Only allowed while team is in DRAFT status.
   */
  deleteTeam: async (firebaseUser, teamId) => {
    const user = await resolvePostgresUser(firebaseUser);
    const team = await TeamModel.getTeamById(teamId);

    if (!team) {
      const error = new Error('Team not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader_user_id !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied. You do not have permission to delete this team.');
      error.statusCode = 403;
      throw error;
    }

    if (team.status !== 'DRAFT') {
      const error = new Error('Only teams in DRAFT status can be deleted.');
      error.statusCode = 400;
      throw error;
    }

    await TeamModel.deleteTeam(teamId);
    logger.info(`Team ${teamId} deleted by leader ${user.id}`);
    return true;
  },

  /**
   * Add a member to the team.
   * Calculates total team size = 1 (leader) + existing members.
   * Strictly enforces max_team_size from event configuration.
   */
  addTeamMember: async (firebaseUser, teamId, payload) => {
    const user = await resolvePostgresUser(firebaseUser);
    const teamWithDetails = await TeamModel.getTeamWithMembers(teamId);

    if (!teamWithDetails) {
      const error = new Error('Team not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    if (teamWithDetails.leader_user_id !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied. You do not have permission to modify this team.');
      error.statusCode = 403;
      throw error;
    }

    if (teamWithDetails.status !== 'DRAFT') {
      const error = new Error('Only teams in DRAFT status can add new members.');
      error.statusCode = 400;
      throw error;
    }

    const currentMembers = teamWithDetails.members || [];
    const currentTotalSize = 1 + currentMembers.length; // Leader + members
    const maxAllowed = teamWithDetails.event?.max_team_size || 1;

    if (currentTotalSize >= maxAllowed) {
      const error = new Error(
        `Cannot add member: team has already reached the maximum size of ${maxAllowed} participant(s) (including team leader).`
      );
      error.statusCode = 400;
      throw error;
    }

    const memberName = (payload.name || '').trim();
    if (!memberName) {
      const error = new Error('Member name is required and cannot be empty.');
      error.statusCode = 400;
      throw error;
    }
    if (memberName.length < 2) {
      const error = new Error('Member name must be at least 2 characters long.');
      error.statusCode = 400;
      throw error;
    }
    if (memberName.length > 100) {
      const error = new Error('Member name cannot exceed 100 characters.');
      error.statusCode = 400;
      throw error;
    }

    const createdMember = await TeamModel.addTeamMember({
      team_id: teamId,
      name: memberName,
      member_order: currentMembers.length + 1,
    });

    const newTotalSize = currentTotalSize + 1;

    return {
      member: {
        id: createdMember.id,
        name: createdMember.name,
        memberOrder: createdMember.member_order,
        createdAt: createdMember.created_at,
      },
      teamId,
      teamSize: newTotalSize,
      team_size: newTotalSize,
      maxTeamSize: maxAllowed,
    };
  },

  /**
   * Update an existing team member's name.
   */
  updateTeamMember: async (firebaseUser, teamId, memberId, payload) => {
    const user = await resolvePostgresUser(firebaseUser);
    const team = await TeamModel.getTeamById(teamId);

    if (!team) {
      const error = new Error('Team not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader_user_id !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied. You do not have permission to modify this team.');
      error.statusCode = 403;
      throw error;
    }

    if (team.status !== 'DRAFT') {
      const error = new Error('Only members of teams in DRAFT status can be modified.');
      error.statusCode = 400;
      throw error;
    }

    const member = await TeamModel.getTeamMemberById(memberId);
    if (!member || member.team_id !== teamId) {
      const error = new Error('Team member not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    const memberName = (payload.name || '').trim();
    if (!memberName) {
      const error = new Error('Member name is required and cannot be empty.');
      error.statusCode = 400;
      throw error;
    }
    if (memberName.length < 2) {
      const error = new Error('Member name must be at least 2 characters long.');
      error.statusCode = 400;
      throw error;
    }
    if (memberName.length > 100) {
      const error = new Error('Member name cannot exceed 100 characters.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await TeamModel.updateTeamMember(memberId, {
      name: memberName,
    });

    return {
      id: updated.id,
      name: updated.name,
      memberOrder: updated.member_order,
      updatedAt: updated.updated_at,
    };
  },

  /**
   * Remove a member from the team.
   */
  removeTeamMember: async (firebaseUser, teamId, memberId) => {
    const user = await resolvePostgresUser(firebaseUser);
    const team = await TeamModel.getTeamById(teamId);

    if (!team) {
      const error = new Error('Team not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader_user_id !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied. You do not have permission to modify this team.');
      error.statusCode = 403;
      throw error;
    }

    if (team.status !== 'DRAFT') {
      const error = new Error('Only members of teams in DRAFT status can be removed.');
      error.statusCode = 400;
      throw error;
    }

    const member = await TeamModel.getTeamMemberById(memberId);
    if (!member || member.team_id !== teamId) {
      const error = new Error('Team member not found with the provided ID');
      error.statusCode = 404;
      throw error;
    }

    await TeamModel.removeTeamMember(memberId);
    return true;
  },

  /**
   * Validate team readiness and size for registration creation.
   * Ensures team leader is verified, team is DRAFT, and total size is within min/max bounds.
   */
  validateTeamForRegistration: async (teamId, eventId, leaderUserId) => {
    const team = await TeamModel.getTeamWithMembers(teamId);

    if (!team) {
      return {
        isValid: false,
        statusCode: 404,
        message: 'Specified team was not found',
      };
    }

    if (team.leader_user_id !== leaderUserId) {
      return {
        isValid: false,
        statusCode: 403,
        message: 'You are not the leader of this team',
      };
    }

    if (team.event_id !== eventId) {
      return {
        isValid: false,
        statusCode: 400,
        message: 'This team is created for a different event',
      };
    }

    if (team.status !== 'DRAFT') {
      return {
        isValid: false,
        statusCode: 400,
        message: `This team cannot be registered because its status is ${team.status}`,
      };
    }

    const totalTeamSize = 1 + (team.members?.length || 0);
    const minSize = team.event?.min_team_size || 1;
    const maxSize = team.event?.max_team_size || 1;

    if (totalTeamSize < minSize) {
      return {
        isValid: false,
        statusCode: 400,
        message: `Team size (${totalTeamSize}) is less than the required minimum of ${minSize} participants (including team leader)`,
      };
    }

    if (totalTeamSize > maxSize) {
      return {
        isValid: false,
        statusCode: 400,
        message: `Team size (${totalTeamSize}) exceeds the maximum allowed ${maxSize} participants (including team leader)`,
      };
    }

    return {
      isValid: true,
      team,
      totalTeamSize,
    };
  },
};

export default teamService;
