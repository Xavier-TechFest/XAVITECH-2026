import { Router } from 'express';
import adminAuthController from '../controllers/adminAuth.controller.js';
import { requireAdmin } from '../middleware/adminAuth.middleware.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  getDashboardStats,
  listAllRegistrations,
  verifyAndCheckIn,
} from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateCheckIn } from '../validators/admin.validator.js';

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
// Protected Admin Operations (Protected by requireAdmin)
// =============================================================================

// GET /api/admin/stats -> Overview metrics
router.get('/stats', requireAdmin, getDashboardStats);

// GET /api/admin/registrations -> All event registrations
router.get('/registrations', requireAdmin, listAllRegistrations);

// POST /api/admin/check-in -> Day-of-event QR code scan verification
router.post('/check-in', requireAdmin, validate(validateCheckIn), verifyAndCheckIn);

export default router;
