import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Nav, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';

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
      pending: { text: '대기중', variant: 'warning' },
      accepted: { text: '수락됨', variant: 'success' },
      rejected: { text: '거절됨', variant: 'danger' },
      canceled: { text: '취소됨', variant: 'secondary' }
    };
    
    const statusInfo = statusMap[status] || { text: status, variant: 'secondary' };
    
    return (
      <Badge bg={statusInfo.variant}>
        {statusInfo.text}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" className="me-3" />
        <span>사용자 정보를 불러오는 중...</span>
      </Container>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-handshake me-2"></i>
                매칭 요청 관리
              </h3>
            </Card.Header>
            
            <Card.Body className="p-0">
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="border-bottom-0">
                  <Nav.Item>
                    <Nav.Link eventKey="received" className="px-4 py-3">
                      <i className="fas fa-inbox me-2"></i>
                      받은 요청
                      {user.role === 'mentor' && pendingCount > 0 && (
                        <Badge bg="danger" className="ms-2">
                          {pendingCount}
                        </Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="sent" className="px-4 py-3">
                      <i className="fas fa-paper-plane me-2"></i>
                      보낸 요청
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <div className="p-4">
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

                  <Tab.Content>
                    <Tab.Pane eventKey="received">
                      <h4 className="mb-4">
                        <i className="fas fa-inbox me-2 text-primary"></i>
                        받은 매칭 요청
                      </h4>
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" className="me-3" />
                          <span>요청 목록을 불러오는 중...</span>
                        </div>
                      ) : requests.length === 0 ? (
                        <Card className="text-center py-5">
                          <Card.Body>
                            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <h5>받은 매칭 요청이 없습니다</h5>
                            <p className="text-muted">멘티들의 요청을 기다리고 있습니다.</p>
                          </Card.Body>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {requests.map((request) => (
                            <Card key={request.id} className="mb-3">
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <div className="d-flex align-items-center mb-2">
                                      <h5 className="me-3 mb-0">
                                        {request.mentee?.name || '멘티'}
                                      </h5>
                                      {getStatusBadge(request.status)}
                                    </div>
                                    <div className="text-muted small mb-1">
                                      <i className="fas fa-envelope me-1"></i>
                                      {request.mentee?.email}
                                    </div>
                                    <div className="text-muted small">
                                      <i className="fas fa-calendar me-1"></i>
                                      요청일: {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>

                                {request.message && (
                                  <Alert variant="light" className="mb-3">
                                    <h6 className="mb-2">
                                      <i className="fas fa-comment me-1"></i>
                                      요청 메시지
                                    </h6>
                                    <p className="mb-0">{request.message}</p>
                                  </Alert>
                                )}

                                {request.mentee && (
                                  <div className="bg-light rounded p-3 mb-3">
                                    <Row>
                                      {request.mentee.bio && (
                                        <Col md={6}>
                                          <h6 className="text-muted mb-1">소개</h6>
                                          <p className="small mb-0">{request.mentee.bio}</p>
                                        </Col>
                                      )}
                                      {request.mentee.skills && (
                                        <Col md={6}>
                                          <h6 className="text-muted mb-2">관심분야</h6>
                                          <div>
                                            {request.mentee.skills.split(',').map((skill, index) => (
                                              <Badge
                                                key={index}
                                                bg="outline-secondary"
                                                className="me-1 mb-1"
                                                style={{ color: '#6c757d', border: '1px solid #6c757d' }}
                                              >
                                                {skill.trim()}
                                              </Badge>
                                            ))}
                                          </div>
                                        </Col>
                                      )}
                                    </Row>
                                  </div>
                                )}

                                {request.status === 'pending' && (
                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleAcceptRequest(request.id)}
                                      disabled={actionLoading === request.id}
                                    >
                                      {actionLoading === request.id ? (
                                        <>
                                          <Spinner size="sm" className="me-2" />
                                          처리 중...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fas fa-check me-1"></i>
                                          수락
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleRejectRequest(request.id)}
                                      disabled={actionLoading === request.id}
                                    >
                                      {actionLoading === request.id ? (
                                        <>
                                          <Spinner size="sm" className="me-2" />
                                          처리 중...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fas fa-times me-1"></i>
                                          거절
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {request.status !== 'pending' && (
                                  <div className="text-muted small">
                                    <i className="fas fa-info-circle me-1"></i>
                                    {request.status === 'accepted' && '이 요청을 수락했습니다.'}
                                    {request.status === 'rejected' && '이 요청을 거절했습니다.'}
                                    {request.status === 'canceled' && '이 요청이 취소되었습니다.'}
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </Tab.Pane>

                    <Tab.Pane eventKey="sent">
                      <h4 className="mb-4">
                        <i className="fas fa-paper-plane me-2 text-primary"></i>
                        보낸 매칭 요청
                      </h4>
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" className="me-3" />
                          <span>요청 목록을 불러오는 중...</span>
                        </div>
                      ) : requests.length === 0 ? (
                        <Card className="text-center py-5">
                          <Card.Body>
                            <i className="fas fa-paper-plane fa-3x text-muted mb-3"></i>
                            <h5>보낸 매칭 요청이 없습니다</h5>
                            <p className="text-muted">멘토를 찾아 매칭 요청을 보내보세요.</p>
                          </Card.Body>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {requests.map((request) => (
                            <Card key={request.id} className="mb-3">
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <div className="d-flex align-items-center mb-2">
                                      <h5 className="me-3 mb-0">
                                        {request.mentor?.name || '멘토'}
                                      </h5>
                                      {getStatusBadge(request.status)}
                                    </div>
                                    <div className="text-muted small mb-1">
                                      <i className="fas fa-envelope me-1"></i>
                                      {request.mentor?.email}
                                    </div>
                                    <div className="text-muted small">
                                      <i className="fas fa-calendar me-1"></i>
                                      요청일: {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>

                                {request.mentor && request.mentor.skills && (
                                  <div className="bg-light rounded p-3 mb-3">
                                    <h6 className="text-muted mb-2">멘토 전문분야</h6>
                                    <div>
                                      {request.mentor.skills.split(',').map((skill, index) => (
                                        <Badge
                                          key={index}
                                          bg="outline-primary"
                                          className="me-1 mb-1"
                                          style={{ color: '#0d6efd', border: '1px solid #0d6efd' }}
                                        >
                                          {skill.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {request.status === 'pending' && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleCancelRequest(request.id)}
                                    disabled={actionLoading === request.id}
                                  >
                                    {actionLoading === request.id ? (
                                      <>
                                        <Spinner size="sm" className="me-2" />
                                        취소 중...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-times me-1"></i>
                                        요청 취소
                                      </>
                                    )}
                                  </Button>
                                )}

                                {request.status !== 'pending' && (
                                  <div className="text-muted small">
                                    <i className="fas fa-info-circle me-1"></i>
                                    {request.status === 'accepted' && '멘토가 요청을 수락했습니다.'}
                                    {request.status === 'rejected' && '멘토가 요청을 거절했습니다.'}
                                    {request.status === 'canceled' && '요청을 취소했습니다.'}
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RequestsPage;
