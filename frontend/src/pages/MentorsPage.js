import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { matchService } from '../services/matchService';
import LoadingSpinner from '../components/LoadingSpinner';

const MentorsPage = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [requestingMentorId, setRequestingMentorId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const data = await userService.getMentors();
      setMentors(data);
    } catch (error) {
      setError('멘토 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchRequest = async (mentorId) => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (user.role !== 'mentee') {
      setError('멘티만 매칭 요청을 할 수 있습니다.');
      return;
    }

    setRequestingMentorId(mentorId);
    setError('');

    try {
      await matchService.createRequest(mentorId);
      setSuccess('매칭 요청이 성공적으로 전송되었습니다.');
    } catch (error) {
      setError(error.message || '매칭 요청에 실패했습니다.');
    } finally {
      setRequestingMentorId(null);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !skillFilter || 
                        mentor.skills?.toLowerCase().includes(skillFilter.toLowerCase());
    return matchesSearch && matchesSkill;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">멘토 찾기</h1>
        
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                멘토 검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름이나 소개로 검색..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스킬 필터
              </label>
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="스킬로 필터링..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

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
      </div>

      {/* 멘토 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchTerm || skillFilter ? '검색 조건에 맞는 멘토가 없습니다.' : '등록된 멘토가 없습니다.'}
            </div>
          </div>
        ) : (
          filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{mentor.name}</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  멘토
                </span>
              </div>

              {mentor.bio && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm line-clamp-3">{mentor.bio}</p>
                </div>
              )}

              {mentor.skills && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">스킬</h4>
                  <div className="flex flex-wrap gap-1">
                    {mentor.skills.split(',').slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                    {mentor.skills.split(',').length > 3 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        +{mentor.skills.split(',').length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {mentor.experience && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">경험</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{mentor.experience}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  가입일: {new Date(mentor.createdAt).toLocaleDateString()}
                </div>
                
                {user?.role === 'mentee' && user?.id !== mentor.id && (
                  <button
                    onClick={() => handleMatchRequest(mentor.id)}
                    disabled={requestingMentorId === mentor.id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {requestingMentorId === mentor.id ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      '매칭 요청'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 (추후 구현 가능) */}
      {filteredMentors.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">총 {filteredMentors.length}명의 멘토가 있습니다.</p>
        </div>
      )}
    </div>
  );
};

export default MentorsPage;
