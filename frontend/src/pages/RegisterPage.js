import React, { useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import './AuthPages.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/register', { name, email, password, role });
      const { token, userId } = res.data;
      login(token, role, userId || 'dummyId', name);
      if (role === 'admin') navigate('/admin');
      else if (role === 'tutor') navigate('/tutor');
      else navigate('/client');
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page" data-testid="register-page">
      <div className="auth-container">
        <div className="auth-image-side">
          {/* <img src="https://images.unsplash.com/photo-1660128357991-713518efae48?auto=format&fit=crop&w=1200&q=80" alt="Students studying" /> */}
          <div className="auth-image-overlay">
            <h2>Join TutorFinder</h2>
            <p>Start your journey to academic excellence today</p>
          </div>
        </div>
        
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-logo" onClick={() => navigate('/')}>TutorFinder</div>
            
            <h1>Create Account</h1>
            <p className="auth-subtitle">Fill in your details to get started</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><FaUser /> Full Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  data-testid="register-name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label"><FaEnvelope /> Email Address</label>
                <input 
                  type="email" 
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  data-testid="register-email"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label"><FaLock /> Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  data-testid="register-password"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">I am a...</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-btn ${role === 'client' ? 'active' : ''}`}
                    onClick={() => setRole('client')}
                    data-testid="role-client"
                  >
                    <FaUserGraduate /> Student
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'tutor' ? 'active' : ''}`}
                    onClick={() => setRole('tutor')}
                    data-testid="role-tutor"
                  >
                    <FaChalkboardTeacher /> Tutor
                  </button>
                </div>
              </div>
              
              <button type="submit" className="auth-btn" data-testid="register-submit">
                <FaUserPlus /> Create Account
              </button>
            </form>
            
            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
