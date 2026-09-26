import { sendSuccess } from '../utils/response.util.js';

/**
 * Auth Controller Placeholder
 * Handles Google Login via Firebase ID token exchange.
 */

export const handleGoogleLogin = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Google login placeholder endpoint', {
      user: {
        id: 'placeholder-user-id',
        email: 'user@example.com',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Current user session placeholder endpoint', {
      user: req.user || null,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  handleGoogleLogin,
  getMe,
};
