import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateProfileUpdate } from '../validators/auth.validator.js';

const router = Router();

// GET /api/users/:id -> Get user profile details
router.get('/:id', authenticate, getProfile);

// PUT /api/users/:id -> Update user profile details
router.put('/:id', authenticate, validate(validateProfileUpdate), updateProfile);

export default router;
