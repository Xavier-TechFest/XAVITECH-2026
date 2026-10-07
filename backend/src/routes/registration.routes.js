import { Router } from 'express';
import {
  createRegistration,
  listMyRegistrations,
  getRegistrationById,
} from '../controllers/registration.controller.js';
import {
  uploadParticipantDocument,
  getParticipantDocuments,
  deleteParticipantDocument,
} from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadSingleDocument } from '../middleware/upload.middleware.js';
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

// Document Management Endpoints (Part 2 — Cloudinary + Documents)
// POST /api/registrations/:registrationId/participants/:participantId/documents
router.post(
  '/:registrationId/participants/:participantId/documents',
  uploadSingleDocument,
  uploadParticipantDocument
);

// GET /api/registrations/:registrationId/participants/:participantId/documents
router.get(
  '/:registrationId/participants/:participantId/documents',
  getParticipantDocuments
);

// DELETE /api/registrations/:registrationId/participants/:participantId/documents/:documentType
router.delete(
  '/:registrationId/participants/:participantId/documents/:documentType',
  deleteParticipantDocument
);

export default router;
