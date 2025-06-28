// 환경 변수 설정 (CI/CD에서 안전하게 처리)
require('dotenv').config({ silent: true }); // .env 파일이 없어도 오류 발생하지 않음
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// 데이터베이스와 라우트 import
const database = require('./models/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const mentorRoutes = require('./routes/mentors');
const matchRequestRoutes = require('./routes/matchRequests');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

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

app.use(generalLimiter);
app.use(express.json({ limit: '1mb' })); // Base64 이미지를 위한 크기 제한
app.use(express.urlencoded({ extended: true }));

// OpenAPI 문서 설정
let swaggerDocument;
try {
  const openApiPath = path.join(__dirname, '../../openapi.yaml');
  swaggerDocument = YAML.load(openApiPath);
  console.log('OpenAPI document loaded successfully');
} catch (error) {
  console.warn('Failed to load OpenAPI document:', error.message);
  // 기본 문서 설정
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Mentor-Mentee Matching API',
      version: '1.0.0',
      description: 'API for mentor-mentee matching platform'
    },
    paths: {}
  };
}

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

// 에러 핸들러 (라우트 등록 후에 위치해야 함)
app.use('*', notFoundHandler);
app.use(errorHandler);

// 데이터베이스 초기화 및 서버 시작
async function startServer() {
  try {
    console.log('Starting server...');
    console.log('Working directory:', process.cwd());
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('CI environment:', process.env.CI || 'false');
    
    // 데이터베이스 연결
    await database.connect();
    console.log('Database connected successfully');

    // 테이블 초기화
    await database.initializeTables();
    console.log('Database tables initialized');

    // 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/swagger-ui`);
      console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/openapi.json`);
      
      // GitHub Actions/CI 환경에서 백그라운드 실행
      if (process.env.CI === 'true') {
        console.log('CI environment detected - server started successfully');
        // CI 환경에서는 프로세스를 유지하되, 로그를 출력하고 detach
        process.stdout.write('Backend server ready for testing\n');
      }
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('Error stack:', error.stack);
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
