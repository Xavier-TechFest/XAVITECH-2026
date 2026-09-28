import { Router } from 'express';
import {
  listActiveTracks,
  getTrackByIdOrSlug,
  getTrackEvents,
} from '../controllers/track.controller.js';

const router = Router();

/**
 * Public Track Endpoints
 */

// GET /api/tracks -> Return all active official tracks
router.get('/', listActiveTracks);

// GET /api/tracks/:identifier/events -> Return events belonging to a track (UUID or slug)
router.get('/:identifier/events', getTrackEvents);

// GET /api/tracks/slug/:slug -> Return track details by slug
router.get('/slug/:slug', getTrackByIdOrSlug);

// GET /api/tracks/:identifier -> Return track details by UUID or slug
router.get('/:identifier', getTrackByIdOrSlug);

export default router;
