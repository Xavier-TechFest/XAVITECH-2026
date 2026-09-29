import { Router } from 'express';
import {
  createRegistration,
  listMyRegistrations,
  getRegistrationById,
} from '../controllers/registration.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateRegistrationCreate } from '../validators/registration.validator.js';

const router = Router();

// All registration endpoints are strictly protected with Firebase Authentication
router.use(authenticate);

// GET /api/registrations/my -> Retrieve registrations belonging exclusively to authenticated user
router.get('/my', listMyRegistrations);

// POST /api/registrations -> Create new draft registration
router.post('/', validate(validateRegistrationCreate), createRegistration);

// GET /api/registrations/:registrationId -> Get registration details with ownership enforcement
router.get('/:registrationId', getRegistrationById);

export default router;
