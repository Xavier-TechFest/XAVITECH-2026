import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.middleware.js';
import adminTrackLeaderController from '../controllers/adminTrackLeader.controller.js';

const router = Router();

/**
 * Admin Track Leader Management Routes
 * Base path: /api/admin/track-leaders
 * All endpoints strictly protected by requireAdmin.
 */

// GET /api/admin/track-leaders -> Paginated, searchable, filterable list
router.get('/', requireAdmin, adminTrackLeaderController.listTrackLeaders);

// POST /api/admin/track-leaders -> Create new Track Leader & assign track
router.post('/', requireAdmin, adminTrackLeaderController.createTrackLeader);

// GET /api/admin/track-leaders/:id -> Complete detail view
router.get('/:id', requireAdmin, adminTrackLeaderController.getTrackLeaderById);

// PATCH /api/admin/track-leaders/:id -> Update name, email, and/or reassign track
router.patch('/:id', requireAdmin, adminTrackLeaderController.updateTrackLeader);

// PATCH /api/admin/track-leaders/:id/status -> Activate or deactivate account
router.patch('/:id/status', requireAdmin, adminTrackLeaderController.updateTrackLeaderStatus);

// POST /api/admin/track-leaders/:id/reset-credentials -> Reissue temporary credentials
router.post('/:id/reset-credentials', requireAdmin, adminTrackLeaderController.resetCredentials);

export default router;
