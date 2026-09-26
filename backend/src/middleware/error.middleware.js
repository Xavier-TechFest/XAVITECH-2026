import { sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * 404 Not Found Middleware for undefined endpoints
 */
export const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, null, 404);
};

/**
 * Global Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing ${req.method} ${req.url}:`, err.message || err);

  // Explicit status for CORS rejection
  if (err.message && err.message.startsWith('CORS policy blocked')) {
    return sendError(res, err.message, null, 403);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
    statusCode
  );
};

export default {
  notFoundHandler,
  errorHandler,
};
