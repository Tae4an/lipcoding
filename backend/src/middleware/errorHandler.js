// 전역 에러 핸들링 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Rate limiting 에러 처리
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      details: 'Rate limit exceeded. Please try again later.'
    });
  }

  // JWT 에러 처리
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Invalid token',
      details: 'Authentication failed'
    });
  }

  // Validation 에러 처리
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  // SQLite 에러 처리
  if (err.code && err.code.startsWith('SQLITE_')) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'Duplicate entry',
        details: 'Resource already exists'
      });
    } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGN_KEY') {
      return res.status(400).json({
        error: 'Invalid reference',
        details: 'Referenced resource does not exist'
      });
    } else {
      return res.status(500).json({
        error: 'Database error',
        details: 'A database error occurred'
      });
    }
  }

  // 404 에러 처리
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Not found',
      details: 'The requested resource was not found'
    });
  }

  // 기본 500 에러
  res.status(err.status || 500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// 404 핸들러
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    details: `Cannot ${req.method} ${req.path}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
