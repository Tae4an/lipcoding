const User = require('../models/User');

class UserController {
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          details: 'User account no longer exists'
        });
      }

      // 프로필 정보 구성
      const profile = {
        name: user.name || '',
        bio: user.bio || '',
        imageUrl: user.image_data ? `/images/${user.role}/${user.id}` : `https://placehold.co/500x500.jpg?text=${user.role.toUpperCase()}`
      };

      // 멘토인 경우 스킬 추가
      if (user.role === 'mentor') {
        profile.skills = user.skills || [];
      }

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        profile
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to retrieve user information'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { id, name, role, bio, image, skills } = req.body;

      // 권한 확인 - 자신의 프로필만 수정 가능
      if (parseInt(id) !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'You can only update your own profile'
        });
      }

      // 역할 확인
      if (role !== req.user.role) {
        return res.status(400).json({
          error: 'Invalid role',
          details: 'Cannot change user role'
        });
      }

      // 입력 데이터 검증
      if (!name || !bio) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'Name and bio are required'
        });
      }

      // 멘토인 경우 스킬 검증
      if (role === 'mentor' && (!skills || !Array.isArray(skills))) {
        return res.status(400).json({
          error: 'Invalid skills',
          details: 'Mentors must provide skills as an array'
        });
      }

      // 이미지 검증 (Base64)
      let imageData = null;
      if (image) {
        // Base64 형식 검증
        const base64Regex = /^data:image\/(jpeg|jpg|png);base64,/;
        if (!base64Regex.test(image)) {
          return res.status(400).json({
            error: 'Invalid image format',
            details: 'Image must be in Base64 format (JPEG or PNG)'
          });
        }
        imageData = image;
      }

      // 프로필 업데이트
      const updateData = {
        name,
        bio,
        image: imageData,
        skills: role === 'mentor' ? skills : []
      };

      await User.updateProfile(req.user.id, updateData);

      // 업데이트된 사용자 정보 반환
      const updatedUser = await User.findById(req.user.id);
      
      const profile = {
        name: updatedUser.name,
        bio: updatedUser.bio,
        imageUrl: updatedUser.image_data ? `/images/${updatedUser.role}/${updatedUser.id}` : `https://placehold.co/500x500.jpg?text=${updatedUser.role.toUpperCase()}`
      };

      if (updatedUser.role === 'mentor') {
        profile.skills = updatedUser.skills || [];
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        profile
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to update profile'
      });
    }
  }

  async getProfileImage(req, res) {
    try {
      const { role, id } = req.params;

      // 역할 검증
      if (!['mentor', 'mentee'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          details: 'Role must be either mentor or mentee'
        });
      }

      const user = await User.findById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          details: 'User does not exist'
        });
      }

      if (user.role !== role) {
        return res.status(400).json({
          error: 'Role mismatch',
          details: 'User role does not match requested role'
        });
      }

      if (!user.image_data) {
        // 기본 이미지로 리다이렉트
        const defaultImageUrl = `https://placehold.co/500x500.jpg?text=${role.toUpperCase()}`;
        return res.redirect(defaultImageUrl);
      }

      // Base64 이미지 데이터 파싱
      const matches = user.image_data.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
      if (!matches) {
        return res.status(500).json({
          error: 'Invalid image data',
          details: 'Stored image data is corrupted'
        });
      }

      const imageType = matches[1];
      const imageBuffer = Buffer.from(matches[2], 'base64');

      res.set({
        'Content-Type': `image/${imageType}`,
        'Content-Length': imageBuffer.length,
        'Cache-Control': 'public, max-age=3600' // 1시간 캐시
      });

      res.send(imageBuffer);
    } catch (error) {
      console.error('Get profile image error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to retrieve profile image'
      });
    }
  }

  async getMentors(req, res) {
    try {
      // 멘티만 접근 가능
      if (req.user.role !== 'mentee') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'Only mentees can view mentor list'
        });
      }

      const { skill, orderBy } = req.query;
      
      const filters = {};
      if (skill) {
        filters.skill = skill;
      }
      if (orderBy && ['skill', 'name'].includes(orderBy)) {
        filters.orderBy = orderBy;
      }

      const mentors = await User.findMentors(filters);

      // 응답 형식 맞추기
      const formattedMentors = mentors.map(mentor => ({
        id: mentor.id,
        email: mentor.email,
        role: mentor.role,
        profile: {
          name: mentor.name,
          bio: mentor.bio,
          imageUrl: mentor.image_data ? `/images/mentor/${mentor.id}` : 'https://placehold.co/500x500.jpg?text=MENTOR',
          skills: mentor.skills
        }
      }));

      res.json(formattedMentors);
    } catch (error) {
      console.error('Get mentors error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to retrieve mentors list'
      });
    }
  }
}

module.exports = new UserController();
