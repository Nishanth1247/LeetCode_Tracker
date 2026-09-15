const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// MEMBER / TEAM LEADER endpoints - declared before /:id routes
router.get('/me', verifyToken, challengeController.getMyChallenges);
router.post('/individual', verifyToken, challengeController.createIndividualChallenge);
router.put('/individual/:id', verifyToken, challengeController.updateIndividualChallenge);
router.delete('/individual/:id', verifyToken, challengeController.deleteIndividualChallenge);

// ADMIN endpoints
router.post('/', verifyToken, requireAdmin, challengeController.createChallenge);
router.get('/', verifyToken, requireAdmin, challengeController.getAllChallenges);
router.put('/:id', verifyToken, requireAdmin, challengeController.updateChallenge);
router.delete('/:id', verifyToken, requireAdmin, challengeController.deleteChallenge);

// Shared protected endpoints (with backend member authorization check)
router.get('/:id', verifyToken, challengeController.getChallengeById);
router.get('/:id/progress', verifyToken, challengeController.getChallengeProgress);

module.exports = router;
