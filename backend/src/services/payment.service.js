import { REGISTRATION_STATUS } from '../utils/constants.util.js';

/**
 * Payment Service Placeholder
 *
 * Coordinates payment gateway order creation, callback/webhook verification,
 * and registration status updating.
 */

export const paymentService = {
  createPaymentOrder: async (registrationId, amount, currency = 'INR') => {
    // Placeholder logic: generate order from gateway
    return {
      orderId: 'order_placeholder_123456',
      registrationId,
      amount,
      currency,
      status: 'INITIATED',
    };
  },

  verifyPaymentSignature: async (paymentData) => {
    // Placeholder logic: verify HMAC / signature from payment gateway
    const isVerified = true;
    return {
      verified: isVerified,
      registrationStatus: isVerified
        ? REGISTRATION_STATUS.PAYMENT_SUCCESS
        : REGISTRATION_STATUS.PAYMENT_FAILED,
    };
  },
};

export default paymentService;
