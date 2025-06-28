# Mentor-Mentee Matching App

멘토와 멘티를 연결하는 매칭 플랫폼입니다.

## 프로젝트 구조

```
mentor-mentee-app/
├── backend/                 # Express.js API 서버
│   ├── src/
│   │   ├── controllers/     # API 컨트롤러
│   │   ├── models/          # 데이터 모델
│   │   ├── middleware/      # JWT 인증 등
│   │   ├── routes/          # API 라우팅
│   │   └── utils/           # 유틸리티 함수
│   ├── .env                 # 환경 변수
│   └── package.json
├── frontend/                # React 앱
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── pages/           # 페이지별 컴포넌트
│   │   ├── services/        # API 호출 서비스
│   │   ├── context/         # React Context
│   │   └── utils/           # 유틸리티
│   └── package.json
└── openapi.yaml            # API 스펙
```

## 실행 방법

### 백엔드 실행
```bash
cd backend
npm install
npm start
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

## API 문서

- API 서버: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui
- 프론트엔드: http://localhost:3000

## 기능

- 회원가입/로그인
- 프로필 관리 (이미지 업로드 포함)
- 멘토 검색 및 필터링
- 매칭 요청 시스템
- 요청 수락/거절/취소

## 기술 스택

- **백엔드**: Node.js, Express.js, SQLite, JWT
- **프론트엔드**: React, React Router, Axios
- **보안**: bcrypt, helmet, CORS
