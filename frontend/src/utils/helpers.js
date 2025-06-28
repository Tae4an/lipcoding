// 이메일 유효성 검사
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 유효성 검사 (최소 8자, 대소문자, 숫자 포함)
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// 날짜 포맷팅
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '오늘';
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// 상태에 따른 한글 라벨
export const getStatusLabel = (status) => {
  const statusLabels = {
    pending: '대기중',
    accepted: '수락됨',
    rejected: '거절됨',
    cancelled: '취소됨'
  };
  return statusLabels[status] || status;
};

// 상태에 따른 색상 클래스
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    accepted: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    cancelled: 'text-gray-600 bg-gray-100'
  };
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

// 파일을 Base64로 변환
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// 이미지 파일 유효성 검사
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF만 지원)');
  }
  
  if (file.size > maxSize) {
    throw new Error('이미지 크기는 5MB 이하여야 합니다.');
  }
  
  return true;
};

// 텍스트 길이 제한
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 에러 메시지 정규화
export const normalizeErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return '알 수 없는 오류가 발생했습니다.';
};

// 디바운스 함수
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 로컬 스토리지 안전한 사용
export const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStorage getItem failed:', error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('LocalStorage setItem failed:', error);
      return false;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('LocalStorage removeItem failed:', error);
      return false;
    }
  }
};
