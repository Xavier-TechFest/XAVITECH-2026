import { Router } from 'express';
import adminAuthController from '../controllers/adminAuth.controller.js';
import { requireAdmin } from '../middleware/adminAuth.middleware.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  getDashboardStats,
  listRegistrations,
  getRegistrationDetails,
  listTeams,
  getTeamDetails,
  verifyAndCheckIn,
} from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateCheckIn } from '../validators/admin.validator.js';
import adminTrackLeaderRoutes from './adminTrackLeader.routes.js';

const router = Router();


// =============================================================================
// Admin Authentication Endpoints (Dedicated Admin Auth)
// =============================================================================

// POST /api/admin/auth/login -> Rate-limited admin login
router.post('/auth/login', adminLoginLimiter.middleware(), adminAuthController.login);

// GET /api/admin/auth/me -> Session inspection (requireAdmin)
router.get('/auth/me', requireAdmin, adminAuthController.getMe);

// POST /api/admin/auth/logout -> Invalidate current session (requireAdmin)
router.post('/auth/logout', requireAdmin, adminAuthController.logout);

// =============================================================================
// Phase 7: Registration & Team Management Operations (Protected by requireAdmin)
// =============================================================================

// GET /api/admin/stats & GET /api/admin/dashboard/stats -> Live festival overview metrics
router.get('/stats', requireAdmin, getDashboardStats);
router.get('/dashboard/stats', requireAdmin, getDashboardStats);

// GET /api/admin/registrations -> Paginated, searchable, filterable registrations
router.get('/registrations', requireAdmin, listRegistrations);

// GET /api/admin/registrations/:registrationId -> Complete registration details
router.get('/registrations/:registrationId', requireAdmin, getRegistrationDetails);

// GET /api/admin/teams -> Paginated, searchable, filterable teams
router.get('/teams', requireAdmin, listTeams);

// GET /api/admin/teams/:teamId -> Complete team details
router.get('/teams/:teamId', requireAdmin, getTeamDetails);

// POST /api/admin/check-in -> Day-of-event QR code scan verification placeholder
router.post('/check-in', requireAdmin, validate(validateCheckIn), verifyAndCheckIn);

// =============================================================================
// Phase 8: Track Leader Management Operations (Protected by requireAdmin)
// =============================================================================
router.use('/track-leaders', adminTrackLeaderRoutes);

export default router;

