import { Router } from 'express';
import { initiatePayment, verifyPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validatePaymentInitiation,
  validatePaymentVerification,
} from '../validators/payment.validator.js';

const router = Router();

// POST /api/payments/initiate -> Create order for registration
router.post('/initiate', authenticate, validate(validatePaymentInitiation), initiatePayment);

// POST /api/payments/verify -> Verify gateway payment signature / callback
router.post('/verify', validate(validatePaymentVerification), verifyPayment);

export default router;
