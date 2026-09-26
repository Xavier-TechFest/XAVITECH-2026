import { sendError } from '../utils/response.util.js';

/**
 * Authentication Middleware Placeholder
 *
 * Verifies Firebase ID Token passed in Authorization header:
 *   Authorization: Bearer <firebase_id_token>
 *
 * Future implementation:
 *   const decodedToken = await admin.auth().verifyIdToken(token);
 *   req.user = decodedToken;
 */

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Missing or malformed token.', null, 401);
  }

  // Placeholder: pass through for now until Firebase Admin SDK is wired
  // req.user = { uid: 'placeholder-uid', email: 'user@example.com' };
  next();
};

export default authenticate;
