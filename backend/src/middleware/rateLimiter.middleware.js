import { sendError } from '../utils/response.util.js';

/**
 * In-memory brute force rate limiter for Admin Login
 * Limits failed login attempts per client IP.
 */
class LoginRateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxAttempts = 10) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
    this.attempts = new Map(); // ip -> { count, firstAttempt }
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
      const now = Date.now();
      const record = this.attempts.get(ip);

      if (record) {
        if (now - record.firstAttempt > this.windowMs) {
          // Reset window
          this.attempts.set(ip, { count: 1, firstAttempt: now });
        } else if (record.count >= this.maxAttempts) {
          return sendError(
            res,
            'Too many failed login attempts. Please try again after 15 minutes.',
            null,
            429
          );
        }
      }

      // Hook response finish to increment only on authentication failure (401/400)
      res.on('finish', () => {
        if (res.statusCode === 401 || res.statusCode === 400) {
          const cur = this.attempts.get(ip);
          if (!cur || now - cur.firstAttempt > this.windowMs) {
            this.attempts.set(ip, { count: 1, firstAttempt: now });
          } else {
            cur.count += 1;
          }
        } else if (res.statusCode === 200 || res.statusCode === 201) {
          // Reset on success
          this.attempts.delete(ip);
        }
      });

      next();
    };
  }

  reset() {
    this.attempts.clear();
  }
}

export const adminLoginLimiter = new LoginRateLimiter(15 * 60 * 1000, 10);
export default adminLoginLimiter;
