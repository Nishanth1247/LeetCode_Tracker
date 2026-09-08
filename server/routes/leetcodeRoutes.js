const express = require('express');
const router = express.Router();
const leetcodeController = require('../controllers/leetcodeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/connect', verifyToken, leetcodeController.connectLeetCode);
router.post('/sync', verifyToken, leetcodeController.syncLeetCode);
router.get('/me', verifyToken, leetcodeController.getMeLeetCodeStats);

module.exports = router;
