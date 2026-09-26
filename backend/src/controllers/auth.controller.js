import userService from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Get current authenticated user session & PostgreSQL profile
 * Synchronizes new users to PostgreSQL on first login.
 * Endpoint: GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return sendError(res, 'Authentication required', null, 401);
    }

    // Synchronize or fetch PostgreSQL user profile from verified Firebase token
    const userProfile = await userService.getOrCreateUserFromFirebase(req.user);

    return res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    logger.error('Error retrieving user profile in getMe:', error.message);
    next(error);
  }
};

/**
 * Update authenticated user's profile
 * Strictly updates only the caller's profile via req.user.uid
 * Endpoint: PATCH /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return sendError(res, 'Authentication required', null, 401);
    }

    // Ensure user exists before updating
    const existing = await userService.getOrCreateUserFromFirebase(req.user);
    if (!existing) {
      return sendError(res, 'User record not found in database', null, 404);
    }

    // Update only safe allowed fields
    const updatedUser = await userService.updateUserProfile(req.user.uid, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating profile:', error.message);
    next(error);
  }
};

export default {
  getMe,
  updateProfile,
};
