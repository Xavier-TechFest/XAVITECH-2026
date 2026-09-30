import trackLeaderAuthService, {
  TRACK_LEADER_COOKIE_NAME,
  getTrackLeaderCookieOptions,
} from '../services/trackLeaderAuth.service.js';
import config from '../config/env.config.js';
import TrackLeaderAssignmentModel from '../models/trackLeaderAssignment.model.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Track Leader Authentication Controller
 * Handles login, profile retrieval, and single-session logout for TRACK_LEADER role.
 */
export const trackLeaderAuthController = {
  /**
   * POST /api/track-leader/auth/login
   * Authenticate Track Leader credentials and issue a new concurrent session.
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return sendError(res, 'Invalid track leader credentials.', null, 401);
      }

      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || null;

      const result = await trackLeaderAuthService.loginTrackLeader(
        { email, password },
        { userAgent, ipAddress: clientIp }
      );

      // Set secure HttpOnly cookie for browser sessions
      res.cookie(
        TRACK_LEADER_COOKIE_NAME,
        result.token,
        getTrackLeaderCookieOptions(result.expiresAt)
      );

      return sendSuccess(
        res,
        'Track leader login successful',
        {
          user: result.user,
          token: result.token,
          expiresAt: result.expiresAt,
        },
        200
      );
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error during track leader login:', error);
      return sendError(res, 'Invalid track leader credentials.', null, 401);
    }
  },

  /**
   * GET /api/track-leader/auth/me
   * Retrieve safe profile and session information for the authenticated Track Leader.
   * Includes active assigned track resolved directly from the database.
   */
  getMe: async (req, res, next) => {
    try {
      // Resolve active track assignment strictly from the database
      const activeAssignment = await TrackLeaderAssignmentModel.getActiveAssignment(req.user.id);
      const assignedTrack = activeAssignment?.track
        ? {
            id: activeAssignment.track.id,
            name: activeAssignment.track.name,
            slug: activeAssignment.track.slug,
            description: activeAssignment.track.description || null,
            is_active: activeAssignment.track.is_active,
          }
        : null;

      const profile = {
        id: req.user.id,
        name: req.user.name || null,
        email: req.user.email,
        role: req.user.role,
        is_active: req.user.is_active,
        must_change_password: req.user.must_change_password || false,
        sessionId: req.trackLeaderSession?.id || null,
        assignedTrack,
        assignment: activeAssignment
          ? {
              id: activeAssignment.id,
              track_id: activeAssignment.track_id,
              is_active: activeAssignment.is_active,
            }
          : null,
      };

      return sendSuccess(
        res,
        'Track leader profile retrieved',
        {
          user: profile,
          ...profile,
        },
        200
      );
    } catch (error) {
      logger.error('Error fetching track leader profile:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/track-leader/auth/password
   * First login or self-service password change.
   * Enforces current password verification, new password hashing, and session hygiene.
   */
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body || {};

      if (!currentPassword || !newPassword) {
        return sendError(
          res,
          'Both current password and new password are required.',
          null,
          400
        );
      }

      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return sendError(
          res,
          'New password must be at least 8 characters long.',
          null,
          400
        );
      }

      const updatedUser = await trackLeaderAuthService.changePassword({
        userId: req.user.id,
        currentPassword,
        newPassword,
        currentSessionId: req.trackLeaderSession?.id,
      });

      return sendSuccess(
        res,
        'Password changed successfully. You may now access the portal.',
        {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            must_change_password: false,
          },
        },
        200
      );
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error changing track leader password:', error);
      return sendError(res, 'Failed to change password. Please verify current credentials.', null, 400);
    }
  },

  /**
   * POST /api/track-leader/auth/logout
   * Invalidate ONLY the current active session.
   */
  logout: async (req, res, next) => {
    try {
      if (req.trackLeaderSession?.id) {
        await trackLeaderAuthService.logoutSession(req.trackLeaderSession.id);
      }

      const isProduction =
        config.env === 'production' ||
        process.env.NODE_ENV === 'production' ||
        Boolean(process.env.RENDER) ||
        Boolean(process.env.RENDER_SERVICE_ID);

      // Clear the session cookie
      res.clearCookie(TRACK_LEADER_COOKIE_NAME, {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      });

      return sendSuccess(res, 'Logged out successfully from this session.', null, 200);
    } catch (error) {
      logger.error('Error during track leader logout:', error);
      next(error);
    }
  },

  /**
   * POST /api/track-leader/auth/forgot-password
   * Request password recovery link. Always returns a generic anti-enumeration response.
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body || {};
      const result = await trackLeaderAuthService.requestPasswordReset(email);
      return sendSuccess(res, result.message, { message: result.message }, 200);
    } catch (error) {
      logger.error('Error in forgot-password request:', error);
      // Return safe generic response even on unexpected errors
      const safeMsg =
        'If a Track Leader account exists for this email, a password reset link has been sent.';
      return sendSuccess(res, safeMsg, { message: safeMsg }, 200);
    }
  },

  /**
   * POST /api/track-leader/auth/reset-password
   * Set new password using a valid, single-use token.
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword, confirmPassword } = req.body || {};

      if (!token) {
        return sendError(res, 'Invalid or expired password reset link.', null, 400);
      }

      if (!newPassword || !confirmPassword) {
        return sendError(res, 'Both new password and confirm password are required.', null, 400);
      }

      const result = await trackLeaderAuthService.resetPasswordWithToken({
        token,
        newPassword,
        confirmPassword,
      });

      return sendSuccess(res, result.message, null, 200);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error in reset-password submission:', error);
      return sendError(res, 'Invalid or expired password reset link.', null, 400);
    }
  },
};

export default trackLeaderAuthController;


