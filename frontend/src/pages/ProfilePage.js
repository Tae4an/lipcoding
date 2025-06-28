import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    bio: '',
    skills: '',
    experience: '',
    profileImage: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        name: user.name || '',
        role: user.role || '',
        bio: user.bio || '',
        skills: user.skills || '',
        experience: user.experience || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await userService.updateProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      setError(error.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      email: user.email || '',
      name: user.name || '',
      role: user.role || '',
      bio: user.bio || '',
      skills: user.skills || '',
      experience: user.experience || '',
      profileImage: user.profileImage || ''
    });
    setError('');
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              편집
            </button>
          )}
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

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                역할
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">역할을 선택하세요</option>
                <option value="mentor">멘토</option>
                <option value="mentee">멘티</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="자기소개를 작성해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스킬/관심분야
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JavaScript, React, Node.js 등 (쉼표로 구분)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                경력/경험
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="경력이나 경험을 작성해주세요"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <LoadingSpinner size="small" /> : '저장'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">이메일</h3>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">이름</h3>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">역할</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'mentor' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role === 'mentor' ? '멘토' : '멘티'}
              </span>
            </div>

            {user.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">자기소개</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            {user.skills && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">스킬/관심분야</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.experience && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">경력/경험</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{user.experience}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
