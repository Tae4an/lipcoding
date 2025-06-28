require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// 데이터베이스와 라우트 import
const database = require('./models/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const mentorRoutes = require('./routes/mentors');
const matchRequestRoutes = require('./routes/matchRequests');

const app = express();
const PORT = process.env.PORT || 8080;

// Rate limiting 설정
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 최대 100 요청
  message: {
    error: 'Too many requests',
    details: 'Please try again later'
  }
});

// 미들웨어 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(limiter);
app.use(express.json({ limit: '1mb' })); // Base64 이미지를 위한 크기 제한
app.use(express.urlencoded({ extended: true }));

// OpenAPI 문서 설정
const openApiPath = path.join(__dirname, '../../openapi.yaml');
const swaggerDocument = YAML.load(openApiPath);

// Swagger UI 설정
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Mentor-Mentee Matching API',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// OpenAPI JSON 엔드포인트
app.get('/openapi.json', (req, res) => {
  res.json(swaggerDocument);
});

// 루트 경로에서 Swagger UI로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/swagger-ui');
});

// API 라우트 등록
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', mentorRoutes);
app.use('/api', matchRequestRoutes);

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    details: 'The requested resource was not found'
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
});

// 데이터베이스 초기화 및 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결
    await database.connect();
    console.log('Database connected successfully');

    // 테이블 초기화
    await database.initializeTables();
    console.log('Database tables initialized');

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/swagger-ui`);
      console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/openapi.json`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown 처리
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

// 서버 시작
startServer();

module.exports = app;
