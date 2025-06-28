const rateLimit = require('express-rate-limit');

// 일반적인 API 요청 제한
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분 동안 최대 100회 요청
  message: {
    error: 'Too many requests',
    details: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429
});

// 로그인 제한 (더 엄격)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 15분 동안 최대 10회 로그인 시도
  message: {
    error: 'Too many login attempts',
    details: 'Too many login attempts from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skipSuccessfulRequests: true // 성공한 요청은 카운트에서 제외
});

// 회원가입 제한
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 5, // 1시간 동안 최대 5회 회원가입
  message: {
    error: 'Too many signup attempts',
    details: 'Too many accounts created from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429
});

// 프로필 업데이트 제한
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20, // 15분 동안 최대 20회 프로필 업데이트
  message: {
    error: 'Too many profile updates',
    details: 'Too many profile update requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429
});

module.exports = {
  generalLimiter,
  authLimiter,
  signupLimiter,
  profileUpdateLimiter
};
