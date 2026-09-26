import { sendSuccess } from '../utils/response.util.js';

/**
 * Payment Controller Placeholder
 * Handles payment order creation and webhook/verification callbacks.
 */

export const initiatePayment = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Payment initiation placeholder endpoint', {
      orderId: 'order_placeholder_123',
      amount: req.body.amount || 0,
      currency: 'INR',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Payment verification placeholder endpoint', {
      verified: true,
      paymentId: req.body.paymentId || 'pay_placeholder_123',
      status: 'CONFIRMED',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  initiatePayment,
  verifyPayment,
};
