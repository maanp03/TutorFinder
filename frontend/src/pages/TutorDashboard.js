import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const TutorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const [formName, setFormName] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formSubjects, setFormSubjects] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    axios
      .get(`/tutor/profile/${userId}`)
      .then((res) => {
        setProfile(res.data); 
      })
      .catch((err) => {
        console.error('No tutor profile found:', err.response?.data?.msg);
      });
  }, [userId]);

  useEffect(() => {
    if (profile?._id) {
      axios
        .get('/sessions', { params: { tutorId: profile._id } })
        .then((res) => {
          setSessions(res.data);
        })
        .catch((err) => console.error(err));
    }
  }, [profile]);

  const handleCreateOrUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const subjectsArray = formSubjects.split(',').map((s) => s.trim());

      const res = await axios.post('/tutor/profile', {
        name: formName,
        bio: formBio,
        subjects: subjectsArray,
      });
      setProfile(res.data);
      setShowProfileForm(false);
    } catch (err) {
      console.error('Profile create/update failed:', err.response?.data);
      alert('Profile update failed');
    }
  };

  const handleShowForm = () => {
    if (profile) {
      setFormName(profile.name);
      setFormBio(profile.bio);
      setFormSubjects(profile.subjects?.join(', '));
    }
    setShowProfileForm(true);
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Tutor Dashboard</h2>

      {}
      {profile ? (
        <div>
          <h3>My Profile</h3>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <p><strong>Subjects:</strong> {profile.subjects?.join(', ')}</p>
          <button onClick={handleShowForm}>Update Profile</button>
        </div>
      ) : (
        <div>
          <p>No tutor profile found.</p>
          <button onClick={handleShowForm}>Create Profile</button>
        </div>
      )}

      {}
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
            <label>Bio: </label>
            <input
              type="text"
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Subjects (comma-separated): </label>
            <input
              type="text"
              value={formSubjects}
              onChange={(e) => setFormSubjects(e.target.value)}
              required
            />
          </div>
          <button type="submit">Save Profile</button>
        </form>
      )}

      {}
      <div style={{ marginTop: '30px' }}>
        <h3>My Sessions</h3>
        {sessions.length > 0 ? (
          <ul>
            {sessions.map((session) => (
              <li key={session._id}>
                {new Date(session.date).toLocaleString()} - {session.duration} min
                <br />
                <strong>Client ID:</strong> {session.client?._id || session.client}
                <br />
                <strong>Client Name:</strong> {session.client?.name || 'N/A'}
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

export default TutorDashboard;
