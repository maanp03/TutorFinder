import React, { useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token, userId, name, role } = res.data; 
      login(token, role || (email.includes('tutor') ? 'tutor' : 'client'), userId || 'dummyId', name || 'User');
      if ((role || '').toLowerCase() === 'admin') navigate('/admin');
      else if ((role || '').toLowerCase() === 'tutor') navigate('/tutor');
      else navigate('/client');
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%' }}
            required 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
            required 
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px' }}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
