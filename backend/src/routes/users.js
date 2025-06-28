const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { profileUpdateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// GET /api/me - 현재 사용자 정보 조회
router.get('/me', authenticateToken, userController.getCurrentUser);

// PUT /api/profile - 프로필 수정
router.put('/profile', authenticateToken, profileUpdateLimiter, userController.updateProfile);

// GET /api/images/:role/:id - 프로필 이미지 조회
router.get('/images/:role/:id', authenticateToken, userController.getProfileImage);

module.exports = router;
