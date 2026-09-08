const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, userController.getMe);
router.get('/', verifyToken, requireAdmin, userController.getAllUsers);

module.exports = router;
