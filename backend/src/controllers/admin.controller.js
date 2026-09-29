import adminRegistrationService from '../services/adminRegistration.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Admin Controller
 * Handles admin metrics, registration management, team inspection, and check-in scanning.
 */

/**
 * GET /api/admin/stats & GET /api/admin/dashboard/stats
 * Overview metrics calculated directly from the live database.
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminRegistrationService.getDashboardStats();
    return sendSuccess(res, 'Dashboard statistics retrieved successfully', stats, 200);
  } catch (error) {
    logger.error('Error retrieving dashboard stats:', error);
    next(error);
  }
};

/**
 * GET /api/admin/registrations
 * Paginated, searchable, and filterable registrations listing.
 */
export const listRegistrations = async (req, res, next) => {
  try {
    const { page, limit, search, trackId, eventId, registrationType, status } = req.query;

    const result = await adminRegistrationService.listRegistrations({
      page,
      limit,
      search,
      trackId,
      eventId,
      registrationType,
      status,
    });

    return sendSuccess(res, 'Registrations retrieved successfully', result, 200);
  } catch (error) {
    logger.error('Error retrieving registrations list:', error);
    next(error);
  }
};

/**
 * Backward compatibility alias for listRegistrations.
 */
export const listAllRegistrations = listRegistrations;

/**
 * GET /api/admin/registrations/:registrationId
 * Full detail view for a specific registration (UUID or registration_id code).
 */
export const getRegistrationDetails = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const registration = await adminRegistrationService.getRegistrationDetails(registrationId);

    if (!registration) {
      return sendError(res, 'Registration not found', null, 404);
    }

    return sendSuccess(res, 'Registration details retrieved successfully', registration, 200);
  } catch (error) {
    logger.error('Error retrieving registration details:', error);
    next(error);
  }
};

/**
 * GET /api/admin/teams
 * Paginated, searchable, and filterable teams listing.
 */
export const listTeams = async (req, res, next) => {
  try {
    const { page, limit, search, eventId, status } = req.query;

    const result = await adminRegistrationService.listTeams({
      page,
      limit,
      search,
      eventId,
      status,
    });

    return sendSuccess(res, 'Teams retrieved successfully', result, 200);
  } catch (error) {
    logger.error('Error retrieving teams list:', error);
    next(error);
  }
};

/**
 * GET /api/admin/teams/:teamId
 * Full detail view for a specific team.
 */
export const getTeamDetails = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await adminRegistrationService.getTeamDetails(teamId);

    if (!team) {
      return sendError(res, 'Team not found', null, 404);
    }

    return sendSuccess(res, 'Team details retrieved successfully', team, 200);
  } catch (error) {
    logger.error('Error retrieving team details:', error);
    next(error);
  }
};

/**
 * POST /api/admin/check-in
 * Check-in scan verification placeholder endpoint.
 */
export const verifyAndCheckIn = async (req, res, next) => {
  try {
    return sendSuccess(
      res,
      'Check-in scan verification placeholder endpoint',
      {
        checkInStatus: 'CHECKED_IN',
        participant: {
          registrationId: req.body?.registrationId || 'placeholder-reg-id',
        },
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  listRegistrations,
  listAllRegistrations,
  getRegistrationDetails,
  listTeams,
  getTeamDetails,
  verifyAndCheckIn,
};
