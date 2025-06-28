import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import MentorsPage from './pages/MentorsPage';
import RequestsPage from './pages/RequestsPage';
import './App.css';

// 인증이 필요한 라우트를 보호하는 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner size="large" text="로딩 중..." />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 인증된 사용자를 리다이렉트하는 컴포넌트 (로그인/회원가입 페이지용)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner size="large" text="로딩 중..." />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/mentors" />;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* 기본 홈 페이지 - 인증 상태에 따라 리다이렉트 */}
            <Route path="/" element={<Navigate to="/mentors" />} />
            
            {/* 게스트 전용 라우트 */}
            <Route path="/login" element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } />
            <Route path="/signup" element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            } />
            
            {/* 보호된 라우트 */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/mentors" element={
              <ProtectedRoute>
                <MentorsPage />
              </ProtectedRoute>
            } />
            <Route path="/requests" element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            } />
            
            {/* 404 페이지 */}
            <Route path="*" element={
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h1>
                <p className="text-gray-600 mb-6">요청하신 페이지가 존재하지 않습니다.</p>
                <Navigate to="/" />
              </div>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
