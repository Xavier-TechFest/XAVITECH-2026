/**
 * Standard API Response Utilities
 *
 * Ensures consistent response formatting across all controllers:
 * {
 *   success: true | false,
 *   message: string,
 *   data?: any,
 *   error?: any
 * }
 */

export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null && { data }),
  });
};

export const sendError = (res, message = 'An error occurred', error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error !== null && { error }),
  });
};

export default {
  sendSuccess,
  sendError,
};
