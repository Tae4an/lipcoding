const express = require('express');
const authController = require('../controllers/authController');
const { authLimiter, signupLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/signup - 회원가입
router.post('/signup', signupLimiter, authController.signup);

// POST /api/login - 로그인
router.post('/login', authLimiter, authController.login);

module.exports = router;
