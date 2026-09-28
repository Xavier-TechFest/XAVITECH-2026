import adminTrackLeaderService from '../services/adminTrackLeader.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Admin Track Leader Management Controller
 * Handles listing, creation, inspection, editing, deactivation, and credential reset for Track Leaders.
 */
export const adminTrackLeaderController = {
  /**
   * GET /api/admin/track-leaders
   */
  listTrackLeaders: async (req, res, next) => {
    try {
      const { page, limit, search, trackId, status } = req.query;
      const result = await adminTrackLeaderService.listTrackLeaders({
        page,
        limit,
        search,
        trackId,
        status,
      });

      return sendSuccess(res, 'Track leaders retrieved successfully', result, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error in listTrackLeaders:', error);
      next(error);
    }
  },

  /**
   * POST /api/admin/track-leaders
   */
  createTrackLeader: async (req, res, next) => {
    try {
      const { name, email, trackId } = req.body || {};
      const result = await adminTrackLeaderService.createTrackLeader({
        name,
        email,
        trackId,
      });

      const message = result.emailSent
        ? 'Track leader created successfully and credentials emailed.'
        : 'Track leader created successfully. (Email delivery skipped or unavailable)';

      return sendSuccess(
        res,
        message,
        {
          user: result.user,
          track: result.track,
          temporaryPassword: result.temporaryPassword,
          emailSent: Boolean(result.emailSent),
        },
        201
      );
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error in createTrackLeader:', error);
      next(error);
    }
  },

  /**
   * GET /api/admin/track-leaders/:id
   */
  getTrackLeaderById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await adminTrackLeaderService.getTrackLeaderById(id);

      return sendSuccess(res, 'Track leader retrieved successfully', result, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error in getTrackLeaderById:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/admin/track-leaders/:id
   */
  updateTrackLeader: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, trackId } = req.body || {};

      // Filter out any unauthorized fields
      const result = await adminTrackLeaderService.updateTrackLeader(id, {
        name,
        email,
        trackId,
      });

      return sendSuccess(res, 'Track leader updated successfully', result, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error in updateTrackLeader:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/admin/track-leaders/:id/status
   */
  updateTrackLeaderStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body || {};

      const result = await adminTrackLeaderService.updateTrackLeaderStatus(id, is_active);

      return sendSuccess(
        res,
        `Track leader ${is_active ? 'activated' : 'deactivated'} successfully`,
        result,
        200
      );
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error in updateTrackLeaderStatus:', error);
      next(error);
    }
  },

  /**
   * POST /api/admin/track-leaders/:id/reset-credentials
   */
  resetCredentials: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await adminTrackLeaderService.resetCredentials(id);

      const message = result.emailSent
        ? 'Credentials reset successfully and emailed to Track Leader.'
        : 'Credentials reset successfully. (Email delivery skipped or unavailable)';

      return sendSuccess(
        res,
        message,
        {
          user: result.user,
          temporaryPassword: result.temporaryPassword,
          emailSent: Boolean(result.emailSent),
        },
        200
      );
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error in resetCredentials:', error);
      next(error);
    }
  },
};

export default adminTrackLeaderController;
