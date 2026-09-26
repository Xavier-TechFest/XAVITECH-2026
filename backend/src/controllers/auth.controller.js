import { sendSuccess } from '../utils/response.util.js';

/**
 * Get current authenticated user session
 * Requires: Firebase authenticate middleware
 * Source: req.user (populated from verified Firebase ID token)
 */
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMe,
};
