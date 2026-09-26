import { Router } from 'express';
import { listEvents, getEventDetails } from '../controllers/event.controller.js';

const router = Router();

// GET /api/events -> List all active events and categories
router.get('/', listEvents);

// GET /api/events/:id -> Detailed information about an event
router.get('/:id', getEventDetails);

export default router;
