import { Router } from 'express';
import {
  createRegistration,
  addTeamMembers,
  getRegistrationById,
  listMyRegistrations,
} from '../controllers/registration.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateRegistrationCreate,
  validateTeamMembers,
} from '../validators/registration.validator.js';

const router = Router();

// Require auth for all registration operations
router.use(authenticate);

// GET /api/registrations/my -> Get all registrations created by logged-in user
router.get('/my', listMyRegistrations);

// POST /api/registrations -> Create a draft registration (individual or team leader)
router.post('/', validate(validateRegistrationCreate), createRegistration);

// GET /api/registrations/:id -> Get registration summary/status
router.get('/:id', getRegistrationById);

// POST /api/registrations/:id/team -> Add team members (team leader flow)
router.post('/:id/team', validate(validateTeamMembers), addTeamMembers);

export default router;
