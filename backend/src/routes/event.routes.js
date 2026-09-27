import { Router } from 'express';
import {
  listActiveEvents,
  getEventById,
  getEventBySlug,
} from '../controllers/event.controller.js';

const router = Router();

/**
 * Public Event Endpoints
 */

// GET /api/events -> Return active events where registration_open is true
router.get('/', listActiveEvents);

// GET /api/events/slug/:slug -> Return event details by slug if active
router.get('/slug/:slug', getEventBySlug);

// GET /api/events/:id -> Return event details by UUID if active
router.get('/:id', getEventById);

export default router;
