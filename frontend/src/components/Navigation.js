import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
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
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            <i className="fas fa-graduation-cap me-2"></i>
            MentorMatch
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link 
                as={Link} 
                to="/login" 
                className={isActivePath('/login') ? 'active' : ''}
              >
                로그인
              </Nav.Link>
              <Button 
                as={Link} 
                to="/signup" 
                variant="outline-light" 
                className="ms-2"
              >
                회원가입
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="fas fa-graduation-cap me-2"></i>
          MentorMatch
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/mentors" 
              className={isActivePath('/mentors') ? 'active' : ''}
            >
              <i className="fas fa-users me-1"></i>
              멘토 찾기
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/requests" 
              className={isActivePath('/requests') ? 'active' : ''}
            >
              <i className="fas fa-handshake me-1"></i>
              {isMentor ? '받은 요청' : '내 요청'}
            </Nav.Link>
          </Nav>
          
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/profile">
              <i className="fas fa-user me-1"></i>
              {user?.name}
              <Badge bg="secondary" className="ms-2">
                {isMentor ? '멘토' : '멘티'}
              </Badge>
            </Nav.Link>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={handleLogout}
              className="ms-2"
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              로그아웃
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
