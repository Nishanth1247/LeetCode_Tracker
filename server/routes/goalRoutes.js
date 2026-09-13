const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, goalController.getMyGoals);
router.put('/me', verifyToken, goalController.updateMyGoals);

module.exports = router;
