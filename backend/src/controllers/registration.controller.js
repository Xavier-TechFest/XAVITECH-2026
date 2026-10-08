import registrationService from '../services/registration.service.js';
import { sendSuccess } from '../utils/response.util.js';

/**
 * Registration Controller
 * Handles HTTP requests for creating draft registrations, viewing user's registrations,
 * and viewing individual registration details.
 */

/**
 * POST /api/registrations
 * Creates a new draft registration for the authenticated user.
 */
export const createRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.createRegistration(req.user, req.body);
    return sendSuccess(res, 'Registration created successfully', registration, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/registrations/my
 * Returns all registrations belonging strictly to the authenticated user.
 */
export const listMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.getUserRegistrations(req.user, req.query);
    return sendSuccess(res, 'User registrations retrieved successfully', registrations);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/registrations/:registrationId
 * Returns registration details with strict ownership verification.
 */
export const getRegistrationById = async (req, res, next) => {
  try {
    const identifier = req.params.registrationId || req.params.id;
    const registration = await registrationService.getRegistrationDetails(req.user, identifier);
    return sendSuccess(res, 'Registration details retrieved successfully', registration);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/registrations/:registrationId/submit
 * Finalizes a draft registration and transitions its status to PAYMENT_PENDING.
 */
export const submitRegistration = async (req, res, next) => {
  try {
    const identifier = req.params.registrationId || req.params.id;
    const registration = await registrationService.submitRegistration(req.user, identifier);
    return sendSuccess(res, 'Registration submitted successfully', registration);
  } catch (error) {
    next(error);
  }
};

export default {
  createRegistration,
  listMyRegistrations,
  getRegistrationById,
  submitRegistration,
};
