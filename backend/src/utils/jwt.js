const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTUtils {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    this.expiry = process.env.JWT_EXPIRY || '1h';
  }

  generateToken(user) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (60 * 60); // 1시간
    
    // RFC 7519 표준 클레임 + 커스텀 클레임
    const payload = {
      // RFC 7519 표준 클레임
      iss: 'mentor-mentee-app',           // issuer
      sub: user.id.toString(),            // subject (사용자 ID)
      aud: 'mentor-mentee-app-users',     // audience
      exp: exp,                           // expiration time
      nbf: now,                           // not before
      iat: now,                           // issued at
      jti: crypto.randomUUID(),           // JWT ID
      
      // 커스텀 클레임
      name: user.name,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.secret);
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }
}

module.exports = new JWTUtils();
