import { Router } from 'express';
import {
  initiatePayment,
  handleCallback,
  verifyPayment,
  getPaymentStatus,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validatePaymentInitiation,
  validatePaymentCallback,
  validatePaymentVerification,
} from '../validators/payment.validator.js';

const router = Router();

// POST /api/payments/initiate -> Protected initiation for authenticated user's registration
router.post('/initiate', authenticate, validate(validatePaymentInitiation), initiatePayment);

// POST /api/payments/callback -> Official Easebuzz gateway callback & webhook handler
router.post('/callback', validate(validatePaymentCallback), handleCallback);

// POST /api/payments/verify -> Direct verification endpoint
router.post('/verify', validate(validatePaymentVerification), verifyPayment);

// GET /api/payments/status/:transactionId -> Protected status check
router.get('/status/:transactionId', authenticate, getPaymentStatus);

export default router;
