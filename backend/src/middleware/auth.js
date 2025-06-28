const jwtUtils = require('../utils/jwt');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        details: 'Please provide a valid JWT token in the Authorization header'
      });
    }

    const decoded = jwtUtils.verifyToken(token);
    
    // 토큰에서 사용자 정보 추출
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        details: 'User not found'
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        details: 'Your session has expired. Please log in again.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        details: 'The provided token is malformed or invalid.'
      });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        error: 'Token not active',
        details: 'The token is not active yet.'
      });
    } else {
      return res.status(401).json({ 
        error: 'Authentication failed',
        details: error.message
      });
    }
  }
};

// 역할 기반 인증 미들웨어
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'Please authenticate first'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        details: `This action requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
