const express = require('express');
const router = express.Router();
const adminSubmissionController = require('../controllers/adminSubmissionController');
const adminUserController = require('../controllers/adminUserController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminPerformanceController = require('../controllers/adminPerformanceController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// ADMIN ONLY endpoint for Dashboard 2.0 aggregated overview
router.get('/dashboard', verifyToken, requireAdmin, adminDashboardController.getAdminDashboard);

// ADMIN ONLY endpoints for Team & Member Performance (V11)
router.get('/team-performance', verifyToken, requireAdmin, adminPerformanceController.getAdminTeamPerformance);
router.get('/member-performance', verifyToken, requireAdmin, adminPerformanceController.getAdminMemberPerformance);
router.get('/member-performance/:userId', verifyToken, requireAdmin, adminPerformanceController.getAdminMemberPerformanceDetail);

// ADMIN ONLY endpoints for User Management
router.get('/users', verifyToken, requireAdmin, adminUserController.getAdminUsers);
router.get('/users/:id', verifyToken, requireAdmin, adminUserController.getAdminUserById);
router.put('/users/:id', verifyToken, requireAdmin, adminUserController.updateAdminUser);
router.delete('/users/:id', verifyToken, requireAdmin, adminUserController.deleteAdminUser);

// ADMIN ONLY endpoint for viewing member submission history
router.get('/submissions', verifyToken, requireAdmin, adminSubmissionController.getAdminSubmissions);

// ADMIN ONLY endpoints for viewing streaks
router.get('/streaks', verifyToken, requireAdmin, adminSubmissionController.getAdminStreaks);
router.get('/streaks/:userId', verifyToken, requireAdmin, adminSubmissionController.getAdminMemberStreakDetail);

// ADMIN ONLY endpoints for automatic sync status & testing
router.get('/sync-status', verifyToken, requireAdmin, adminSubmissionController.getSyncStatus);
router.post('/trigger-sync', verifyToken, requireAdmin, adminSubmissionController.triggerManualSync);

module.exports = router;
