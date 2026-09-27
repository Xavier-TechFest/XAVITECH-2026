import AdminModel from '../models/admin.model.js';
import config from '../config/env.config.js';
import {
  comparePassword,
  generateSessionToken,
  hashSessionToken,
  verifySecretKey,
} from '../utils/security.util.js';
import logger from '../utils/logger.util.js';

export const ADMIN_COOKIE_NAME = 'xavitech_admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generates cookie configuration options for admin session.
 */
export const getAdminCookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  path: '/',
  expires: expiresAt,
});

/**
 * Admin Authentication Service
 * Implements secure login with multi-session support, independent logout, and generic error handling.
 */
export const adminAuthService = {
  /**
   * Authenticate admin using Email + Password + Secret Key.
   * Creates an independent session without invalidating existing sessions.
   */
  loginAdmin: async ({ email, password, secretKey }, { userAgent = null, ipAddress = null } = {}) => {
    const genericAuthError = () => {
      const error = new Error('Invalid admin credentials.');
      error.statusCode = 401;
      return error;
    };

    // 1. Basic presence check
    if (!email || !password || !secretKey) {
      throw genericAuthError();
    }

    // 2. Timing-safe verification of Server-Side Admin Secret Key
    const isSecretValid = verifySecretKey(secretKey, config.admin.secretKey);
    if (!isSecretValid) {
      logger.warn(`Failed admin login attempt: invalid secret key from IP ${ipAddress}`);
      throw genericAuthError();
    }

    // 3. Find the single ADMIN user record by email
    const cleanEmail = String(email).toLowerCase().trim();
    const adminUser = await AdminModel.getAdminByEmail(cleanEmail);

    if (!adminUser || adminUser.role !== 'ADMIN' || !adminUser.is_active || !adminUser.password_hash) {
      logger.warn(`Failed admin login attempt: account lookup failed for ${cleanEmail} from IP ${ipAddress}`);
      throw genericAuthError();
    }

    // 4. Verify password hash using bcrypt
    const isPasswordValid = await comparePassword(password, adminUser.password_hash);
    if (!isPasswordValid) {
      logger.warn(`Failed admin login attempt: invalid password for ${cleanEmail} from IP ${ipAddress}`);
      throw genericAuthError();
    }

    // 5. Generate independent session token
    const plainToken = generateSessionToken();
    const tokenHash = hashSessionToken(plainToken);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // 6. Store session in database (concurrent sessions supported)
    const session = await AdminModel.createAdminSession({
      admin_user_id: adminUser.id,
      session_token_hash: tokenHash,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: expiresAt.toISOString(),
    });

    const activeCount = await AdminModel.getActiveSessionsCount(adminUser.id);
    logger.info(`Admin logged in: ${adminUser.email} (Session: ${session.id}, Active sessions: ${activeCount})`);

    return {
      token: plainToken,
      expiresAt,
      sessionId: session.id,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    };
  },

  /**
   * Validate session token from Cookie or Bearer header.
   */
  validateSessionToken: async (plainToken) => {
    if (!plainToken || typeof plainToken !== 'string') return null;

    const tokenHash = hashSessionToken(plainToken.trim());
    const sessionWithUser = await AdminModel.getActiveSessionByHash(tokenHash);

    if (!sessionWithUser || !sessionWithUser.user) {
      return null;
    }

    // Verify user is still active and has role = 'ADMIN'
    if (!sessionWithUser.user.is_active || sessionWithUser.user.role !== 'ADMIN') {
      return null;
    }

    // Update session last_used timestamp asynchronously
    AdminModel.touchSession(sessionWithUser.id).catch((err) =>
      logger.debug('Failed to touch session:', err.message)
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
      },
    };
  },

  /**
   * Invalidate ONLY the current active session.
   * Other concurrent sessions for this admin remain completely valid.
   */
  logoutSession: async (sessionId) => {
    if (!sessionId) return false;
    await AdminModel.revokeSession(sessionId);
    logger.info(`Admin session revoked: ${sessionId}`);
    return true;
  },

  /**
   * Optional: Invalidate all sessions for an admin.
   */
  logoutAllSessions: async (adminUserId) => {
    if (!adminUserId) return false;
    await AdminModel.revokeAllSessionsForAdmin(adminUserId);
    logger.info(`All admin sessions revoked for user: ${adminUserId}`);
    return true;
  },
};

export default adminAuthService;
