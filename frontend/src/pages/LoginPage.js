import React, { useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailTrim = email.trim().toLowerCase();
      let res;

      if (emailTrim === 'admin@exmail.com') {
        res = await axios.post('/admin/login', { email: emailTrim, password });
        const { token, role, userId, name } = res.data;
        login(token, role || 'admin', userId || 'admin', name || 'Administrator');
        navigate('/admin');
      } else {
        res = await axios.post('/auth/login', { email: emailTrim, password });
        const { token, userId, name, role } = res.data;
        login(token, role || (email.includes('tutor') ? 'tutor' : 'client'), userId || 'dummyId', name || 'User');
        if ((role || '').toLowerCase() === 'admin') navigate('/admin');
        else if ((role || '').toLowerCase() === 'tutor') navigate('/tutor');
        else navigate('/client');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-page" data-testid="login-page">
      <div className="auth-container">
        <div className="auth-image-side">
          {/* <img src="https://images.unsplash.com/photo-1758685733907-42e9651721f5?auto=format&fit=crop&w=1200&q=80" alt="Tutoring" /> */}
          <div className="auth-image-overlay">
            <h2>Welcome Back!</h2>
            <p>Sign in to continue your learning journey with TutorFinder</p>
          </div>
        </div>
        
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-logo" onClick={() => navigate('/')}>TutorFinder</div>
            
            <h1>Sign In</h1>
            <p className="auth-subtitle">Enter your credentials to access your account</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><FaEnvelope /> Email Address</label>
                <input 
                  type="email" 
                  className="form-input"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  data-testid="login-email"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label"><FaLock /> Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  data-testid="login-password"
                />
              </div>
              
              <button type="submit" className="auth-btn" data-testid="login-submit">
                <FaSignInAlt /> Sign In
              </button>
            </form>
            
            <p className="auth-switch">
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
