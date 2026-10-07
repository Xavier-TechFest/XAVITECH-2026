import crypto from 'crypto';

/**
 * Easebuzz Cryptographic Utility
 * Handles official Easebuzz SHA-512 request hashing and response verification.
 */

/**
 * Generate SHA-512 hash string for Easebuzz payment initiation.
 * Formula:
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
 */
export const generateInitiateHash = ({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
  udf6 = '',
  udf7 = '',
  udf8 = '',
  udf9 = '',
  udf10 = '',
  salt,
}) => {
  const hashString = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7,
    udf8,
    udf9,
    udf10,
    salt,
  ].join('|');

  return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
};

/**
 * Generate Reverse SHA-512 hash string for verifying Easebuzz callback / response.
 * Formula:
 * sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export const generateResponseHash = ({
  salt,
  status,
  udf10 = '',
  udf9 = '',
  udf8 = '',
  udf7 = '',
  udf6 = '',
  udf5 = '',
  udf4 = '',
  udf3 = '',
  udf2 = '',
  udf1 = '',
  email,
  firstname,
  productinfo,
  amount,
  txnid,
  key,
}) => {
  const hashString = [
    salt,
    status,
    udf10,
    udf9,
    udf8,
    udf7,
    udf6,
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ].join('|');

  return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
};

/**
 * Verify if the response hash received from Easebuzz matches calculated hash.
 */
export const verifyResponseHash = (payload, salt) => {
  if (!payload || !payload.hash || !salt) {
    return false;
  }

  const calculated = generateResponseHash({
    salt,
    status: payload.status || '',
    udf10: payload.udf10 || '',
    udf9: payload.udf9 || '',
    udf8: payload.udf8 || '',
    udf7: payload.udf7 || '',
    udf6: payload.udf6 || '',
    udf5: payload.udf5 || '',
    udf4: payload.udf4 || '',
    udf3: payload.udf3 || '',
    udf2: payload.udf2 || '',
    udf1: payload.udf1 || '',
    email: payload.email || '',
    firstname: payload.firstname || '',
    productinfo: payload.productinfo || '',
    amount: payload.amount || '',
    txnid: payload.txnid || '',
    key: payload.key || '',
  });

  return calculated === String(payload.hash).trim().toLowerCase();
};

export default {
  generateInitiateHash,
  generateResponseHash,
  verifyResponseHash,
};
