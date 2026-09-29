import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import teamController from '../controllers/team.controller.js';

const router = Router();

// All team routes require verified Firebase user authentication
router.use(requireAuth);

/**
 * Team Management Endpoints
 */
router.post('/', teamController.createTeam);
router.get('/my', teamController.getMyTeams);
router.get('/:teamId', teamController.getTeamDetails);
router.patch('/:teamId', teamController.updateTeam);
router.delete('/:teamId', teamController.deleteTeam);

/**
 * Team Member Endpoints
 */
router.post('/:teamId/members', teamController.addTeamMember);
router.patch('/:teamId/members/:memberId', teamController.updateTeamMember);
router.delete('/:teamId/members/:memberId', teamController.removeTeamMember);

export default router;
