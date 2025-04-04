import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const ClientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState('');

  const userId = localStorage.getItem('userId'); 

  useEffect(() => {
    axios
      .get(`/client/profile/${userId}`)
      .then((res) => {
        setProfile(res.data); 
      })
      .catch((err) => {
        console.error('No client profile found:', err.response?.data?.msg);
      });

    axios
      .get('/tutor/profile-all')
      .then((res) => setTutors(res.data))
      .catch((err) => console.error(err));
  }, [userId]);

  useEffect(() => {
    if (profile?._id) {
      axios
        .get('/sessions', { params: { clientId: profile._id } })
        .then((res) => {
          setSessions(res.data);
        })
        .catch((err) => console.error(err));
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
    } catch (err) {
      console.error('Profile create/update failed:', err);
      alert('Profile update failed');
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
      alert('Session booked!');
      setSessions((prev) => [...prev, res.data]);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed');
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Client Dashboard</h2>

      {profile ? (
        <div>
          <h3>My Profile</h3>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Grade:</strong> {profile.grade}</p>
          <button onClick={handleShowProfileForm}>Update Profile</button>
        </div>
      ) : (
        <div>
          <p>No client profile found.</p>
          <button onClick={handleShowProfileForm}>Create Profile</button>
        </div>
      )}

      {showProfileForm && (
        <form onSubmit={handleCreateOrUpdateProfile} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>Name: </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Grade: </label>
            <input
              type="number"
              value={formGrade}
              onChange={(e) => setFormGrade(e.target.value)}
              required
            />
          </div>
          <button type="submit">Save Profile</button>
        </form>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>Available Tutors</h3>
        {tutors.length > 0 ? (
          <ul>
            {tutors.map((tutor) => (
              <li key={tutor._id}>
                <strong>{tutor.name}</strong> - {tutor.subjects?.join(', ')}
                <button onClick={() => handleBookSession(tutor._id)} style={{ marginLeft: '10px' }}>
                  Book Session
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tutors available.</p>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>My Sessions</h3>
        {sessions.length > 0 ? (
          <ul>
            {sessions.map((session) => (
              <li key={session._id}>
                {new Date(session.date).toLocaleString()} - {session.duration} min
                <br />
                <strong>Tutor ID:</strong> {session.tutor?._id || session.tutor}
                <br />
                <strong>Tutor Name:</strong> {session.tutor?.name || 'N/A'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No sessions booked yet.</p>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
