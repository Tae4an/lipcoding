import api from './api';

export const authService = {
  // 로그인
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 회원가입
  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 현재 사용자 정보 조회
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 토큰 유효성 검사
  async validateToken() {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 로그아웃 (토큰 제거)
  logout() {
    localStorage.removeItem('token');
  }
};
