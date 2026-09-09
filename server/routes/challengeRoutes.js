const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// MEMBER endpoints - declared before /:id routes
router.get('/me', verifyToken, challengeController.getMyChallenges);

// ADMIN endpoints
router.post('/', verifyToken, requireAdmin, challengeController.createChallenge);
router.get('/', verifyToken, requireAdmin, challengeController.getAllChallenges);
router.put('/:id', verifyToken, requireAdmin, challengeController.updateChallenge);
router.delete('/:id', verifyToken, requireAdmin, challengeController.deleteChallenge);

// Shared protected endpoints (with backend member authorization check)
router.get('/:id', verifyToken, challengeController.getChallengeById);
router.get('/:id/progress', verifyToken, challengeController.getChallengeProgress);

module.exports = router;
