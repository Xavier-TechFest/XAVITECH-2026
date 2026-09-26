/**
 * Auth Request Validator Placeholders
 */

export const validateLogin = (data) => {
  const errors = [];
  if (!data?.idToken) {
    errors.push('Firebase idToken is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProfileUpdate = (data) => {
  const errors = [];
  if (data?.phone && !/^\+?[0-9]{10,15}$/.test(data.phone)) {
    errors.push('Invalid phone number format');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateLogin,
  validateProfileUpdate,
};
