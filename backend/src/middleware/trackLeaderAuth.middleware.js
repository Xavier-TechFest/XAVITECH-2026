import trackLeaderAuthService, {
  TRACK_LEADER_COOKIE_NAME,
} from '../services/trackLeaderAuth.service.js';
import { sendError } from '../utils/response.util.js';

/**
 * Reusable Track Leader Authentication Middleware
 * Enforces that incoming requests possess a valid, active Track Leader session.
 * Reads session token from either HttpOnly cookie or Authorization Bearer header.
 */
export const requireTrackLeader = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie first
    if (req.cookies && req.cookies[TRACK_LEADER_COOKIE_NAME]) {
      token = req.cookies[TRACK_LEADER_COOKIE_NAME];
    }

    // 2. Check Authorization: Bearer <token> header fallback
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authentication required. No track leader session provided.', null, 401);
    }

    // 3. Validate session in database
    const validation = await trackLeaderAuthService.validateSessionToken(token);
    if (!validation) {
      return sendError(res, 'Invalid or expired track leader session.', null, 401);
    }

    // 4. Verify role is strictly TRACK_LEADER
    if (validation.user.role !== 'TRACK_LEADER') {
      return sendError(res, 'Access denied. Track leader privileges required.', null, 403);
    }

    // 5. Attach authenticated Track Leader user and session details to request
    req.user = validation.user;
    req.trackLeader = validation.user;
    req.trackLeaderSession = validation.session;

    next();
  } catch (error) {
    return sendError(res, 'Internal error verifying track leader session.', null, 500);
  }
};

/**
 * Middleware ensuring Track Leader has already completed the mandatory first-login password change.
 * Blocks access to portal endpoints (e.g. tracks, events) until password is changed.
 */
export const requirePasswordChanged = (req, res, next) => {
  if (req.user && req.user.must_change_password) {
    return res.status(403).json({
      success: false,
      message: 'Password change required before accessing portal data.',
      code: 'PASSWORD_CHANGE_REQUIRED',
      error: { code: 'PASSWORD_CHANGE_REQUIRED' },
    });
  }
  next();
};

export default {
  requireTrackLeader,
  requirePasswordChanged,
};

