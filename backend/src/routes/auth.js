const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/signup - 회원가입
router.post('/signup', authController.signup);

// POST /api/login - 로그인
router.post('/login', authController.login);

module.exports = router;
