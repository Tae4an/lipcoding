const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/mentors - 멘토 목록 조회 (멘티만 접근 가능)
router.get('/mentors', authenticateToken, requireRole(['mentee']), userController.getMentors);

module.exports = router;
