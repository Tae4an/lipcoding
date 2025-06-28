const rateLimit = require('express-rate-limit');

// 테스트 환경 확인
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.CI === 'true';

// 일반적인 API 요청 제한
const generalLimiter = rateLimit({
  windowMs: isTestEnv ? 1000 : 15 * 60 * 1000, // 테스트: 1초, 운영: 15분
  max: isTestEnv ? 1000 : 100, // 테스트: 1000회, 운영: 100회
  message: {
    error: 'Too many requests',
    details: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skip: isTestEnv ? () => true : undefined // 테스트 환경에서는 완전히 비활성화
});

// 로그인 제한 (더 엄격)
const authLimiter = rateLimit({
  windowMs: isTestEnv ? 1000 : 15 * 60 * 1000, // 테스트: 1초, 운영: 15분
  max: isTestEnv ? 1000 : 10, // 테스트: 1000회, 운영: 10회
  message: {
    error: 'Too many login attempts',
    details: 'Too many login attempts from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skipSuccessfulRequests: true, // 성공한 요청은 카운트에서 제외
  skip: isTestEnv ? () => true : undefined // 테스트 환경에서는 완전히 비활성화
});

// 회원가입 제한
const signupLimiter = rateLimit({
  windowMs: isTestEnv ? 1000 : 60 * 60 * 1000, // 테스트: 1초, 운영: 1시간
  max: isTestEnv ? 1000 : 5, // 테스트: 1000회, 운영: 5회
  message: {
    error: 'Too many signup attempts',
    details: 'Too many accounts created from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skip: isTestEnv ? () => true : undefined // 테스트 환경에서는 완전히 비활성화
});

// 프로필 업데이트 제한
const profileUpdateLimiter = rateLimit({
  windowMs: isTestEnv ? 1000 : 15 * 60 * 1000, // 테스트: 1초, 운영: 15분
  max: isTestEnv ? 1000 : 20, // 테스트: 1000회, 운영: 20회
  message: {
    error: 'Too many profile updates',
    details: 'Too many profile update requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skip: isTestEnv ? () => true : undefined // 테스트 환경에서는 완전히 비활성화
});

module.exports = {
  generalLimiter,
  authLimiter,
  signupLimiter,
  profileUpdateLimiter
};
