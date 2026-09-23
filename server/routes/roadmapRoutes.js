const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const roadmapNotesController = require('../controllers/roadmapNotesController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, roadmapController.getMyRoadmapProgress);
router.get('/mistakes', verifyToken, roadmapNotesController.getMistakeReview);
router.get('/session-data', verifyToken, roadmapNotesController.getSessionData);

module.exports = router;
