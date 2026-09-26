import { Router } from 'express';
import { getMe, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateProfileUpdate } from '../validators/auth.validator.js';

const router = Router();

/**
 * Get Authenticated User Profile
 * GET /api/auth/me
 * Protected: Requires Authorization: Bearer <Firebase ID Token>
 */
router.get('/me', authenticate, getMe);

/**
 * Update Authenticated User Profile
 * PATCH /api/auth/profile
 * Protected: Requires Authorization: Bearer <Firebase ID Token>
 */
router.patch('/profile', authenticate, validate(validateProfileUpdate), updateProfile);

export default router;
