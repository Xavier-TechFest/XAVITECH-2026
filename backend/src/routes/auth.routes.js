import { Router } from 'express';
import { handleGoogleLogin, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateLogin } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/google -> Authenticate with Google / Firebase token
router.post('/google', validate(validateLogin), handleGoogleLogin);

// GET /api/auth/me -> Current authenticated user info
router.get('/me', authenticate, getMe);

export default router;
