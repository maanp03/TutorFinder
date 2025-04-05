import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
 
// Bootstrap CDN
const bootstrapLink = document.createElement("link");
bootstrapLink.rel = "stylesheet";
bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
document.head.appendChild(bootstrapLink);
 
const ClientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [error, setError] = useState('');
 
  const userId = localStorage.getItem('userId');
 
  useEffect(() => {
    axios
      .get(`/client/profile/${userId}`)
      .then((res) => {
        setProfile(res.data);
      })
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
        .then((res) => {
          setSessions(res.data);
        })
        .catch(() => setError('Failed to fetch sessions'));
    }
  }, [profile]);
 
  const handleCreateOrUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/client/profile', {
        name: formName,
        grade: formGrade,
      });
      setProfile(res.data);
      setShowProfileForm(false);
    } catch {
      setError('Failed to update profile');
    }
  };
 
  const handleShowProfileForm = () => {
    if (profile) {
      setFormName(profile.name);
      setFormGrade(profile.grade);
    }
    setShowProfileForm(true);
  };
 
  const handleBookSession = async (tutorId) => {
    try {
      const res = await axios.post('/sessions', {
        tutorId,
        clientId: profile._id,
        date: new Date().toISOString(),
        duration: 60,
      });
      setSessions((prev) => [...prev, res.data]);
    } catch {
      setError('Failed to book session');
    }
  };
 
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light py-5 px-3">
      <h2 className="mb-4 fw-bold text-center">Client Dashboard</h2>
 
      {error && (
        <div className="alert alert-danger w-100 text-center" role="alert">
          {error}
        </div>
      )}
 
      {/* Profile Section */}
      <div className="w-100" style={{ maxWidth: '1100px' }}>
        <div className="card shadow mb-5">
          <div className="card-header bg-dark text-white text-center fw-semibold">
            My Profile
          </div>
          <div className="card-body">
            {profile ? (
              <div>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Grade:</strong> {profile.grade}</p>
                <button
                  className="btn btn-primary"
                  onClick={handleShowProfileForm}
                >
                  Update Profile
                </button>
              </div>
            ) : (
              <div>
                <p>No profile found.</p>
                <button
                  className="btn btn-primary"
                  onClick={handleShowProfileForm}
                >
                  Create Profile
                </button>
              </div>
            )}
          </div>
        </div>
 
        {/* Profile Form */}
        {showProfileForm && (
          <div className="card shadow mb-5">
            <div className="card-header bg-secondary text-white text-center fw-semibold">
              {profile ? 'Update Profile' : 'Create Profile'}
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateOrUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Grade</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        )}
 
        {/* Tutors Section */}
        <div className="card shadow mb-5">
          <div className="card-header bg-dark text-white text-center fw-semibold">
            Available Tutors
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Subjects</th>
                  <th>Bio</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tutors.length > 0 ? tutors.map((tutor) => (
                  <tr key={tutor._id}>
                    <td>{tutor.name}</td>
                    <td>{tutor.subjects.join(', ')}</td>
                    <td>{tutor.bio}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleBookSession(tutor._id)}
                      >
                        Book Session
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center">No tutors available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
 
        {/* Sessions Section */}
        <div className="card shadow">
          <div className="card-header bg-secondary text-white text-center fw-semibold">
            My Sessions
          </div>
          <div className="card-body p-0">
            <table className="table table-striped mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Tutor Name</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? sessions.map((session) => (
                  <tr key={session._id}>
                    <td>{new Date(session.date).toLocaleString()}</td>
                    <td>{session.duration} min</td>
                    <td>{session.tutor?.name || 'N/A'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="text-center">No sessions booked yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ClientDashboard;