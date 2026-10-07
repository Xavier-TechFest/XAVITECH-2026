import config from '../config/env.config.js';
import paymentService from '../services/payment.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Payment Controller
 * Handles payment order creation, callback handling, and status queries.
 */

/**
 * POST /api/payments/initiate
 * Initiates payment for an authenticated user's registration.
 */
export const initiatePayment = async (req, res, next) => {
  try {
    const registrationId = req.body.registrationId || req.body.registration_id;
    const result = await paymentService.initiatePayment(req.user, registrationId);

    return sendSuccess(res, 'Payment initiated successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/callback
 * Handles Easebuzz gateway callback (webhook or return POST).
 */
export const handleCallback = async (req, res, next) => {
  try {
    logger.info('Received Easebuzz payment callback:', {
      txnid: req.body?.txnid,
      status: req.body?.status,
      easepayid: req.body?.easepayid,
      amount: req.body?.amount,
    });

    const result = await paymentService.processCallback(req.body);

    // If request accepts HTML (browser form POST from gateway return), redirect to frontend
    const isBrowserPost = req.headers['content-type']?.includes('application/x-www-form-urlencoded') &&
      req.headers['accept']?.includes('text/html');

    if (isBrowserPost) {
      const regId = result.registrationId || req.body.udf1 || '';
      const txnid = result.transactionId || req.body.txnid || '';
      const eventSlug = req.body.udf2 || '';
      const statusParam = result.success ? 'success' : result.status?.toLowerCase() || 'failed';

      const redirectUrl = eventSlug
        ? `${config.clientUrl}/events/${eventSlug}/register?step=confirmed&paymentStatus=${statusParam}&registrationId=${regId}&txnid=${txnid}`
        : `${config.clientUrl}/profile?paymentStatus=${statusParam}&registrationId=${regId}`;

      return res.redirect(302, redirectUrl);
    }

    // Standard API response (Webhook / JSON caller)
    return sendSuccess(res, 'Payment callback processed successfully', result, 200);
  } catch (error) {
    logger.error('Error processing payment callback:', error);
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Explicit API endpoint to verify transaction callback payload.
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const result = await paymentService.processCallback(req.body);
    return sendSuccess(res, 'Payment verified successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/status/:transactionId
 * Fetch transaction status and details with ownership enforcement.
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const result = await paymentService.getPaymentStatus(req.user, transactionId);

    return sendSuccess(res, 'Payment status retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export default {
  initiatePayment,
  handleCallback,
  verifyPayment,
  getPaymentStatus,
};
