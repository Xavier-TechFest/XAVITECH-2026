import { sendError } from '../utils/response.util.js';

/**
 * Role-based Authorization Middleware Placeholder
 *
 * Verifies if the authenticated user has one of the allowed roles (ADMIN, VOLUNTEER, etc.)
 */

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Placeholder logic: will check req.user.role against allowedRoles
    if (!req.user || (req.user.role && !allowedRoles.includes(req.user.role))) {
      return sendError(res, 'Access denied. Insufficient permissions.', null, 403);
    }
    next();
  };
};

export default authorizeRoles;
