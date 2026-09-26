import { sendSuccess } from '../utils/response.util.js';

/**
 * Admin Controller Placeholder
 * Handles admin metrics, participant listings, and day-of-event check-in scanning.
 */

export const getDashboardStats = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Admin dashboard stats placeholder endpoint', {
      totalRegistrations: 0,
      totalRevenue: 0,
      checkedInCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const listAllRegistrations = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Admin all registrations placeholder endpoint', {
      registrations: [],
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAndCheckIn = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Check-in scan verification placeholder endpoint', {
      checkInStatus: 'CHECKED_IN',
      participant: {
        registrationId: req.body.registrationId || 'placeholder-reg-id',
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  listAllRegistrations,
  verifyAndCheckIn,
};
