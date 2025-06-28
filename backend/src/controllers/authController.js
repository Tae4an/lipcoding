const User = require('../models/User');
const jwtUtils = require('../utils/jwt');

class AuthController {
  async signup(req, res) {
    try {
      const { email, password, name, role } = req.body;

      // 입력 데이터 검증
      if (!email || !password || !name || !role) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'Email, password, name, and role are required'
        });
      }

      if (!['mentor', 'mentee'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          details: 'Role must be either "mentor" or "mentee"'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Invalid password',
          details: 'Password must be at least 6 characters long'
        });
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          details: 'Please provide a valid email address'
        });
      }

      const user = await User.create({ email, password, name, role });
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.message === 'Email already exists') {
        return res.status(409).json({
          error: 'Email already exists',
          details: 'An account with this email already exists'
        });
      }
      
      // SQLite 제약 조건 위반 에러도 처리
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          error: 'Email already exists',
          details: 'An account with this email already exists'
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to create user account'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 입력 데이터 검증
      if (!email || !password) {
        return res.status(401).json({
          error: 'Missing credentials',
          details: 'Email and password are required'
        });
      }

      // 사용자 찾기
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          details: 'Email or password is incorrect'
        });
      }

      // 비밀번호 검증
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          details: 'Email or password is incorrect'
        });
      }

      // JWT 토큰 생성
      const token = jwtUtils.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: 'Failed to authenticate user'
      });
    }
  }
}

module.exports = new AuthController();
