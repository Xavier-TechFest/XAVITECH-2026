/**
 * Payment Request Validator Placeholders
 */

export const validatePaymentInitiation = (data) => {
  const errors = [];
  if (!data?.registrationId) {
    errors.push('Registration ID is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePaymentVerification = (data) => {
  const errors = [];
  if (!data?.paymentId) {
    errors.push('Payment ID is required');
  }
  if (!data?.orderId) {
    errors.push('Order ID is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validatePaymentInitiation,
  validatePaymentVerification,
};
