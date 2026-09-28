import { Router } from 'express';
import trackLeaderAuthController from '../controllers/trackLeaderAuth.controller.js';
import { requireTrackLeader } from '../middleware/trackLeaderAuth.middleware.js';
import { trackLeaderLoginLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

/**
 * Track Leader Authentication Endpoints
 * Base path: /api/track-leader/auth
 */

// POST /api/track-leader/auth/login -> Rate-limited Track Leader login
router.post('/login', trackLeaderLoginLimiter.middleware(), trackLeaderAuthController.login);

// GET /api/track-leader/auth/me -> Session inspection (requireTrackLeader)
router.get('/me', requireTrackLeader, trackLeaderAuthController.getMe);

// POST /api/track-leader/auth/logout -> Invalidate current active session (requireTrackLeader)
router.post('/logout', requireTrackLeader, trackLeaderAuthController.logout);

export default router;
