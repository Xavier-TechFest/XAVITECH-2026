import teamService from '../services/team.service.js';
import {
  validateTeamCreate,
  validateTeamUpdate,
  validateTeamMember,
} from '../validators/team.validator.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Team Controller
 * HTTP handlers for team management and team member actions.
 */
export const teamController = {
  /**
   * POST /api/teams
   * Create a new team for an event. Authenticated user is the team leader.
   */
  createTeam: async (req, res, next) => {
    try {
      const validation = validateTeamCreate(req.body);
      if (!validation.isValid) {
        return sendError(res, validation.errors.join(', '), 400);
      }

      const team = await teamService.createTeam(req.user, req.body);
      return sendSuccess(res, team, 201);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode, error.data);
      }
      logger.error('Error creating team:', error);
      next(error);
    }
  },

  /**
   * GET /api/teams/my
   * Fetch all teams led by the authenticated user.
   */
  getMyTeams: async (req, res, next) => {
    try {
      const teams = await teamService.getMyTeams(req.user);
      return sendSuccess(res, teams, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      logger.error('Error fetching my teams:', error);
      next(error);
    }
  },

  /**
   * GET /api/teams/:teamId
   * Fetch complete details of a specific team.
   */
  getTeamDetails: async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const team = await teamService.getTeamDetails(req.user, teamId);
      return sendSuccess(res, team, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      logger.error('Error fetching team details:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/teams/:teamId
   * Rename / update team details.
   */
  updateTeam: async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const validation = validateTeamUpdate(req.body);
      if (!validation.isValid) {
        return sendError(res, validation.errors.join(', '), 400);
      }

      const updated = await teamService.updateTeam(req.user, teamId, req.body);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      logger.error('Error updating team:', error);
      next(error);
    }
  },

  /**
   * DELETE /api/teams/:teamId
   * Delete a team in DRAFT status.
   */
  deleteTeam: async (req, res, next) => {
    try {
      const { teamId } = req.params;
      await teamService.deleteTeam(req.user, teamId);
      return sendSuccess(res, { message: 'Team deleted successfully' }, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      logger.error('Error deleting team:', error);
      next(error);
    }
  },

  /**
   * POST /api/teams/:teamId/members
   * Add a new member to the team.
   */
  addTeamMember: async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const validation = validateTeamMember(req.body);
      if (!validation.isValid) {
        return sendError(res, validation.errors.join(', '), 400);
      }

      const added = await teamService.addTeamMember(req.user, teamId, req.body);
      return sendSuccess(res, added, 201);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      logger.error('Error adding team member:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/teams/:teamId/members/:memberId
   * Update a team member's name.
   */
  updateTeamMember: async (req, res, next) => {
    try {
      const { teamId, memberId } = req.params;
      const validation = validateTeamMember(req.body);
      if (!validation.isValid) {
        return sendError(res, validation.errors.join(', '), 400);
      }

      const updated = await teamService.updateTeamMember(req.user, teamId, memberId, req.body);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      logger.error('Error updating team member:', error);
      next(error);
    }
  },

  /**
   * DELETE /api/teams/:teamId/members/:memberId
   * Remove a member from the team.
   */
  removeTeamMember: async (req, res, next) => {
    try {
      const { teamId, memberId } = req.params;
      await teamService.removeTeamMember(req.user, teamId, memberId);
      return sendSuccess(res, { message: 'Team member removed successfully' }, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      logger.error('Error removing team member:', error);
      next(error);
    }
  },
};

export default teamController;
