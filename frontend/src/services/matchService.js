import api from './api';

export const matchService = {
  // 매칭 요청 생성
  async createRequest(mentorId, message) {
    try {
      const response = await api.post('/match-requests', {
        mentorId,
        message
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 사용자의 매칭 요청 목록 조회 (멘티가 보낸 요청들)
  async getSentRequests() {
    try {
      const response = await api.get('/match-requests/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 멘토가 받은 매칭 요청 목록 조회
  async getReceivedRequests() {
    try {
      const response = await api.get('/match-requests/received');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 매칭 요청 수락
  async acceptRequest(requestId) {
    try {
      const response = await api.put(`/match-requests/${requestId}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 매칭 요청 거절
  async rejectRequest(requestId, reason = '') {
    try {
      const response = await api.put(`/match-requests/${requestId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 매칭 요청 취소 (멘티가 자신의 요청을 취소)
  async cancelRequest(requestId) {
    try {
      const response = await api.delete(`/match-requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 특정 매칭 요청 상세 조회
  async getRequestById(requestId) {
    try {
      const response = await api.get(`/match-requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
