import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

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
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" className="me-3" />
        <span>사용자 정보를 불러오는 중...</span>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  프로필
                </h3>
                {!isEditing && (
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    편집
                  </Button>
                )}
              </div>
            </Card.Header>
            
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="fas fa-envelope me-1"></i>
                          이메일
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          이메일은 변경할 수 없습니다.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="fas fa-user me-1"></i>
                          이름
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="이름을 입력하세요"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user-tag me-1"></i>
                      역할
                    </Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">역할을 선택하세요</option>
                      <option value="mentor">멘토</option>
                      <option value="mentee">멘티</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-comment me-1"></i>
                      자기소개
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="자기소개를 작성해주세요"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-code me-1"></i>
                      스킬/관심분야
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="JavaScript, React, Node.js 등 (쉼표로 구분)"
                    />
                    <Form.Text className="text-muted">
                      여러 스킬은 쉼표(,)로 구분해서 입력하세요.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <i className="fas fa-briefcase me-1"></i>
                      경력/경험
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="경력이나 경험을 작성해주세요"
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="flex-fill"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          저장
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      className="flex-fill"
                    >
                      <i className="fas fa-times me-2"></i>
                      취소
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  {/* 프로필 헤더 */}
                  <div className="text-center mb-4">
                    <div className="profile-avatar mb-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="rounded-circle"
                          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                          style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                        >
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <h4 className="mb-2">{user.name}</h4>
                    <Badge bg={user.role === 'mentor' ? 'primary' : 'success'} className="fs-6">
                      {user.role === 'mentor' ? '멘토' : '멘티'}
                    </Badge>
                  </div>

                  {/* 프로필 정보 */}
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="text-muted mb-1">
                          <i className="fas fa-envelope me-1"></i>
                          이메일
                        </h6>
                        <p className="mb-0">{user.email}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="text-muted mb-1">
                          <i className="fas fa-user me-1"></i>
                          이름
                        </h6>
                        <p className="mb-0">{user.name}</p>
                      </div>
                    </Col>
                  </Row>

                  {user.bio && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <i className="fas fa-comment me-1"></i>
                        자기소개
                      </h6>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {user.skills && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <i className="fas fa-code me-1"></i>
                        스킬/관심분야
                      </h6>
                      <div>
                        {user.skills.split(',').map((skill, index) => (
                          <Badge
                            key={index}
                            bg="outline-primary"
                            className="me-2 mb-1"
                            style={{ color: '#0d6efd', border: '1px solid #0d6efd' }}
                          >
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.experience && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <i className="fas fa-briefcase me-1"></i>
                        경력/경험
                      </h6>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {user.experience}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
