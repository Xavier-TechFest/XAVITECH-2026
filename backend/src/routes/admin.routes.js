import { Router } from 'express';
import {
  getDashboardStats,
  listAllRegistrations,
  verifyAndCheckIn,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateCheckIn } from '../validators/admin.validator.js';
import { USER_ROLES } from '../utils/constants.util.js';

const router = Router();

// Protect all admin routes with authentication and role check
router.use(authenticate);
router.use(authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER));

// GET /api/admin/stats -> Overview metrics
router.get('/stats', getDashboardStats);

// GET /api/admin/registrations -> All event registrations
router.get('/registrations', listAllRegistrations);

// POST /api/admin/check-in -> Day-of-event QR code scan verification
router.post('/check-in', validate(validateCheckIn), verifyAndCheckIn);

export default router;
