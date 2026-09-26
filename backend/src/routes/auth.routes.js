import { Router } from 'express';
import { getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Authenticated user profile verification endpoint
 * GET /api/auth/me
 * Headers required: Authorization: Bearer <Firebase ID Token>
 */
router.get('/me', authenticate, getMe);

export default router;
