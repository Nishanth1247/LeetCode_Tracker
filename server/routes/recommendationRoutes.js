const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { verifyToken } = require('../middleware/authMiddleware');

// Member-protected route for personalized practice suggestions
router.get('/me', verifyToken, recommendationController.getMyRecommendations);

module.exports = router;
