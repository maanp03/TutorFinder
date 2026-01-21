import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/Chatbot";
import { FaUser, FaCalendarAlt, FaBell, FaEdit, FaTrash, FaClock, FaCheck, FaTimes, FaSave, FaBook } from 'react-icons/fa';
import './Dashboard.css';

const TutorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [weekday, setWeekday] = useState(1);
  const [slotsText, setSlotsText] = useState("09:00-12:00, 14:00-16:00");
  const [notifications, setNotifications] = useState([]);
  const [isMarking, setIsMarking] = useState(false);
  const [decisionModal, setDecisionModal] = useState({ open: false, sessionId: null, action: null, message: "" });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formName, setFormName] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formSubjects, setFormSubjects] = useState("");
  const [filter, setFilter] = useState("All");

  const userId = localStorage.getItem("userId");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const applyFilter = (btnText) => {
    setSessions(allSessions.filter((s) => btnText === "All" ? true : s.status === btnText.toLowerCase()));
  };

  useEffect(() => {
    setIsLoading(true);
    axios.get(`/tutor/profile/${userId}`)
      .then((res) => setProfile(res.data))
      .catch(() => setError("No tutor profile found. Please create one."))
      .finally(() => setIsLoading(false));
  }, [userId]);

  useEffect(() => {
    if (profile?._id) {
      setIsLoading(true);
      axios.get("/sessions", { params: { tutorId: profile._id } })
        .then((res) => { setSessions(res.data); setAllSessions(res.data); })
        .catch(() => setError("Failed to fetch sessions."))
        .finally(() => setIsLoading(false));
    }
  }, [profile]);

  useEffect(() => {
    if (profile?._id) {
      axios.get("/availability", { params: { tutorId: profile._id } })
        .then((res) => setAvailability(res.data))
        .catch(() => {});
    }
  }, [profile]);

  useEffect(() => {
    let timer;
    const poll = async () => {
      try { const res = await axios.get("/notifications"); setNotifications(res.data); }
      catch (e) {}
      finally { timer = setTimeout(poll, 10000); }
    };
    poll();
    return () => clearTimeout(timer);
  }, []);

  const colorByType = (type) => {
    const map = { session_request: "#60a5fa", session_accepted: "#4ade80", session_rejected: "#f87171", session_cancelled: "#9ca3af" };
    return map[type] || "#60a5fa";
  };

  const labelByType = (type) => {
    const map = { session_request: "New Request", session_accepted: "Accepted", session_rejected: "Rejected", session_cancelled: "Cancelled" };
    return map[type] || "Update";
  };

  const getNotificationType = (type) => {
    if (type === 'session_accepted') return 'type-accepted';
    if (type === 'session_rejected') return 'type-rejected';
    if (type === 'session_cancelled') return 'type-cancelled';
    return 'type-request';
  };

  const markNotificationRead = async (id) => {
    try { setIsMarking(true); await axios.post(`/notifications/${id}/read`); setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n))); }
    catch {}
    finally { setIsMarking(false); }
  };

  const handleCreateOrUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const subjectsArray = formSubjects.split(",").map((s) => s.trim());
      const res = await axios.post("/tutor/profile", { name: formName, bio: formBio, subjects: subjectsArray });
      setProfile(res.data);
      setShowProfileForm(false);
    } catch { setError("Profile update failed."); }
    finally { setIsLoading(false); }
  };

  const parseTimeToMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + (m || 0); };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      const slots = slotsText.split(",").map((s) => s.trim()).filter(Boolean).map((range) => {
        const [start, end] = range.split("-").map((t) => t.trim());
        return { startMinutes: parseTimeToMinutes(start), endMinutes: parseTimeToMinutes(end) };
      }).filter((s) => s.endMinutes > s.startMinutes);
      await axios.post("/availability", { weekday: Number(weekday), slots });
      const res = await axios.get("/availability", { params: { tutorId: profile._id } });
      setAvailability(res.data);
      alert("Availability saved!");
    } catch { alert("Failed to save availability"); }
  };

  const handleAccept = async (id) => { const res = await axios.post(`/sessions/${id}/accept`, { message: decisionModal.message || undefined }); setSessions((prev) => prev.map((s) => (s._id === id ? res.data : s))); };
  const handleReject = async (id) => { const res = await axios.post(`/sessions/${id}/reject`, { message: decisionModal.message || undefined }); setSessions((prev) => prev.map((s) => (s._id === id ? res.data : s))); };
  const handleCancelSession = async (id) => { const res = await axios.post(`/sessions/${id}/cancel`, { reason: decisionModal.message || undefined }); setSessions((prev) => prev.map((s) => (s._id === id ? res.data : s))); };

  const openDecision = (action, id) => setDecisionModal({ open: true, sessionId: id, action, message: "" });

  const submitDecision = async () => {
    const { action, sessionId } = decisionModal;
    if (!action || !sessionId) return;
    try {
      let nextStatus = null;
      if (action === "accept") { await handleAccept(sessionId); nextStatus = "accepted"; }
      else if (action === "reject") { await handleReject(sessionId); nextStatus = "rejected"; }
      else if (action === "cancel") { await handleCancelSession(sessionId); nextStatus = "cancelled"; }
      if (nextStatus) {
        setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, status: nextStatus } : s)));
        setAllSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, status: nextStatus } : s)));
      }
      setDecisionModal({ open: false, sessionId: null, action: null, message: "" });
    } catch { console.error("Error updating session"); }
  };

  const closeDecision = () => setDecisionModal({ open: false, sessionId: null, action: null, message: "" });

  const handleShowForm = () => {
    if (profile) { setFormName(profile.name || ""); setFormBio(profile.bio || ""); setFormSubjects(profile.subjects?.join(", ") || ""); }
    setShowProfileForm(true);
  };

  const handleDeleteAccount = async () => {
    try { await axios.delete("/tutor/account"); logout(); navigate("/"); }
    catch { setError("Failed to delete account."); }
  };

  const getStatusBadge = (status) => {
    const map = { accepted: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger', cancelled: 'badge-secondary' };
    return map[status] || 'badge-info';
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="dashboard-container" data-testid="tutor-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome, <span>{profile?.name || 'Tutor'}</span></h1>
        <p className="dashboard-subtitle">Manage your availability and tutoring sessions</p>
      </div>

      {error && <div className="error-alert" data-testid="error-alert"><FaTimes /> {error}</div>}
      {isLoading && <div className="loading"><div className="loading-spinner"></div> Loading...</div>}

      {/* Profile Section */}
      <div className="glass-card" data-testid="profile-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaUser /></div> My Profile</h3>
        </div>
        <div className="card-body">
          {profile ? (
            <>
              <div className="profile-info">
                <div className="profile-item"><div className="profile-label">Full Name</div><div className="profile-value">{profile.name}</div></div>
                <div className="profile-item"><div className="profile-label">Bio</div><div className="profile-value" style={{ fontSize: 14 }}>{profile.bio}</div></div>
                <div className="profile-item">
                  <div className="profile-label">Subjects</div>
                  <div style={{ marginTop: 6 }}>{profile.subjects?.map((s, i) => <span key={i} className="subject-badge">{s}</span>)}</div>
                </div>
              </div>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={handleShowForm} data-testid="update-profile-btn"><FaEdit /> Update Profile</button>
                <button className="btn btn-danger" onClick={handleDeleteAccount} data-testid="delete-account-btn"><FaTrash /> Delete Account</button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">No tutor profile found. Create one to get started!</p>
              <button className="btn btn-primary" onClick={handleShowForm} data-testid="create-profile-btn">Create Profile</button>
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
                <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" value={formName} onChange={(e) => setFormName(e.target.value)} required data-testid="profile-name-input" /></div>
                <div className="form-group" style={{ marginTop: 16 }}><label className="form-label">Bio</label><input type="text" className="form-input" value={formBio} onChange={(e) => setFormBio(e.target.value)} required data-testid="profile-bio-input" /></div>
                <div className="form-group" style={{ marginTop: 16 }}><label className="form-label">Subjects (comma-separated)</label><input type="text" className="form-input" value={formSubjects} onChange={(e) => setFormSubjects(e.target.value)} required data-testid="profile-subjects-input" placeholder="Math, Science, English" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" data-testid="save-profile-btn">{isLoading ? "Saving..." : "Save Profile"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Section */}
      <div className="glass-card" data-testid="availability-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaClock /></div> My Availability</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSaveAvailability}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weekday</label>
                <select className="form-select" value={weekday} onChange={(e) => setWeekday(e.target.value)} data-testid="availability-weekday">
                  {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Time Slots</label>
                <input className="form-input" value={slotsText} onChange={(e) => setSlotsText(e.target.value)} placeholder="09:00-12:00, 14:00-16:00" data-testid="availability-slots" />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" data-testid="save-availability-btn"><FaSave /> Save</button>
              </div>
            </div>
          </form>
          {availability.length > 0 ? (
            <div className="availability-list" style={{ marginTop: 20 }}>
              {availability.map((a, idx) => (
                <div key={idx} className="availability-item">
                  <span className="availability-day">{days[a.weekday]}</span>
                  <div className="availability-slots">
                    {a.slots.map((s, si) => (
                      <span key={si} className="time-slot">
                        {String(Math.floor(s.startMinutes / 60)).padStart(2, "0")}:{String(s.startMinutes % 60).padStart(2, "0")} - 
                        {String(Math.floor(s.endMinutes / 60)).padStart(2, "0")}:{String(s.endMinutes % 60).padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>No availability set yet.</p>
          )}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="glass-card" data-testid="notifications-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaBell /></div> Notifications</h3>
          <span className="badge badge-info">{notifications.filter(n => !n.read).length} unread</span>
        </div>
        <div className="card-body">
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map(n => (
                <div key={n._id} className={`notification-item ${getNotificationType(n.type)}`} style={{ opacity: n.read ? 0.7 : 1 }}>
                  <span className="badge" style={{ background: colorByType(n.type), color: '#fff', marginRight: 12 }}>{labelByType(n.type)}</span>
                  <div className="notification-content" style={{ flex: 1 }}>
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && (
                    <button className="btn btn-secondary btn-sm" onClick={() => markNotificationRead(n._id)} disabled={isMarking}>
                      <FaCheck /> Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p className="empty-state-text">No notifications yet.</p></div>
          )}
        </div>
      </div>

      {/* Sessions Section */}
      <div className="glass-card" data-testid="sessions-section">
        <div className="card-header">
          <h3><div className="card-header-icon"><FaBook /></div> My Sessions</h3>
        </div>
        <div className="card-body">
          <div className="filter-bar">
            {["All", "Accepted", "Rejected", "Pending"].map((btn) => (
              <button key={btn} className={`filter-btn ${filter === btn ? 'active' : ''}`} onClick={() => { setFilter(btn); applyFilter(btn); }} data-testid={`filter-${btn.toLowerCase()}`}>
                {btn}
              </button>
            ))}
          </div>
          {sessions.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr key={session._id}>
                      <td>{index + 1}</td>
                      <td>{new Date(session.date).toLocaleDateString()}</td>
                      <td>{new Date(session.date).toLocaleTimeString()}</td>
                      <td>{session.duration} min</td>
                      <td>{session.client?.name || "N/A"}</td>
                      <td><span className={`badge ${getStatusBadge(session.status)}`}>{session.status || "pending"}</span></td>
                      <td>
                        {(session.status === "pending" || session.status == null) && (
                          <div className="btn-group">
                            <button className="btn btn-success btn-sm" onClick={() => openDecision("accept", session._id)} data-testid={`accept-${session._id}`}><FaCheck /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => openDecision("reject", session._id)} data-testid={`reject-${session._id}`}><FaTimes /></button>
                          </div>
                        )}
                        {session.status === "accepted" && (
                          <button className="btn btn-outline btn-sm" onClick={() => openDecision("cancel", session._id)} data-testid={`cancel-${session._id}`}><FaTimes /> Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon"><FaCalendarAlt /></div><p className="empty-state-text">No sessions booked yet.</p></div>
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {decisionModal.open && (
        <div className="modal-overlay" onClick={closeDecision}>
          <div className="modal-content" onClick={e => e.stopPropagation()} data-testid="decision-modal">
            <div className="modal-header">
              <h3 className="modal-title">{decisionModal.action === "accept" ? "Accept Session" : decisionModal.action === "reject" ? "Reject Session" : "Cancel Session"}</h3>
              <button className="modal-close" onClick={closeDecision}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Optional message to client</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={decisionModal.message}
                  onChange={(e) => setDecisionModal((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder={decisionModal.action === "accept" ? "e.g., Looking forward to our session!" : decisionModal.action === "reject" ? "e.g., I'm unavailable at that time." : "Optional note for cancellation."}
                  data-testid="decision-message"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDecision}>Cancel</button>
              <button className={`btn ${decisionModal.action === "accept" ? "btn-success" : "btn-danger"}`} onClick={submitDecision} data-testid="confirm-decision-btn">
                {decisionModal.action === "accept" ? <><FaCheck /> Accept</> : decisionModal.action === "reject" ? <><FaTimes /> Reject</> : <><FaTimes /> Confirm Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default TutorDashboard;
