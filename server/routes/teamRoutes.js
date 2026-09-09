const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// MEMBER endpoint - must be declared before /:id routes
router.get('/me', verifyToken, teamController.getMyTeam);

// ADMIN endpoints
router.post('/', verifyToken, requireAdmin, teamController.createTeam);
router.get('/', verifyToken, requireAdmin, teamController.getAllTeams);
router.get('/:id', verifyToken, requireAdmin, teamController.getTeamById);
router.put('/:id', verifyToken, requireAdmin, teamController.updateTeam);
router.delete('/:id', verifyToken, requireAdmin, teamController.deleteTeam);

router.post('/:id/members', verifyToken, requireAdmin, teamController.addTeamMember);
router.delete('/:id/members/:userId', verifyToken, requireAdmin, teamController.removeTeamMember);

module.exports = router;
