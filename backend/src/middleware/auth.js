import { getFirebaseAuth } from '../config/firebase.js';
import { sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Firebase Authentication Middleware
 *
 * Enforces authentication by verifying the Firebase ID token
 * supplied in the HTTP Authorization header:
 *
 *   Authorization: Bearer <Firebase ID Token>
 *
 * On success, attaches verified user data to `req.user`.
 * Never accepts user ID or email directly from request parameters or body.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for Authorization header presence
  if (!authHeader) {
    return sendError(res, 'Authorization header is missing. Access denied.', null, 401);
  }

  // 2. Validate Bearer scheme
  if (!authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Invalid authorization format. Format must be: Bearer <token>', null, 401);
  }

  // 3. Extract Bearer token
  const token = authHeader.substring(7).trim();
  if (!token) {
    return sendError(res, 'Bearer token is missing. Access denied.', null, 401);
  }

  // 4. Ensure Firebase Admin Auth instance is available
  const auth = getFirebaseAuth();
  if (!auth) {
    logger.error('Firebase Auth instance is not initialized. Please verify Firebase credentials in .env.');
    return sendError(res, 'Authentication service is currently unavailable. Firebase Admin is not configured.', null, 500);
  }

  // 5. Verify the Firebase ID token
  try {
    const decodedToken = await auth.verifyIdToken(token);

    // Attach verified user information to the request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    };

    return next();
  } catch (error) {
    logger.warn(`Firebase token verification failed [${error.code || 'unknown'}]:`, error.message);

    if (error.code === 'auth/id-token-expired') {
      return sendError(res, 'Firebase token has expired. Please sign in again.', null, 401);
    }

    if (error.code === 'auth/id-token-revoked') {
      return sendError(res, 'Firebase token has been revoked. Please sign in again.', null, 401);
    }

    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return sendError(res, 'Invalid Firebase ID token.', null, 401);
    }

    return sendError(res, 'Authentication failed: Invalid or expired token.', null, 401);
  }
};

export const auth = authenticate;
export default authenticate;
