import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import LoadingSpinner from '../components/LoadingSpinner';

const RequestsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      let data;
      if (activeTab === 'received') {
        data = await matchService.getReceivedRequests();
      } else {
        data = await matchService.getSentRequests();
      }
      setRequests(data);
    } catch (error) {
      setError('요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(requestId);
    setError('');
    setSuccess('');

    try {
      await matchService.acceptRequest(requestId);
      setSuccess('매칭 요청을 수락했습니다.');
      fetchRequests(); // 목록 새로고침
    } catch (error) {
      setError(error.message || '요청 수락에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(requestId);
    setError('');
    setSuccess('');

    try {
      await matchService.rejectRequest(requestId);
      setSuccess('매칭 요청을 거절했습니다.');
      fetchRequests(); // 목록 새로고침
    } catch (error) {
      setError(error.message || '요청 거절에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    setActionLoading(requestId);
    setError('');
    setSuccess('');

    try {
      await matchService.cancelRequest(requestId);
      setSuccess('매칭 요청을 취소했습니다.');
      fetchRequests(); // 목록 새로고침
    } catch (error) {
      setError(error.message || '요청 취소에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '대기중', class: 'bg-yellow-100 text-yellow-800' },
      accepted: { text: '수락됨', class: 'bg-green-100 text-green-800' },
      rejected: { text: '거절됨', class: 'bg-red-100 text-red-800' },
      canceled: { text: '취소됨', class: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md">
        {/* 탭 헤더 */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              받은 요청
              {user.role === 'mentor' && ` (${requests.filter(r => r.status === 'pending').length})`}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              보낸 요청
            </button>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {activeTab === 'received' ? '받은 매칭 요청' : '보낸 매칭 요청'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {activeTab === 'received' ? '받은 매칭 요청이 없습니다.' : '보낸 매칭 요청이 없습니다.'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {activeTab === 'received' ? request.mentee?.name : request.mentor?.name}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">
                          {activeTab === 'received' ? '멘티' : '멘토'}:
                        </span>
                        {' '}
                        {activeTab === 'received' ? request.mentee?.email : request.mentor?.email}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        요청일: {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* 사용자 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(activeTab === 'received' ? request.mentee : request.mentor)?.bio && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">소개</h4>
                          <p className="text-sm text-gray-600">
                            {(activeTab === 'received' ? request.mentee : request.mentor).bio}
                          </p>
                        </div>
                      )}
                      
                      {(activeTab === 'received' ? request.mentee : request.mentor)?.skills && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">스킬/관심분야</h4>
                          <div className="flex flex-wrap gap-1">
                            {(activeTab === 'received' ? request.mentee : request.mentor).skills
                              .split(',')
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="bg-white text-gray-700 px-2 py-1 rounded text-xs border"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      {activeTab === 'received' ? (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={actionLoading === request.id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === request.id ? <LoadingSpinner size="small" /> : '수락'}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={actionLoading === request.id}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === request.id ? <LoadingSpinner size="small" /> : '거절'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === request.id ? <LoadingSpinner size="small" /> : '취소'}
                        </button>
                      )}
                    </div>
                  )}

                  {request.status !== 'pending' && (
                    <div className="text-sm text-gray-500">
                      {request.status === 'accepted' && '이 요청이 수락되었습니다.'}
                      {request.status === 'rejected' && '이 요청이 거절되었습니다.'}
                      {request.status === 'canceled' && '이 요청이 취소되었습니다.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
