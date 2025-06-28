import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Spinner, 
  Alert,
  Modal
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { matchService } from '../services/matchService';

const MentorsPage = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [requestingMentorId, setRequestingMentorId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

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

  const handleShowRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    setRequestMessage(`안녕하세요! ${mentor.profile.name}님께 멘토링을 요청드립니다.`);
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setSelectedMentor(null);
    setRequestMessage('');
  };

  const handleMatchRequest = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (user.role !== 'mentee') {
      setError('멘티만 매칭 요청을 할 수 있습니다.');
      return;
    }

    setRequestingMentorId(selectedMentor.id);
    setError('');

    try {
      await matchService.createRequest(selectedMentor.id, requestMessage);
      setSuccess('매칭 요청이 성공적으로 전송되었습니다.');
      handleCloseRequestModal();
    } catch (error) {
      setError(error.message || '매칭 요청에 실패했습니다.');
    } finally {
      setRequestingMentorId(null);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.profile.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !skillFilter || 
                        mentor.profile.skills.some(skill => 
                          skill.toLowerCase().includes(skillFilter.toLowerCase())
                        );
    return matchesSearch && matchesSkill;
  });

  const getAllSkills = () => {
    const skills = new Set();
    mentors.forEach(mentor => {
      mentor.profile.skills.forEach(skill => skills.add(skill));
    });
    return Array.from(skills);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" className="me-3" />
        <span>멘토 목록을 불러오는 중...</span>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <i className="fas fa-users text-primary me-2"></i>
          멘토 찾기
        </h1>
        <Badge bg="info" className="fs-6">
          총 {filteredMentors.length}명
        </Badge>
      </div>

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

      {/* 검색 및 필터 */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="멘토 이름이나 소개로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <option value="">모든 스킬</option>
            {getAllSkills().map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* 멘토 카드 목록 */}
      <Row>
        {filteredMentors.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                <h5>검색 결과가 없습니다</h5>
                <p className="text-muted">다른 키워드로 검색해보세요.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredMentors.map(mentor => (
            <Col md={6} lg={4} key={mentor.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="text-center mb-3">
                    <div className="mentor-avatar mb-3">
                      {mentor.profile.imageUrl ? (
                        <img
                          src={mentor.profile.imageUrl}
                          alt={mentor.profile.name}
                          className="rounded-circle"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                          style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                        >
                          {mentor.profile.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h5 className="card-title mb-1">{mentor.profile.name}</h5>
                    <Badge bg="success" className="mb-2">멘토</Badge>
                  </div>

                  <p className="card-text text-muted mb-3 flex-grow-1">
                    {mentor.profile.bio || '자기소개가 없습니다.'}
                  </p>

                  {mentor.profile.skills && mentor.profile.skills.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted mb-2 d-block">
                        <i className="fas fa-code me-1"></i>
                        스킬
                      </small>
                      <div>
                        {mentor.profile.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            bg="outline-primary" 
                            className="me-1 mb-1"
                            style={{ color: '#0d6efd', border: '1px solid #0d6efd' }}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {user && user.role === 'mentee' && (
                    <Button
                      variant="primary"
                      onClick={() => handleShowRequestModal(mentor)}
                      disabled={requestingMentorId === mentor.id}
                      className="w-100"
                    >
                      {requestingMentorId === mentor.id ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          요청 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-handshake me-2"></i>
                          멘토링 요청
                        </>
                      )}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* 매칭 요청 모달 */}
      <Modal show={showRequestModal} onHide={handleCloseRequestModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-handshake me-2"></i>
            멘토링 요청
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMentor && (
            <div className="text-center mb-3">
              <div className="mentor-avatar mb-2">
                {selectedMentor.profile.imageUrl ? (
                  <img
                    src={selectedMentor.profile.imageUrl}
                    alt={selectedMentor.profile.name}
                    className="rounded-circle"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
                  >
                    {selectedMentor.profile.name.charAt(0)}
                  </div>
                )}
              </div>
              <h6>{selectedMentor.profile.name}님께 멘토링을 요청합니다</h6>
            </div>
          )}
          <Form>
            <Form.Group>
              <Form.Label>
                <i className="fas fa-comment me-1"></i>
                요청 메시지
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="멘토님께 전할 메시지를 작성해주세요..."
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {requestMessage.length}/500
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRequestModal}>
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={handleMatchRequest}
            disabled={!requestMessage.trim() || requestingMentorId}
          >
            {requestingMentorId ? (
              <>
                <Spinner size="sm" className="me-2" />
                요청 중...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                요청 보내기
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MentorsPage;
