import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import { FaUser, FaChalkboardTeacher, FaCalendarAlt, FaBell, FaEdit, FaTrash, FaEye, FaTimes, FaCheck, FaBook, FaClock } from 'react-icons/fa';
import './Dashboard.css';

const ClientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookingWeekday, setBookingWeekday] = useState(1);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [bookingDuration, setBookingDuration] = useState(60);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [error, setError] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [tutorAvailability, setTutorAvailability] = useState([]);

  const userId = localStorage.getItem('userId');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/client/profile/${userId}`)
      .then((res) => setProfile(res.data))
      .catch(() => setError('Failed to fetch profile'));

    axios
      .get('/tutor/profile-all')
      .then((res) => setTutors(res.data))
      .catch(() => setError('Failed to fetch tutors'));
  }, [userId]);

  useEffect(() => {
    if (profile?._id) {
      axios
        .get('/sessions', { params: { clientId: profile._id } })
        .then((res) => setSessions(res.data))
        .catch(() => setError('Failed to fetch sessions'));
    }
  }, [profile]);

  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const res = await axios.get('/notifications');
        setNotifications(res.data);
      } catch (e) {}
      finally { timer = setTimeout(poll, 10000); }
    };
    poll();
    return () => clearTimeout(timer);
  }, []);

  const handleCreateOrUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/client/profile', { name: formName, grade: formGrade });
      setProfile(res.data);
      setShowProfileForm(false);
    } catch { setError('Failed to update profile'); }
  };

  const handleShowProfileForm = () => {
    if (profile) { setFormName(profile.name); setFormGrade(profile.grade); }
    setShowProfileForm(true);
  };

  const nextDateForWeekday = (weekday, timeHHMM) => {
    const now = new Date();
    const [hh, mm] = timeHHMM.split(':').map(Number);
    const result = new Date(now);
    const currentDow = now.getDay();
    let delta = (weekday - currentDow + 7) % 7;
    if (delta === 0 && (now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm))) delta = 7;
    result.setDate(now.getDate() + delta);
    result.setHours(hh, mm, 0, 0);
    return result.toISOString();
  };

  const handleBookSession = async (tutorId) => {
    try {
      const iso = nextDateForWeekday(Number(bookingWeekday), bookingTime);
      const res = await axios.post('/sessions', { tutorId, clientId: profile._id, date: iso, duration: Number(bookingDuration) });
      setSessions((prev) => [...prev, res.data]);
    } catch { setError('Failed to book session'); }
  };

  const handleCancel = async (id) => {
    try {
      const res = await axios.post(`/sessions/${id}/cancel`);
      setSessions(prev => prev.map(s => (s._id === id ? res.data : s)));
    } catch { setError('Failed to cancel session'); }
  };

  const handleDeleteAccount = async () => {
    try { await axios.delete('/client/account'); logout(); navigate('/'); }
    catch { setError('Failed to delete account'); }
  };

  const handleViewTutor = async (tutor) => {
    setSelectedTutor(tutor);
    setShowTutorModal(true);
    try {
      const res = await axios.get(`/availability/tutor/${tutor._id}`);
      const uniqueAvailability = res.data.reduce((acc, current) => {
        if (!acc.find(item => item.weekday === current.weekday)) acc.push(current);
        return acc;
      }, []);
      setTutorAvailability(uniqueAvailability);
    } catch { setTutorAvailability([]); }
  };

  const closeTutorModal = () => { setShowTutorModal(false); setSelectedTutor(null); setTutorAvailability([]); };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getWeekdayName = (weekday) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday];

  const getStatusBadge = (status) => {
    const statusMap = {
      accepted: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger',
      cancelled: 'badge-secondary'
    };
    return statusMap[status] || 'badge-info';
  };

  const getNotificationType = (type) => {
    if (type === 'session_accepted') return 'type-accepted';
    if (type === 'session_rejected') return 'type-rejected';
    if (type === 'session_cancelled') return 'type-cancelled';
    return 'type-request';
  };

  return (
    <div className="dashboard-container" data-testid="client-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome, <span>{profile?.name || 'Student'}</span></h1>
        <p className="dashboard-subtitle">Manage your tutoring sessions and find the perfect tutor</p>
      </div>

      {error && <div className="error-alert" data-testid="error-alert"><FaTimes /> {error}</div>}

      {/* Profile Section */}
      <div className="glass-card" data-testid="profile-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaUser /></div> My Profile</h3>
        </div>
        <div className="card-body">
          {profile ? (
            <>
              <div className="profile-info">
                <div className="profile-item">
                  <div className="profile-label">Full Name</div>
                  <div className="profile-value">{profile.name}</div>
                </div>
                <div className="profile-item">
                  <div className="profile-label">Grade Level</div>
                  <div className="profile-value">Grade {profile.grade}</div>
                </div>
              </div>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={handleShowProfileForm} data-testid="update-profile-btn">
                  <FaEdit /> Update Profile
                </button>
                <button className="btn btn-danger" onClick={handleDeleteAccount} data-testid="delete-account-btn">
                  <FaTrash /> Delete Account
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">No profile found. Create one to get started!</p>
              <button className="btn btn-primary" onClick={handleShowProfileForm} data-testid="create-profile-btn">
                Create Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="modal-overlay" onClick={() => setShowProfileForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} data-testid="profile-modal">
            <div className="modal-header">
              <h3 className="modal-title">{profile ? 'Update Profile' : 'Create Profile'}</h3>
              <button className="modal-close" onClick={() => setShowProfileForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateOrUpdateProfile}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={formName} onChange={(e) => setFormName(e.target.value)} required data-testid="profile-name-input" />
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Grade Level</label>
                  <input type="number" className="form-input" value={formGrade} onChange={(e) => setFormGrade(e.target.value)} required data-testid="profile-grade-input" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" data-testid="save-profile-btn">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Booking Controls */}
      <div className="glass-card" data-testid="booking-controls">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaCalendarAlt /></div> Quick Booking</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weekday</label>
              <select className="form-select" value={bookingWeekday} onChange={(e) => setBookingWeekday(e.target.value)} data-testid="booking-weekday">
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-input" type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} data-testid="booking-time" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" min="15" step="15" value={bookingDuration} onChange={(e) => setBookingDuration(e.target.value)} data-testid="booking-duration" />
            </div>
          </div>
          <p className="form-hint">Choose a weekday and time that matches the tutor's availability</p>
        </div>
      </div>

      {/* Available Tutors */}
      <div className="glass-card" data-testid="tutors-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaChalkboardTeacher /></div> Available Tutors</h3>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((tutor) => (
                    <tr key={tutor._id}>
                      <td style={{ fontWeight: 600 }}>{tutor.name}</td>
                      <td>
                        {tutor.subjects.map((subj, i) => (
                          <span key={i} className="subject-badge">{subj}</span>
                        ))}
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.7)' }}>{tutor.bio}</td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-success btn-sm" onClick={() => handleBookSession(tutor._id)} data-testid={`book-${tutor._id}`}>
                            <FaCheck /> Book
                          </button>
                          <button className="btn btn-info btn-sm" onClick={() => handleViewTutor(tutor)} data-testid={`view-${tutor._id}`}>
                            <FaEye /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FaChalkboardTeacher /></div>
              <p className="empty-state-text">No tutors available at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Sessions */}
      <div className="glass-card" data-testid="sessions-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaBook /></div> My Sessions</h3>
        </div>
        <div className="card-body">
          {sessions.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Tutor</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session._id}>
                      <td>{new Date(session.date).toLocaleString()}</td>
                      <td><FaClock style={{ marginRight: 6, opacity: 0.6 }} />{session.duration} min</td>
                      <td>{session.tutor?.name || 'N/A'}</td>
                      <td><span className={`badge ${getStatusBadge(session.status)}`}>{session.status || 'pending'}</span></td>
                      <td>
                        {session.status === 'pending' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(session._id)} data-testid={`cancel-${session._id}`}>
                            <FaTimes /> Cancel
                          </button>
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
              <p className="empty-state-text">No sessions booked yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card" data-testid="notifications-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaBell /></div> Notifications</h3>
          <span className="badge badge-info">{notifications.filter(n => !n.read).length} unread</span>
        </div>
        <div className="card-body">
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map(n => (
                <div key={n._id} className={`notification-item ${getNotificationType(n.type)}`}>
                  <div className="notification-content">
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">No notifications yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Tutor Details Modal */}
      {showTutorModal && selectedTutor && (
        <div className="modal-overlay" onClick={closeTutorModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} data-testid="tutor-modal">
            <div className="modal-header">
              <h3 className="modal-title">Tutor Details</h3>
              <button className="modal-close" onClick={closeTutorModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div>
                  <h4 style={{ color: '#d4af37', marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Personal Info</h4>
                  <div className="profile-item" style={{ marginBottom: 12 }}>
                    <div className="profile-label">Name</div>
                    <div className="profile-value">{selectedTutor.name}</div>
                  </div>
                  <div className="profile-item" style={{ marginBottom: 12 }}>
                    <div className="profile-label">Bio</div>
                    <div className="profile-value" style={{ fontSize: 14 }}>{selectedTutor.bio}</div>
                  </div>
                  <div className="profile-item">
                    <div className="profile-label">Subjects</div>
                    <div style={{ marginTop: 6 }}>
                      {selectedTutor.subjects.map((s, i) => <span key={i} className="subject-badge">{s}</span>)}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ color: '#d4af37', marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Availability</h4>
                  {tutorAvailability.length > 0 ? (
                    <div className="availability-list">
                      {tutorAvailability.map((avail, idx) => (
                        <div key={idx} className="availability-item">
                          <span className="availability-day">{getWeekdayName(avail.weekday)}</span>
                          <div className="availability-slots">
                            {avail.slots.map((slot, si) => (
                              <span key={si} className="time-slot">{formatTime(slot.startMinutes)} - {formatTime(slot.endMinutes)}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>No availability info</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeTutorModal}>Close</button>
              <button className="btn btn-primary" onClick={() => { handleBookSession(selectedTutor._id); closeTutorModal(); }}>
                <FaCheck /> Book Session
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default ClientDashboard;
