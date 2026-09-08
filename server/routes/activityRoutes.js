const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, activityController.getMyActivity);

module.exports = router;
