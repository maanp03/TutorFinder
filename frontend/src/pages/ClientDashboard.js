// import React, { useEffect, useState } from 'react';
// import axios from '../api/axiosInstance';
 
// // Bootstrap CDN
// const bootstrapLink = document.createElement("link");
// bootstrapLink.rel = "stylesheet";
// bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
// document.head.appendChild(bootstrapLink);
 
// const ClientDashboard = () => {
//   const [profile, setProfile] = useState(null);
//   const [tutors, setTutors] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [bookingWeekday, setBookingWeekday] = useState(1);
//   const [bookingTime, setBookingTime] = useState('09:00');
//   const [bookingDuration, setBookingDuration] = useState(60);
//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [formName, setFormName] = useState('');
//   const [formGrade, setFormGrade] = useState('');
//   const [error, setError] = useState('');
 
//   const userId = localStorage.getItem('userId');
 
//   useEffect(() => {
//     axios
//       .get(`/client/profile/${userId}`)
//       .then((res) => {
//         setProfile(res.data);
//       })
//       .catch(() => setError('Failed to fetch profile'));
 
//     axios
//       .get('/tutor/profile-all')
//       .then((res) => setTutors(res.data))
//       .catch(() => setError('Failed to fetch tutors'));
//   }, [userId]);
 
//   useEffect(() => {
//     if (profile?._id) {
//       axios
//         .get('/sessions', { params: { clientId: profile._id } })
//         .then((res) => {
//           setSessions(res.data);
//         })
//         .catch(() => setError('Failed to fetch sessions'));
//     }
//   }, [profile]);

//   // Poll notifications every 10s
//   useEffect(() => {
//     let timer;
//     const poll = async () => {
//       try {
//         const res = await axios.get('/notifications');
//         setNotifications(res.data);
//       } catch (e) {
//         // ignore
//       } finally {
//         timer = setTimeout(poll, 10000);
//       }
//     };
//     poll();
//     return () => clearTimeout(timer);
//   }, []);
 
//   const handleCreateOrUpdateProfile = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post('/client/profile', {
//         name: formName,
//         grade: formGrade,
//       });
//       setProfile(res.data);
//       setShowProfileForm(false);
//     } catch {
//       setError('Failed to update profile');
//     }
//   };
 
//   const handleShowProfileForm = () => {
//     if (profile) {
//       setFormName(profile.name);
//       setFormGrade(profile.grade);
//     }
//     setShowProfileForm(true);
//   };
 
//   const nextDateForWeekday = (weekday, timeHHMM) => {
//     const now = new Date();
//     const [hh, mm] = timeHHMM.split(':').map(Number);
//     const result = new Date(now);
//     const currentDow = now.getDay();
//     let delta = (weekday - currentDow + 7) % 7;
//     if (delta === 0 && (now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm))) {
//       delta = 7; // move to next week if time already passed today
//     }
//     result.setDate(now.getDate() + delta);
//     result.setHours(hh, mm, 0, 0);
//     return result.toISOString();
//   };

//   const handleBookSession = async (tutorId) => {
//     try {
//       const iso = nextDateForWeekday(Number(bookingWeekday), bookingTime);
//       const res = await axios.post('/sessions', {
//         tutorId,
//         clientId: profile._id,
//         date: iso,
//         duration: Number(bookingDuration),
//       });
//       setSessions((prev) => [...prev, res.data]);
//     } catch {
//       setError('Failed to book session');
//     }
//   };

//   const handleCancel = async (id) => {
//     try {
//       const res = await axios.post(`/sessions/${id}/cancel`);
//       setSessions(prev => prev.map(s => (s._id === id ? res.data : s)));
//     } catch (e) {
//       setError('Failed to cancel session');
//     }
//   };
 
//   return (
//     <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light py-5 px-3">
//       <h2 className="mb-4 fw-bold text-center">Client Dashboard</h2>
 
//       {error && (
//         <div className="alert alert-danger w-100 text-center" role="alert">
//           {error}
//         </div>
//       )}
 
//       {/* Profile Section */}
//       <div className="w-100" style={{ maxWidth: '1100px' }}>
//         <div className="card shadow mb-5">
//           <div className="card-header bg-dark text-white text-center fw-semibold">
//             My Profile
//           </div>
//           <div className="card-body">
//             {profile ? (
//               <div>
//                 <p><strong>Name:</strong> {profile.name}</p>
//                 <p><strong>Grade:</strong> {profile.grade}</p>
//                 <button
//                   className="btn btn-primary"
//                   onClick={handleShowProfileForm}
//                 >
//                   Update Profile
//                 </button>
//               </div>
//             ) : (
//               <div>
//                 <p>No profile found.</p>
//                 <button
//                   className="btn btn-primary"
//                   onClick={handleShowProfileForm}
//                 >
//                   Create Profile
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
 
//         {/* Profile Form */}
//         {showProfileForm && (
//           <div className="card shadow mb-5">
//             <div className="card-header bg-secondary text-white text-center fw-semibold">
//               {profile ? 'Update Profile' : 'Create Profile'}
//             </div>
//             <div className="card-body">
//               <form onSubmit={handleCreateOrUpdateProfile}>
//                 <div className="mb-3">
//                   <label className="form-label">Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={formName}
//                     onChange={(e) => setFormName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Grade</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={formGrade}
//                     onChange={(e) => setFormGrade(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <button type="submit" className="btn btn-success">
//                   Save Profile
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}
 
//         {/* Quick Booking Controls */}
//         <div className="card shadow mb-4">
//           <div className="card-header bg-dark text-white text-center fw-semibold">
//             Quick Booking Controls
//           </div>
//           <div className="card-body row g-3 align-items-end">
//             <div className="col-12 col-md-4">
//               <label className="form-label">Weekday</label>
//               <select className="form-select" value={bookingWeekday} onChange={(e) => setBookingWeekday(e.target.value)}>
//                 <option value={0}>Sunday</option>
//                 <option value={1}>Monday</option>
//                 <option value={2}>Tuesday</option>
//                 <option value={3}>Wednesday</option>
//                 <option value={4}>Thursday</option>
//                 <option value={5}>Friday</option>
//                 <option value={6}>Saturday</option>
//               </select>
//             </div>
//             <div className="col-6 col-md-4">
//               <label className="form-label">Time</label>
//               <input className="form-control" type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
//             </div>
//             <div className="col-6 col-md-4">
//               <label className="form-label">Duration (min)</label>
//               <input className="form-control" type="number" min="15" step="15" value={bookingDuration} onChange={(e) => setBookingDuration(e.target.value)} />
//             </div>
//             <div className="col-12">
//               <small className="text-muted">Tip: Choose a weekday/time that matches the tutor's availability.</small>
//             </div>
//           </div>
//         </div>

//         {/* Tutors Section */}
//         <div className="card shadow mb-5">
//           <div className="card-header bg-dark text-white text-center fw-semibold">
//             Available Tutors
//           </div>
//           <div className="card-body p-0">
//             <table className="table table-hover mb-0 text-center">
//               <thead className="table-light">
//                 <tr>
//                   <th>Name</th>
//                   <th>Subjects</th>
//                   <th>Bio</th>
//                   <th>Action</th>
//           <th>View Tutor</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tutors.length > 0 ? tutors.map((tutor) => (
//                   <tr key={tutor._id}>
//                     <td>{tutor.name}</td>
//                     <td>{tutor.subjects.join(', ')}</td>
//                     <td>{tutor.bio}</td>
//                     <td>
//                       <button
//                         className="btn btn-sm btn-success"
//                         onClick={() => handleBookSession(tutor._id)}
//                       >
//                         Book Session
//                       </button>
//                     </td>

//                              <td>
//                       <button
//                         className="btn btn-sm btn-success"
                
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="5" className="text-center">No tutors available.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
 
//         {/* Sessions Section */}
//         <div className="card shadow">
//           <div className="card-header bg-secondary text-white text-center fw-semibold">
//             My Sessions
//           </div>
//           <div className="card-body p-0">
//             <table className="table table-striped mb-0 text-center">
//               <thead className="table-light">
//                 <tr>
//                   <th>Date</th>
//                   <th>Duration</th>
//                   <th>Tutor Name</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sessions.length > 0 ? sessions.map((session) => (
//                   <tr key={session._id}>
//                     <td>{new Date(session.date).toLocaleString()}</td>
//                     <td>{session.duration} min</td>
//                     <td>{session.tutor?.name || 'N/A'}</td>
//                     <td>{session.status || 'pending'}</td>
//                     <td>
//                       {session.status === 'pending' && (
//                         <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(session._id)}>Cancel</button>
//                       )}
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="3" className="text-center">No sessions booked yet.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Notifications Section */}
//         <div className="card shadow mt-4">
//           <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center fw-semibold">
//             <span>Notifications</span>
//             <small className="text-light-50">{notifications.filter(n => !n.read).length} unread</small>
//           </div>
//           <div className="card-body">
//             {notifications.length ? (
//               <ul className="list-unstyled mb-0">
//                 {notifications.map(n => (
//                   <li key={n._id} className="d-flex justify-content-between align-items-start p-2 mb-2 border rounded" style={{borderLeft: `4px solid ${n.type==='session_accepted'?'#28a745':n.type==='session_rejected'?'#dc3545':n.type==='session_cancelled'?'#6c757d':'#0d6efd'}`}}>
//                     <div>
//                       <span className="badge me-2" style={{backgroundColor: n.type==='session_accepted'?'#28a745':n.type==='session_rejected'?'#dc3545':n.type==='session_cancelled'?'#6c757d':'#0d6efd'}}>
//                         {n.type==='session_accepted'?'Accepted':n.type==='session_rejected'?'Rejected':n.type==='session_cancelled'?'Cancelled':'New Request'}
//                       </span>
//                       <strong>{n.message}</strong>
//                       <div className="text-muted" style={{fontSize: 12}}>{new Date(n.createdAt).toLocaleString()}</div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="mb-0">No notifications yet.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
 
// export default ClientDashboard;

import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
 
// Bootstrap CDN
const bootstrapLink = document.createElement("link");
bootstrapLink.rel = "stylesheet";
bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
document.head.appendChild(bootstrapLink);
 
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
 
  const userId = localStorage.getItem('userId');
  const { logout } = useAuth();
  const navigate = useNavigate();
 
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

  // Poll notifications every 10s
  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const res = await axios.get('/notifications');
        setNotifications(res.data);
      } catch (e) {
        // ignore
      } finally {
        timer = setTimeout(poll, 10000);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, []);
 
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
 
  const nextDateForWeekday = (weekday, timeHHMM) => {
    const now = new Date();
    const [hh, mm] = timeHHMM.split(':').map(Number);
    const result = new Date(now);
    const currentDow = now.getDay();
    let delta = (weekday - currentDow + 7) % 7;
    if (delta === 0 && (now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm))) {
      delta = 7; // move to next week if time already passed today
    }
    result.setDate(now.getDate() + delta);
    result.setHours(hh, mm, 0, 0);
    return result.toISOString();
  };

  const handleBookSession = async (tutorId) => {
    try {
      const iso = nextDateForWeekday(Number(bookingWeekday), bookingTime);
      const res = await axios.post('/sessions', {
        tutorId,
        clientId: profile._id,
        date: iso,
        duration: Number(bookingDuration),
      });
      setSessions((prev) => [...prev, res.data]);
    } catch {
      setError('Failed to book session');
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await axios.post(`/sessions/${id}/cancel`);
      setSessions(prev => prev.map(s => (s._id === id ? res.data : s)));
    } catch (e) {
      setError('Failed to cancel session');
    }
  };

  // Delete Account Function Added
  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/client/account');
      logout();
      navigate('/');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      console.error('Account deletion failed:', err.response?.data);
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
                <div>
                  <button
                    className="btn btn-primary me-2"
                    onClick={handleShowProfileForm}
                  >
                    Update Profile
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </button>
                </div>
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
 
        {/* Quick Booking Controls */}
        <div className="card shadow mb-4">
          <div className="card-header bg-dark text-white text-center fw-semibold">
            Quick Booking Controls
          </div>
          <div className="card-body row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label">Weekday</label>
              <select className="form-select" value={bookingWeekday} onChange={(e) => setBookingWeekday(e.target.value)}>
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">Time</label>
              <input className="form-control" type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">Duration (min)</label>
              <input className="form-control" type="number" min="15" step="15" value={bookingDuration} onChange={(e) => setBookingDuration(e.target.value)} />
            </div>
            <div className="col-12">
              <small className="text-muted">Tip: Choose a weekday/time that matches the tutor's availability.</small>
            </div>
          </div>
        </div>

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
                  <th>View Tutor</th>
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

                    <td>
                      <button className="btn btn-sm btn-success">
                        View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center">No tutors available.</td>
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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? sessions.map((session) => (
                  <tr key={session._id}>
                    <td>{new Date(session.date).toLocaleString()}</td>
                    <td>{session.duration} min</td>
                    <td>{session.tutor?.name || 'N/A'}</td>
                    <td>{session.status || 'pending'}</td>
                    <td>
                      {session.status === 'pending' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(session._id)}>Cancel</button>
                      )}
                    </td>
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

        {/* Notifications Section */}
        <div className="card shadow mt-4">
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center fw-semibold">
            <span>Notifications</span>
            <small className="text-light-50">{notifications.filter(n => !n.read).length} unread</small>
          </div>
          <div className="card-body">
            {notifications.length ? (
              <ul className="list-unstyled mb-0">
                {notifications.map(n => (
                  <li key={n._id} className="d-flex justify-content-between align-items-start p-2 mb-2 border rounded" style={{borderLeft: `4px solid ${n.type==='session_accepted'?'#28a745':n.type==='session_rejected'?'#dc3545':n.type==='session_cancelled'?'#6c757d':'#0d6efd'}`}}>
                    <div>
                      <span className="badge me-2" style={{backgroundColor: n.type==='session_accepted'?'#28a745':n.type==='session_rejected'?'#dc3545':n.type==='session_cancelled'?'#6c757d':'#0d6efd'}}>
                        {n.type==='session_accepted'?'Accepted':n.type==='session_rejected'?'Rejected':n.type==='session_cancelled'?'Cancelled':'New Request'}
                      </span>
                      <strong>{n.message}</strong>
                      <div className="text-muted" style={{fontSize: 12}}>{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-0">No notifications yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ClientDashboard;

