import TrackLeaderModel from '../models/trackLeader.model.js';
import config from '../config/env.config.js';
import {
  comparePassword,
  generateSessionToken,
  hashSessionToken,
} from '../utils/security.util.js';
import logger from '../utils/logger.util.js';

export const TRACK_LEADER_COOKIE_NAME = 'xavitech_track_leader_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generates cookie configuration options for Track Leader session.
 */
export const getTrackLeaderCookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  path: '/',
  expires: expiresAt,
});

/**
 * Track Leader Authentication Service
 * Implements credential-based login, multi-session support, independent logout, and generic error handling.
 */
export const trackLeaderAuthService = {
  /**
   * Authenticate Track Leader using Email + Password.
   * Strictly enforces role === 'TRACK_LEADER'.
   * Creates an independent session without invalidating existing sessions.
   *
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @param {Object} context
   * @returns {Promise<Object>} Safe user and token response
   */
  loginTrackLeader: async (
    { email, password },
    { userAgent = null, ipAddress = null } = {}
  ) => {
    const genericAuthError = () => {
      const error = new Error('Invalid track leader credentials.');
      error.statusCode = 401;
      return error;
    };

    // 1. Basic presence check
    if (!email || !password) {
      throw genericAuthError();
    }

    // 2. Find user by email (case-insensitive) strictly for TRACK_LEADER role
    const cleanEmail = String(email).toLowerCase().trim();
    const trackLeader = await TrackLeaderModel.getTrackLeaderByEmail(cleanEmail);

    if (
      !trackLeader ||
      trackLeader.role !== 'TRACK_LEADER' ||
      !trackLeader.is_active ||
      !trackLeader.password_hash
    ) {
      logger.warn(
        `Failed track leader login attempt: lookup failed for ${cleanEmail} from IP ${ipAddress}`
      );
      throw genericAuthError();
    }

    // 3. Verify password hash using bcrypt
    const isPasswordValid = await comparePassword(password, trackLeader.password_hash);
    if (!isPasswordValid) {
      logger.warn(
        `Failed track leader login attempt: invalid password for ${cleanEmail} from IP ${ipAddress}`
      );
      throw genericAuthError();
    }

    // 4. Generate cryptographically secure random session token
    const plainToken = generateSessionToken();
    const tokenHash = hashSessionToken(plainToken);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // 5. Store session in track_leader_sessions table (concurrent sessions supported)
    const session = await TrackLeaderModel.createSession({
      user_id: trackLeader.id,
      token_hash: tokenHash,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: expiresAt.toISOString(),
    });

    const activeCount = await TrackLeaderModel.getActiveSessionsCount(trackLeader.id);
    logger.info(
      `Track Leader logged in: ${trackLeader.email} (Session: ${session.id}, Active sessions: ${activeCount})`
    );

    return {
      token: plainToken,
      expiresAt,
      sessionId: session.id,
      user: {
        id: trackLeader.id,
        email: trackLeader.email,
        name: trackLeader.name,
        role: trackLeader.role,
        is_active: trackLeader.is_active,
        must_change_password: trackLeader.must_change_password || false,
      },
    };
  },

  /**
   * Validate session token from Cookie or Bearer header.
   *
   * @param {string} plainToken
   * @returns {Promise<Object|null>}
   */
  validateSessionToken: async (plainToken) => {
    if (!plainToken || typeof plainToken !== 'string') return null;

    const tokenHash = hashSessionToken(plainToken.trim());
    const sessionWithUser = await TrackLeaderModel.getActiveSessionByHash(tokenHash);

    if (!sessionWithUser || !sessionWithUser.user) {
      return null;
    }

    // Verify user is still active and has correct role
    if (!sessionWithUser.user.is_active || sessionWithUser.user.role !== 'TRACK_LEADER') {
      return null;
    }

    // Update session last_used timestamp asynchronously
    TrackLeaderModel.touchSession(sessionWithUser.id).catch((err) =>
      logger.debug('Failed to touch track leader session:', err.message)
    );

    return {
      session: {
        id: sessionWithUser.id,
        expiresAt: sessionWithUser.expires_at,
        createdAt: sessionWithUser.created_at,
      },
      user: {
        id: sessionWithUser.user.id,
        email: sessionWithUser.user.email,
        name: sessionWithUser.user.name,
        role: sessionWithUser.user.role,
        is_active: sessionWithUser.user.is_active,
        must_change_password: sessionWithUser.user.must_change_password || false,
      },
    };
  },

  /**
   * Invalidate ONLY the specified session.
   * Other concurrent sessions for this Track Leader remain completely valid.
   *
   * @param {string} sessionId
   * @returns {Promise<boolean>}
   */
  logoutSession: async (sessionId) => {
    if (!sessionId) return false;
    await TrackLeaderModel.revokeSession(sessionId);
    logger.info(`Track Leader session revoked: ${sessionId}`);
    return true;
  },
};

export default trackLeaderAuthService;
