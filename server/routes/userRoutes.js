const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, userController.getMe);
router.get('/me/leaderboard-privacy', verifyToken, userController.getLeaderboardPrivacy);
router.put('/me/leaderboard-privacy', verifyToken, userController.updateLeaderboardPrivacy);
router.get('/', verifyToken, requireAdmin, userController.getAllUsers);

module.exports = router;
