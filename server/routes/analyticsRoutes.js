const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, analyticsController.getMyAnalytics);
router.get('/team', verifyToken, requireAdmin, analyticsController.getTeamAnalytics);

module.exports = router;
