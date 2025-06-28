const express = require('express');
const matchRequestController = require('../controllers/matchRequestController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/match-requests - 매칭 요청 생성 (멘티만)
router.post('/match-requests', 
  authenticateToken, 
  requireRole(['mentee']), 
  matchRequestController.createMatchRequest
);

// GET /api/match-requests/incoming - 받은 요청 목록 (멘토만)
router.get('/match-requests/incoming', 
  authenticateToken, 
  requireRole(['mentor']), 
  matchRequestController.getIncomingMatchRequests
);

// GET /api/match-requests/outgoing - 보낸 요청 목록 (멘티만)
router.get('/match-requests/outgoing', 
  authenticateToken, 
  requireRole(['mentee']), 
  matchRequestController.getOutgoingMatchRequests
);

// PUT /api/match-requests/:id/accept - 요청 수락 (멘토만)
router.put('/match-requests/:id/accept', 
  authenticateToken, 
  requireRole(['mentor']), 
  matchRequestController.acceptMatchRequest
);

// PUT /api/match-requests/:id/reject - 요청 거절 (멘토만)
router.put('/match-requests/:id/reject', 
  authenticateToken, 
  requireRole(['mentor']), 
  matchRequestController.rejectMatchRequest
);

// DELETE /api/match-requests/:id - 요청 취소 (멘티만)
router.delete('/match-requests/:id', 
  authenticateToken, 
  requireRole(['mentee']), 
  matchRequestController.cancelMatchRequest
);

module.exports = router;
