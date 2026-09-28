import trackLeaderAuthService, {
  TRACK_LEADER_COOKIE_NAME,
  getTrackLeaderCookieOptions,
} from '../services/trackLeaderAuth.service.js';
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
   */
  getMe: async (req, res) => {
    const profile = {
      id: req.user.id,
      name: req.user.name || null,
      email: req.user.email,
      role: req.user.role,
      is_active: req.user.is_active,
      must_change_password: req.user.must_change_password || false,
      sessionId: req.trackLeaderSession?.id || null,
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

      // Clear the session cookie
      res.clearCookie(TRACK_LEADER_COOKIE_NAME, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });

      return sendSuccess(res, 'Logged out successfully from this session.', null, 200);
    } catch (error) {
      logger.error('Error during track leader logout:', error);
      next(error);
    }
  },
};

export default trackLeaderAuthController;
