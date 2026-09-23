const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, roadmapController.getMyRoadmapProgress);

module.exports = router;
