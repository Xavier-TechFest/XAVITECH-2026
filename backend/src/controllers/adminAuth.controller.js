import adminAuthService, {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from '../services/adminAuth.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Admin Authentication Controller
 * Handles login, session info retrieval, and single-session logout.
 */
export const adminAuthController = {
  /**
   * POST /api/admin/auth/login
   * Authenticate admin credentials and issue a new concurrent session.
   */
  login: async (req, res, next) => {
    try {
      const { email, password, secretKey } = req.body || {};

      if (!email || !password || !secretKey) {
        return sendError(res, 'Invalid admin credentials.', null, 401);
      }

      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || null;

      const result = await adminAuthService.loginAdmin(
        { email, password, secretKey },
        { userAgent, ipAddress: clientIp }
      );

      // Set secure HttpOnly cookie for browser sessions
      res.cookie(ADMIN_COOKIE_NAME, result.token, getAdminCookieOptions(result.expiresAt));

      return sendSuccess(
        res,
        'Admin login successful',
        {
          admin: result.admin,
          token: result.token,
          expiresAt: result.expiresAt,
        },
        200
      );
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, null, error.statusCode);
      }
      logger.error('Error during admin login:', error);
      return sendError(res, 'Invalid admin credentials.', null, 401);
    }
  },

  /**
   * GET /api/admin/auth/me
   * Retrieve safe profile information for the authenticated admin.
   */
  getMe: async (req, res) => {
    return sendSuccess(
      res,
      'Admin profile retrieved',
      {
        id: req.user.id,
        name: req.user.name || 'Administrator',
        email: req.user.email,
        role: req.user.role,
        sessionId: req.adminSession?.id || null,
      },
      200
    );
  },

  /**
   * POST /api/admin/auth/logout
   * Invalidate ONLY the current active session.
   */
  logout: async (req, res, next) => {
    try {
      if (req.adminSession?.id) {
        await adminAuthService.logoutSession(req.adminSession.id);
      }

      // Clear the session cookie
      res.clearCookie(ADMIN_COOKIE_NAME, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });

      return sendSuccess(res, 'Logged out successfully from this session.', null, 200);
    } catch (error) {
      logger.error('Error during admin logout:', error);
      next(error);
    }
  },
};

export default adminAuthController;
