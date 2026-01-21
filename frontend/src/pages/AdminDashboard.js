import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { FaUserShield, FaChalkboardTeacher, FaUsers, FaCalendarAlt, FaTrash, FaTimes, FaBook } from 'react-icons/fa';
import './Dashboard.css';

const AdminDashboard = () => {
  const [tutors, setTutors] = useState([]);
  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    axios.get('/admin/tutors').then(res => setTutors(res.data)).catch(() => setError('Failed to fetch tutors'));
    axios.get('/admin/clients').then(res => setClients(res.data)).catch(() => setError('Failed to fetch clients'));
    axios.get('/admin/sessions').then(res => setSessions(res.data)).catch(() => setError('Failed to fetch sessions'));
  }, []);

  const deleteTutor = async (tutorId) => {
    try { await axios.delete(`/admin/tutors/${tutorId}`); setTutors(tutors.filter(t => t._id !== tutorId)); }
    catch { setError('Failed to delete tutor'); }
  };

  const deleteClient = async (clientId) => {
    try { await axios.delete(`/admin/clients/${clientId}`); setClients(clients.filter(c => c._id !== clientId)); }
    catch { setError('Failed to delete client'); }
  };

  const cancelSession = async (sessionId) => {
    const reason = window.prompt('Optional reason for cancelling this session:', '');
    setIsCancelling(true);
    try {
      const res = await axios.post(`/sessions/${sessionId}/cancel`, { reason: reason || undefined });
      setSessions(prev => prev.map(s => (s._id === sessionId ? res.data : s)));
    } catch { setError('Failed to cancel session'); }
    finally { setIsCancelling(false); }
  };

  const getStatusBadge = (status) => {
    const map = { accepted: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger', cancelled: 'badge-secondary' };
    return map[status] || 'badge-info';
  };

  return (
    <div className="dashboard-container" data-testid="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title"><span>Admin</span> Dashboard</h1>
        <p className="dashboard-subtitle">Manage tutors, clients, and sessions</p>
      </div>

      {error && <div className="error-alert" data-testid="error-alert"><FaTimes /> {error}</div>}

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, color: '#d4af37', marginBottom: 8 }}>{tutors.length}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Total Tutors</div>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, color: '#4ade80', marginBottom: 8 }}>{clients.length}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Total Students</div>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, color: '#60a5fa', marginBottom: 8 }}>{sessions.length}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Total Sessions</div>
        </div>
      </div>

      {/* Tutors Table */}
      <div className="glass-card" data-testid="tutors-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaChalkboardTeacher /></div> Tutors</h3>
        </div>
        <div className="card-body">
          {tutors.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subjects</th>
                    <th>Bio</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map(tutor => (
                    <tr key={tutor._id}>
                      <td style={{ fontWeight: 600 }}>{tutor.name}</td>
                      <td>{tutor.subjects.map((s, i) => <span key={i} className="subject-badge">{s}</span>)}</td>
                      <td style={{ color: 'rgba(255,255,255,0.7)' }}>{tutor.bio}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTutor(tutor._id)} data-testid={`delete-tutor-${tutor._id}`}>
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FaChalkboardTeacher /></div>
              <p className="empty-state-text">No tutors found</p>
            </div>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="glass-card" data-testid="sessions-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaBook /></div> Sessions</h3>
        </div>
        <div className="card-body">
          {sessions.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session._id}>
                      <td style={{ fontWeight: 600 }}>{session.tutor?.name || 'N/A'}</td>
                      <td>{session.client?.name || 'N/A'}</td>
                      <td>{new Date(session.date).toLocaleDateString()}</td>
                      <td>{session.duration} min</td>
                      <td><span className={`badge ${getStatusBadge(session.status)}`}>{session.status}</span></td>
                      <td>
                        {session.status !== 'cancelled' ? (
                          <button className="btn btn-outline btn-sm" onClick={() => cancelSession(session._id)} disabled={isCancelling} data-testid={`cancel-session-${session._id}`}>
                            <FaTimes /> Cancel
                          </button>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FaCalendarAlt /></div>
              <p className="empty-state-text">No sessions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-card" data-testid="clients-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaUsers /></div> Students</h3>
        </div>
        <div className="card-body">
          {clients.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client._id}>
                      <td style={{ fontWeight: 600 }}>{client.name}</td>
                      <td>Grade {client.grade}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteClient(client._id)} data-testid={`delete-client-${client._id}`}>
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FaUsers /></div>
              <p className="empty-state-text">No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
