import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated, isMentor } = useAuth();
  const location = useLocation();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              MentorMatch
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActivePath('/login')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActivePath('/signup')
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            MentorMatch
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/mentors"
              className={`text-sm font-medium transition-colors ${
                isActivePath('/mentors')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              멘토 찾기
            </Link>
            
            <Link
              to="/requests"
              className={`text-sm font-medium transition-colors ${
                isActivePath('/requests')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {isMentor ? '받은 요청' : '내 요청'}
            </Link>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {user?.image_data ? (
                    <img
                      src={user.image_data}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <span>{user?.name}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  내 프로필
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
