/**
 * Admin Request Validator Placeholders
 */

export const validateCheckIn = (data) => {
  const errors = [];
  if (!data?.passCode && !data?.registrationId) {
    errors.push('Pass code or Registration ID is required for check-in');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateCheckIn,
};
