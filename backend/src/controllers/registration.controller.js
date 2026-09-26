import { sendSuccess } from '../utils/response.util.js';
import { REGISTRATION_STATUS } from '../utils/constants.util.js';

/**
 * Registration Controller Placeholder
 *
 * Implements endpoints for:
 * - Starting registration (DRAFT)
 * - Adding team members
 * - Reviewing registration summary before payment
 * - Fetching registration status
 */

export const createRegistration = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Registration draft created placeholder endpoint', {
      registrationId: 'placeholder-reg-id',
      status: REGISTRATION_STATUS.DRAFT,
      data: req.body,
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const addTeamMembers = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Team members added placeholder endpoint', {
      registrationId: req.params.id,
      teamName: req.body.teamName,
      members: req.body.members || [],
    });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationById = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Registration details placeholder endpoint', {
      registration: {
        id: req.params.id,
        status: REGISTRATION_STATUS.DRAFT,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listMyRegistrations = async (req, res, next) => {
  try {
    return sendSuccess(res, 'User registrations list placeholder endpoint', {
      registrations: [],
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createRegistration,
  addTeamMembers,
  getRegistrationById,
  listMyRegistrations,
};
