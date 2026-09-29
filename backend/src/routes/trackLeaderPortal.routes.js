import { Router } from 'express';
import trackLeaderPortalController from '../controllers/trackLeaderPortal.controller.js';
import {
  requireTrackLeader,
  requirePasswordChanged,
} from '../middleware/trackLeaderAuth.middleware.js';

const router = Router();

/**
 * Track Leader Portal Endpoints
 * All portal endpoints require an authenticated Track Leader who has completed
 * their initial mandatory password change (requirePasswordChanged).
 */

// Apply auth middleware to all portal routes
router.use(requireTrackLeader);
router.use(requirePasswordChanged);

// GET /api/track-leader/track -> Get assigned track details
router.get('/track', trackLeaderPortalController.getMyTrack);

// GET /api/track-leader/events -> Get events for the assigned track
router.get('/events', trackLeaderPortalController.getMyEvents);

// GET /api/track-leader/tracks/:trackId/events -> Track isolation verification endpoint
router.get('/tracks/:trackId/events', trackLeaderPortalController.getTrackEventsWithId);

export default router;
