/**
 * Payment Request Validators
 */

export const validatePaymentInitiation = (data) => {
  const errors = [];
  const regId = data?.registrationId || data?.registration_id;

  if (!regId || typeof regId !== 'string' || !regId.trim()) {
    errors.push('Registration ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePaymentCallback = (data) => {
  const errors = [];

  if (!data?.txnid || typeof data.txnid !== 'string' || !data.txnid.trim()) {
    errors.push('Transaction ID (txnid) is required');
  }

  if (!data?.status || typeof data.status !== 'string' || !data.status.trim()) {
    errors.push('Payment status is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePaymentVerification = (data) => {
  const errors = [];
  const txnid = data?.txnid || data?.orderId || data?.transactionId;

  if (!txnid || typeof txnid !== 'string' || !txnid.trim()) {
    errors.push('Transaction reference ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validatePaymentInitiation,
  validatePaymentCallback,
  validatePaymentVerification,
};
