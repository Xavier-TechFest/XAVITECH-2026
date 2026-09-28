import crypto from 'crypto';
import TrackLeaderModel from '../models/trackLeader.model.js';
import TrackLeaderPasswordResetModel from '../models/trackLeaderPasswordReset.model.js';
import brevoEmailService, { getEmailConfig } from './brevoEmail.service.js';
import config from '../config/env.config.js';
import {
  hashPassword,
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

  /**
   * Change password for authenticated Track Leader.
   * Enforces verification of current password, validation of new password (min 8 chars),
   * updates password_hash, sets must_change_password = false, and revokes other sessions.
   *
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.currentPassword
   * @param {string} params.newPassword
   * @param {string} [params.currentSessionId]
   * @returns {Promise<Object>} Safe updated user profile
   */
  changePassword: async ({
    userId,
    currentPassword,
    newPassword,
    currentSessionId = null,
  }) => {
    if (!currentPassword || !newPassword) {
      const err = new Error('Both current password and new password are required.');
      err.statusCode = 400;
      throw err;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      const err = new Error('New password must be at least 8 characters long.');
      err.statusCode = 400;
      throw err;
    }

    if (currentPassword === newPassword) {
      const err = new Error('New password must be different from current password.');
      err.statusCode = 400;
      throw err;
    }

    // 1. Look up Track Leader user
    const trackLeader = await TrackLeaderModel.getTrackLeaderById(userId);
    if (!trackLeader || trackLeader.role !== 'TRACK_LEADER' || !trackLeader.is_active) {
      const err = new Error('Track leader account not found or inactive.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Verify current password
    const isCurrentValid = await comparePassword(currentPassword, trackLeader.password_hash);
    if (!isCurrentValid) {
      logger.warn(`Failed track leader password change attempt: invalid current password for user ${userId}`);
      const err = new Error('Current password is incorrect.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // 4. Update database record
    const updatedUser = await TrackLeaderModel.updatePassword(userId, newPasswordHash);

    // 5. Revoke other active sessions (keeping current session valid)
    if (currentSessionId) {
      await TrackLeaderModel.revokeOtherSessions(userId, currentSessionId);
    }

    logger.info(`Track Leader password successfully changed for user: ${trackLeader.email}`);

    return updatedUser;
  },

  /**
   * Request password recovery for Track Leader.
   * Returns a generic anti-enumeration response in all cases (whether user exists or not).
   *
   * @param {string} email
   * @returns {Promise<{ message: string, emailSent?: boolean }>}
   */
  requestPasswordReset: async (email) => {
    const genericResponse = {
      message: 'If a Track Leader account exists for this email, a password reset link has been sent.',
    };

    if (!email || typeof email !== 'string') {
      return genericResponse;
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const trackLeader = await TrackLeaderModel.getTrackLeaderByEmail(cleanEmail);

    // If user does not exist, is not TRACK_LEADER, or is inactive, return same generic response
    if (
      !trackLeader ||
      trackLeader.role !== 'TRACK_LEADER' ||
      !trackLeader.is_active
    ) {
      logger.info(`Password reset requested for non-existent or ineligible track leader: ${cleanEmail}`);
      return genericResponse;
    }

    // Generate cryptographically secure random token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSessionToken(rawToken);

    // Reset token expires in 30 minutes
    const EXPIRES_IN_MINUTES = 30;
    const expiresAt = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000).toISOString();

    // Store in track_leader_password_resets (invalidates any older tokens for this user)
    await TrackLeaderPasswordResetModel.createResetToken({
      userId: trackLeader.id,
      tokenHash,
      expiresAt,
    });

    const emailConfig = getEmailConfig();
    const resetUrl = `${emailConfig.frontendUrl}/track-leader/reset-password?token=${rawToken}`;

    // Send email via Brevo
    try {
      await brevoEmailService.sendTrackLeaderPasswordResetEmail({
        email: trackLeader.email,
        name: trackLeader.name,
        resetUrl,
        expiresInMinutes: EXPIRES_IN_MINUTES,
      });
      logger.info(`Password reset email dispatched to track leader: ${trackLeader.email}`);
    } catch (emailErr) {
      logger.error(`Failed to send password reset email to ${trackLeader.email}:`, emailErr);
    }

    return genericResponse;
  },

  /**
   * Complete password reset using a single-use token.
   * Enforces token validation, non-expired, single-use, updates password_hash,
   * sets must_change_password = false, marks token as used, and revokes all sessions.
   *
   * @param {Object} params
   * @param {string} params.token - Raw reset token from URL
   * @param {string} params.newPassword
   * @param {string} params.confirmPassword
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  resetPasswordWithToken: async ({ token, newPassword, confirmPassword }) => {
    const invalidTokenError = () => {
      const err = new Error('Invalid or expired password reset link.');
      err.statusCode = 400;
      return err;
    };

    if (!token || typeof token !== 'string') {
      throw invalidTokenError();
    }

    if (!newPassword || !confirmPassword) {
      const err = new Error('Both new password and confirm password are required.');
      err.statusCode = 400;
      throw err;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      const err = new Error('New password must be at least 8 characters long.');
      err.statusCode = 400;
      throw err;
    }

    if (newPassword !== confirmPassword) {
      const err = new Error('New password and confirmation do not match.');
      err.statusCode = 400;
      throw err;
    }

    // 1. Look up token in database by SHA-256 hash
    const tokenHash = hashSessionToken(token.trim());
    const resetRecord = await TrackLeaderPasswordResetModel.getActiveResetByHash(tokenHash);

    if (!resetRecord || !resetRecord.user) {
      throw invalidTokenError();
    }

    // 2. Verify account is active and role is TRACK_LEADER
    if (!resetRecord.user.is_active || resetRecord.user.role !== 'TRACK_LEADER') {
      throw invalidTokenError();
    }

    // 3. Hash new password with bcrypt
    const newPasswordHash = await hashPassword(newPassword);

    // 4. Update user's password and reset must_change_password flag
    await TrackLeaderModel.updatePassword(resetRecord.user_id, newPasswordHash);

    // 5. Mark the reset token as used (single-use enforcement)
    await TrackLeaderPasswordResetModel.markResetTokenUsed(resetRecord.id);

    // 6. Invalidate all existing sessions for this Track Leader
    await TrackLeaderModel.revokeAllSessions(resetRecord.user_id);

    logger.info(`Track Leader password successfully reset using token for: ${resetRecord.user.email}`);

    return {
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    };
  },
};

export default trackLeaderAuthService;

