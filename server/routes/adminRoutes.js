const express = require('express');
const router = express.Router();
const adminSubmissionController = require('../controllers/adminSubmissionController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// ADMIN ONLY endpoint for viewing member submission history
router.get('/submissions', verifyToken, requireAdmin, adminSubmissionController.getAdminSubmissions);

// ADMIN ONLY endpoints for viewing streaks
router.get('/streaks', verifyToken, requireAdmin, adminSubmissionController.getAdminStreaks);
router.get('/streaks/:userId', verifyToken, requireAdmin, adminSubmissionController.getAdminMemberStreakDetail);

module.exports = router;
