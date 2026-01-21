import React, { useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
      alert('Registration failed');
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name: </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%' }}
            required 
          />
        </div>
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
        <div style={{ marginBottom: '10px' }}>
          <label>Role: </label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%' }}>
            <option value="client">Client</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '10px 15px' }}>Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
