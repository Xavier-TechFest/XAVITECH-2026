import { Router } from 'express';
import { getPassByRegistrationId } from '../controllers/pass.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/passes/:registrationId -> Get digital pass & QR code
router.get('/:registrationId', authenticate, getPassByRegistrationId);

export default router;
