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
