import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import './HomePage.css';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useContext(AuthContext);

  const [showSignup, setShowSignup] = useState(false);

  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('client');


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailTrim = loginEmail.trim().toLowerCase();
      let res;


      if (emailTrim === 'admin@exmail.com') {
        res = await axios.post('/admin/login', {
          email: emailTrim,
          password: loginPassword,
        });
        const { token, role, userId, name } = res.data;
        contextLogin(token, role || 'admin', userId || 'admin', name || 'Administrator');
        navigate('/admin');
      } else {
        res = await axios.post('/auth/login', {
          email: emailTrim,
          password: loginPassword,
        });
        const { token, role, userId, name } = res.data;

        console.log('[Debug] Tutor/Client 로그인 응답 =>', token, role, userId, name);

        contextLogin(token, role, userId, name);

        if (role === 'tutor') {
          navigate('/tutor');
        } else {
          navigate('/client');
        }
      }
    } catch (err) {
      console.error('[Debug] 로그인 요청 실패:', err);
      if (err.response) {
        console.log('[Debug] err.response.data:', err.response.data);
        console.log('[Debug] err.response.status:', err.response.status);
      }
      alert('Login failed');
    }
  };


  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailTrim = signupEmail.trim().toLowerCase();
      const res = await axios.post('/auth/register', {
        name: signupName,
        email: emailTrim,
        password: signupPassword,
        role: signupRole,
      });

      const { token, role, userId, name } = res.data;
      const finalName = name || signupName;


      contextLogin(token, role, userId, finalName);

      if (role === 'tutor') {
        navigate('/tutor');
      } else {
        navigate('/client');
      }
    } catch (err) {
      console.error('[Debug] 회원가입 요청 실패:', err);
      if (err.response) {
        console.log('[Debug] err.response.data:', err.response.data);
        console.log('[Debug] err.response.status:', err.response.status);
      }
      alert('Signup failed');
    }
  };

  return (
    <div className="container">
      <div className="left">
        <div className="leftOverlay">
          <h1 className="tagline">Empower Your Learning</h1>
          <p className="description">
            Discover the right tutor to excel in your studies. TutorFinder connects you with experienced tutors for personalized academic support.
          </p>
        </div>
        <img 
          src="/images/man-2562325_1920.jpg"
          alt="Studying Student"
          className="image"
        />
      </div>
      <div className="right">
        <div className="box">
          {!showSignup ? (
            <>
              <h2 className="boxTitle">Login</h2>
              <form onSubmit={handleLoginSubmit} className="form">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input"
                  required
                />
                <button type="submit" className="button">Login</button>
              </form>
              <p className="toggleText">Don't have an account?</p>
              <button
                onClick={() => setShowSignup(true)}
                className="toggleButton"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <h2 className="boxTitle">Sign Up</h2>
              <form onSubmit={handleSignupSubmit} className="form">
                <input
                  type="text"
                  placeholder="Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="input"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="input"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="input"
                  required
                />
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="input"
                >
                  <option value="tutor">Tutor</option>
                  <option value="client">Client</option>
                </select>
                <button type="submit" className="button">Sign Up</button>
              </form>
              <p className="toggleText">Already have an account?</p>
              <button
                onClick={() => setShowSignup(false)}
                className="toggleButton"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
