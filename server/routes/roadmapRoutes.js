const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const roadmapNotesController = require('../controllers/roadmapNotesController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, roadmapController.getMyRoadmapProgress);
router.get('/mistakes', verifyToken, roadmapNotesController.getMistakeReview);

module.exports = router;
