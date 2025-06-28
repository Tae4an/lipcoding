const MatchRequest = require('../models/MatchRequestModel');
const User = require('../models/User');

class MatchRequestController {
  async createMatchRequest(req, res) {
    try {
      // 멘티만 요청 생성 가능
      if (req.user.role !== 'mentee') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'Only mentees can send match requests'
        });
      }

      const { mentorId, message } = req.body;

      // 입력 데이터 검증
      if (!mentorId || !message) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'mentorId and message are required'
        });
      }

      if (typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid message',
          details: 'Message must be a non-empty string'
        });
      }

      // menteeId는 JWT 토큰에서 추출
      const menteeId = req.user.id;

      // 멘토 존재 여부 확인
      const mentor = await User.findById(mentorId);
      if (!mentor || mentor.role !== 'mentor') {
        return res.status(400).json({
          error: 'Invalid mentor',
          details: 'Mentor not found or invalid'
        });
      }

      // 멘티에게 이미 pending 요청이 있는지 확인
      const hasPendingRequest = await MatchRequest.checkPendingRequests(req.user.id);
      if (hasPendingRequest) {
        return res.status(400).json({
          error: 'Pending request exists',
          details: 'You already have a pending match request. Please wait for it to be resolved or cancel it first.'
        });
      }

      // 멘토가 이미 수락한 요청이 있는지 확인
      const hasAcceptedRequest = await MatchRequest.checkAcceptedRequests(mentorId);
      if (hasAcceptedRequest) {
        return res.status(400).json({
          error: 'Mentor unavailable',
          details: 'This mentor has already accepted another request'
        });
      }

      // 매칭 요청 생성
      const matchRequest = await MatchRequest.create({
        mentorId: parseInt(mentorId),
        menteeId: parseInt(menteeId),
        message: message.trim()
      });

      res.status(201).json({
        id: matchRequest.id,
        mentorId: matchRequest.mentorId,
        menteeId: matchRequest.menteeId,
        message: matchRequest.message,
        status: matchRequest.status
      });
    } catch (error) {
      if (error.message.includes('Request already exists')) {
        return res.status(409).json({
          error: 'Duplicate request',
          details: 'A request already exists between this mentor and mentee'
        });
      }

      console.error('Create match request error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to create match request'
      });
    }
  }

  async getIncomingMatchRequests(req, res) {
    try {
      // 멘토만 접근 가능
      if (req.user.role !== 'mentor') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'Only mentors can view incoming requests'
        });
      }

      const requests = await MatchRequest.findIncomingRequests(req.user.id);

      // 응답 형식 맞추기
      const formattedRequests = requests.map(request => ({
        id: request.id,
        mentorId: request.mentor_id,
        menteeId: request.mentee_id,
        message: request.message,
        status: request.status
      }));

      res.json(formattedRequests);
    } catch (error) {
      console.error('Get incoming requests error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to retrieve incoming requests'
      });
    }
  }

  async getOutgoingMatchRequests(req, res) {
    try {
      // 멘티만 접근 가능
      if (req.user.role !== 'mentee') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'Only mentees can view outgoing requests'
        });
      }

      const requests = await MatchRequest.findOutgoingRequests(req.user.id);

      // 응답 형식 맞추기
      const formattedRequests = requests.map(request => ({
        id: request.id,
        mentorId: request.mentor_id,
        menteeId: request.mentee_id,
        status: request.status
      }));

      res.json(formattedRequests);
    } catch (error) {
      console.error('Get outgoing requests error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to retrieve outgoing requests'
      });
    }
  }

  async acceptMatchRequest(req, res) {
    try {
      // 멘토만 수락 가능
      if (req.user.role !== 'mentor') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'Only mentors can accept requests'
        });
      }

      const { id } = req.params;

      // 이미 수락한 요청이 있는지 확인
      const hasAcceptedRequest = await MatchRequest.checkAcceptedRequests(req.user.id);
      if (hasAcceptedRequest) {
        return res.status(400).json({
          error: 'Already matched',
          details: 'You have already accepted another request'
        });
      }

      // 요청 수락
      const updatedRequest = await MatchRequest.updateStatus(
        parseInt(id), 
        'accepted', 
        req.user.id, 
        req.user.role
      );

      res.json({
        id: updatedRequest.id,
        mentorId: updatedRequest.mentor_id,
        menteeId: updatedRequest.mentee_id,
        message: updatedRequest.message,
        status: updatedRequest.status
      });
    } catch (error) {
      if (error.message.includes('not found or unauthorized')) {
        return res.status(404).json({
          error: 'Request not found',
          details: 'Match request not found or you are not authorized to modify it'
        });
      }

      console.error('Accept match request error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to accept match request'
      });
    }
  }

  async rejectMatchRequest(req, res) {
    try {
      // 멘토만 거절 가능
      if (req.user.role !== 'mentor') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'Only mentors can reject requests'
        });
      }

      const { id } = req.params;

      // 요청 거절
      const updatedRequest = await MatchRequest.updateStatus(
        parseInt(id), 
        'rejected', 
        req.user.id, 
        req.user.role
      );

      res.json({
        id: updatedRequest.id,
        mentorId: updatedRequest.mentor_id,
        menteeId: updatedRequest.mentee_id,
        message: updatedRequest.message,
        status: updatedRequest.status
      });
    } catch (error) {
      if (error.message.includes('not found or unauthorized')) {
        return res.status(404).json({
          error: 'Request not found',
          details: 'Match request not found or you are not authorized to modify it'
        });
      }

      console.error('Reject match request error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to reject match request'
      });
    }
  }

  async cancelMatchRequest(req, res) {
    try {
      // 멘티만 취소 가능
      if (req.user.role !== 'mentee') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'Only mentees can cancel requests'
        });
      }

      const { id } = req.params;

      // 요청 취소
      const cancelledRequest = await MatchRequest.delete(parseInt(id), req.user.id);

      res.json({
        id: cancelledRequest.id,
        mentorId: cancelledRequest.mentor_id,
        menteeId: cancelledRequest.mentee_id,
        message: cancelledRequest.message,
        status: cancelledRequest.status
      });
    } catch (error) {
      if (error.message.includes('not found or unauthorized')) {
        return res.status(404).json({
          error: 'Request not found',
          details: 'Match request not found or you are not authorized to cancel it'
        });
      }

      console.error('Cancel match request error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to cancel match request'
      });
    }
  }
}

module.exports = new MatchRequestController();
