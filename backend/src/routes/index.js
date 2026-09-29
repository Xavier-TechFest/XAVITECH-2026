import { Router } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import eventRoutes from './event.routes.js';
import registrationRoutes from './registration.routes.js';
import teamRoutes from './team.routes.js';
import paymentRoutes from './payment.routes.js';
import passRoutes from './pass.routes.js';
import adminRoutes from './admin.routes.js';
import trackRoutes from './track.routes.js';
import trackLeaderAuthRoutes from './trackLeaderAuth.routes.js';
import trackLeaderPortalRoutes from './trackLeaderPortal.routes.js';

const router = Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * Response: { "success": true, "message": "XAVITECH backend is running" }
 */
router.get('/health', (req, res) => {
  return sendSuccess(res, 'XAVITECH backend is running');
});

// Modular Domain Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/tracks', trackRoutes);
router.use('/registrations', registrationRoutes);
router.use('/teams', teamRoutes);
router.use('/payments', paymentRoutes);
router.use('/passes', passRoutes);
router.use('/admin', adminRoutes);
router.use('/track-leader/auth', trackLeaderAuthRoutes);
router.use('/track-leader', trackLeaderPortalRoutes);

export default router;
