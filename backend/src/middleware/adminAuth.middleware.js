import adminAuthService, { ADMIN_COOKIE_NAME } from '../services/adminAuth.service.js';
import { sendError } from '../utils/response.util.js';

/**
 * Reusable Admin Authentication Middleware
 * Enforces that incoming requests possess a valid, active admin session.
 * Reads session token from either HttpOnly cookie or Authorization Bearer header.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie first
    if (req.cookies && req.cookies[ADMIN_COOKIE_NAME]) {
      token = req.cookies[ADMIN_COOKIE_NAME];
    }

    // 2. Check Authorization: Bearer <token> header fallback
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authentication required. No admin session provided.', null, 401);
    }

    // 3. Validate session in database
    const validation = await adminAuthService.validateSessionToken(token);
    if (!validation) {
      return sendError(res, 'Invalid or expired admin session.', null, 401);
    }

    // 4. Verify role is strictly ADMIN
    if (validation.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. Administrator privileges required.', null, 403);
    }

    // 5. Attach authenticated admin user and session details to request
    req.user = validation.user;
    req.adminSession = validation.session;

    next();
  } catch (error) {
    return sendError(res, 'Internal error verifying admin session.', null, 500);
  }
};

export default {
  requireAdmin,
};
