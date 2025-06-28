import api from './api';

export const userService = {
  // 사용자 프로필 조회
  async getProfile() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 사용자 프로필 업데이트
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 프로필 이미지 업로드
  async uploadProfileImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.put('/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Base64 이미지 업로드
  async uploadProfileImageBase64(base64Image) {
    try {
      const response = await api.put('/users/profile-image', {
        image: base64Image
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 멘토 목록 조회
  async getMentors(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.expertise) {
        queryParams.append('expertise', filters.expertise);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      if (filters.offset) {
        queryParams.append('offset', filters.offset);
      }

      const response = await api.get(`/mentors?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 특정 멘토 정보 조회
  async getMentorById(mentorId) {
    try {
      const response = await api.get(`/mentors/${mentorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
