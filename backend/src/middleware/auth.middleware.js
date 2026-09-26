/**
 * Re-export Firebase Authentication Middleware from auth.js
 * Ensures consistent import resolution across existing modules.
 */
export { authenticate, auth, default } from './auth.js';
