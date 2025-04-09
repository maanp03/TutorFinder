import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const TutorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formName, setFormName] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formSubjects, setFormSubjects] = useState('');

  const userId = localStorage.getItem('userId');

  // Fetch tutor profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/tutor/profile/${userId}`);
        setProfile(res.data);
      } catch (err) {
        setError('No tutor profile found. Please create one.');
        console.error('Error fetching profile:', err.response?.data?.msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Fetch sessions if profile exists
  useEffect(() => {
    const fetchSessions = async () => {
      if (profile?._id) {
        setIsLoading(true);
        try {
          const res = await axios.get('/sessions', { params: { tutorId: profile._id } });
          setSessions(res.data);
        } catch (err) {
          setError('Failed to fetch sessions.');
          console.error('Error fetching sessions:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSessions();
  }, [profile]);

  // Handle profile creation or update
  const handleCreateOrUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
      setError('Profile update failed. Please try again.');
      console.error('Profile create/update failed:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Show profile form with existing data
  const handleShowForm = () => {
    if (profile) {
      setFormName(profile.name || '');
      setFormBio(profile.bio || '');
      setFormSubjects(profile.subjects?.join(', ') || '');
    }
    setShowProfileForm(true);
  };

  return (
    <div style={{ margin: '20px', backgroundColor: '#f0f8ff', minHeight: '100vh', padding: '20px' }}>
      <h2>Welcome to Your Tutor Dashboard{profile ? `, ${profile.name}!` : '!'}</h2>

      {/* Display error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display loading state */}
      {isLoading && <p>Loading...</p>}

      {/* Profile Section */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>My Profile</h3>
        {profile ? (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
            <p><strong>Subjects:</strong> {profile.subjects?.join(', ')}</p>
            <button onClick={handleShowForm} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
              Update Profile
            </button>
          </>
        ) : (
          <>
            <p>No tutor profile found. Let's create one!</p>
            <button onClick={handleShowForm} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
              Create Profile
            </button>
          </>
        )}
      </div>

      {/* Profile Form */}
      {showProfileForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>{profile ? 'Update Profile' : 'Create Profile'}</h3>
          <form onSubmit={handleCreateOrUpdateProfile}>
            <div style={{ marginBottom: '10px' }}>
              <label>Name: </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Bio: </label>
              <input
                type="text"
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Subjects (comma-separated): </label>
              <input
                type="text"
                value={formSubjects}
                onChange={(e) => setFormSubjects(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Sessions Section */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3>My Sessions</h3>
        {sessions.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {sessions.map((session) => (
              <li key={session._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <strong>Date:</strong> {new Date(session.date).toLocaleDateString()} <br />
                <strong>Time:</strong> {new Date(session.date).toLocaleTimeString()} <br />
                <strong>Duration:</strong> {session.duration} min <br />
                <strong>Client ID:</strong> {session.client?._id || session.client} <br />
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
