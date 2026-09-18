const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/authMiddleware');

// Member-protected route for personalized practice suggestions
router.get('/me', authenticate, recommendationController.getMyRecommendations);

module.exports = router;
