const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, analyticsController.getMyAnalytics);
router.get('/me/performance', verifyToken, analyticsController.getMyPerformance);
router.get('/me/daily', verifyToken, analyticsController.getDailyAnalyticsMe);
router.get('/me/week', verifyToken, analyticsController.getWeekAnalyticsMe);

router.get('/admin/member-daily', verifyToken, requireAdmin, analyticsController.getAdminMemberDailyAnalytics);
router.get('/team-daily', verifyToken, analyticsController.getTeamDailyAnalytics);
router.get('/team', verifyToken, requireAdmin, analyticsController.getTeamAnalytics);

module.exports = router;

