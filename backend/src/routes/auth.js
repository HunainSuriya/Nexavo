const express = require('express');
const router = express.Router();
const { login, verify, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { validateLogin } = require('../utils/validation');

// Public routes
router.post('/login', validateLogin, login);

// Protected routes
router.get('/verify', authMiddleware, verify);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;