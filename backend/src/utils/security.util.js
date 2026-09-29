import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hash a plain text password with bcrypt.
 */
export const hashPassword = async (plainPassword) => {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Valid password string is required for hashing');
  }
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
};

/**
 * Verify a plain text password against a stored bcrypt hash.
 */
export const comparePassword = async (plainPassword, passwordHash) => {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
};

/**
 * Generate a cryptographically secure random session token.
 */
export const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a session token using SHA-256 for secure database storage.
 */
export const hashSessionToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

/**
 * Securely verify a provided secret key against the expected secret key.
 * Uses timingSafeEqual to prevent side-channel timing attacks.
 */
export const verifySecretKey = (providedKey, expectedKey) => {
  if (!providedKey || !expectedKey) return false;

  const cleanProvided = String(providedKey).trim();
  const cleanExpected = String(expectedKey).trim();

  const bufProvided = Buffer.from(cleanProvided);
  const bufExpected = Buffer.from(cleanExpected);

  if (bufProvided.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
};

/**
 * Generate a cryptographically secure random temporary password.
 * Uses a character set without visually ambiguous characters (0/O, 1/l/I).
 */
export const generateTemporaryPassword = (length = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

export default {
  hashPassword,
  comparePassword,
  generateSessionToken,
  hashSessionToken,
  verifySecretKey,
  generateTemporaryPassword,
};

