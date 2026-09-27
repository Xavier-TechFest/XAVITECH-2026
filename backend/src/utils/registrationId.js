import crypto from 'crypto';

// 32-character alphabet excluding visually ambiguous characters (0, O, 1, I)
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a unique, non-sequential human-readable registration ID.
 * Example format: XVT-2026-ABC123
 *
 * @param {string} prefix - Organization and festival year prefix (default: 'XVT-2026')
 * @param {number} length - Random suffix length (default: 6)
 * @returns {string} Formatted registration ID
 */
export const generateRegistrationId = (prefix = 'XVT-2026', length = 6) => {
  const bytes = crypto.randomBytes(length);
  let randomPart = '';
  for (let i = 0; i < length; i++) {
    randomPart += CHARSET[bytes[i] % CHARSET.length];
  }
  return `${prefix}-${randomPart}`;
};

export default {
  generateRegistrationId,
};
