import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const TutorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [weekday, setWeekday] = useState(1);
  const [slotsText, setSlotsText] = useState("09:00-12:00, 14:00-16:00");
  const [notifications, setNotifications] = useState([]);
  const [isMarking, setIsMarking] = useState(false);
  const [decisionModal, setDecisionModal] = useState({
    open: false,
    sessionId: null,
    action: null,
    message: "",
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formName, setFormName] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formSubjects, setFormSubjects] = useState("");

  const userId = localStorage.getItem("userId");
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch tutor profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/tutor/profile/${userId}`);
        setProfile(res.data);
      } catch (err) {
        setError("No tutor profile found. Please create one.");
        console.error("Error fetching profile:", err.response?.data?.msg);
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
          const res = await axios.get("/sessions", {
            params: { tutorId: profile._id },
          });
          setSessions(res.data);
        } catch (err) {
          setError("Failed to fetch sessions.");
          console.error("Error fetching sessions:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSessions();
  }, [profile]);

  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      if (profile?._id) {
        try {
          const res = await axios.get("/availability", {
            params: { tutorId: profile._id },
          });
          setAvailability(res.data);
        } catch (err) {
          console.error("Error fetching availability:", err);
        }
      }
    };
    fetchAvailability();
  }, [profile]);

  // Poll notifications every 10s for tutor as well
  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const res = await axios.get("/notifications");
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

  const colorByType = (type) => {
    switch (type) {
      case "session_request":
        return "#0d6efd"; // blue
      case "session_accepted":
        return "#28a745"; // green
      case "session_rejected":
        return "#dc3545"; // red
      case "session_cancelled":
        return "#6c757d"; // gray
      default:
        return "#0d6efd";
    }
  };

  const labelByType = (type) => {
    switch (type) {
      case "session_request":
        return "New Request";
      case "session_accepted":
        return "Accepted";
      case "session_rejected":
        return "Rejected";
      case "session_cancelled":
        return "Cancelled";
      default:
        return "Update";
    }
  };

  const markNotificationRead = async (id) => {
    try {
      setIsMarking(true);
      await axios.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      // ignore
    } finally {
      setIsMarking(false);
    }
  };

  // Handle profile creation or update
  const handleCreateOrUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const subjectsArray = formSubjects.split(",").map((s) => s.trim());

      const res = await axios.post("/tutor/profile", {
        name: formName,
        bio: formBio,
        subjects: subjectsArray,
      });
      setProfile(res.data);
      setShowProfileForm(false);
    } catch (err) {
      setError("Profile update failed. Please try again.");
      console.error("Profile create/update failed:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const parseTimeToMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      // slotsText: "09:00-12:00, 14:00-16:00"
      const slots = slotsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((range) => {
          const [start, end] = range.split("-").map((t) => t.trim());
          return {
            startMinutes: parseTimeToMinutes(start),
            endMinutes: parseTimeToMinutes(end),
          };
        })
        .filter((s) => s.endMinutes > s.startMinutes);
      await axios.post("/availability", { weekday: Number(weekday), slots });
      const res = await axios.get("/availability", {
        params: { tutorId: profile._id },
      });
      setAvailability(res.data);
      alert("Availability saved");
    } catch (err) {
      console.error("Failed saving availability", err);
      alert("Failed to save availability");
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await axios.post(`/sessions/${id}/accept`, {
        message: decisionModal.message || undefined,
      });
      setSessions((prev) => prev.map((s) => (s._id === id ? res.data : s)));
    } catch (e) {
      console.error(e);
      alert("Failed to accept");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axios.post(`/sessions/${id}/reject`, {
        message: decisionModal.message || undefined,
      });
      setSessions((prev) => prev.map((s) => (s._id === id ? res.data : s)));
    } catch (e) {
      console.error(e);
      alert("Failed to reject");
    }
  };

  const openDecision = (action, id) => {
    setDecisionModal({ open: true, sessionId: id, action, message: "" });
  };

  const submitDecision = async () => {
    const { action, sessionId } = decisionModal;
    if (!action || !sessionId) return;
    if (action === "accept") {
      await handleAccept(sessionId);
    } else {
      await handleReject(sessionId);
    }
    setDecisionModal({
      open: false,
      sessionId: null,
      action: null,
      message: "",
    });
  };

  const closeDecision = () =>
    setDecisionModal({
      open: false,
      sessionId: null,
      action: null,
      message: "",
    });

  // Show profile form with existing data
  const handleShowForm = () => {
    if (profile) {
      setFormName(profile.name || "");
      setFormBio(profile.bio || "");
      setFormSubjects(profile.subjects?.join(", ") || "");
    }
    setShowProfileForm(true);
  };
  // delete account function added
  const handleDeleteAccount = async () => {
    try {
      await axios.delete("/tutor/account");
      logout();
      navigate("/");
    } catch (err) {
      setError("Failed to delete account. Please try again.");
      console.error("Account deletion failed:", err.response?.data);
    }
  };

  return (
    <div
      style={{
        margin: "20px",
        backgroundColor: "#f0f8ff",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2>
        Welcome to Your Tutor Dashboard{profile ? `, ${profile.name}!` : "!"}
      </h2>

      {/* Display error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display loading state */}
      {isLoading && <p>Loading...</p>}

      {/* Profile Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>My Profile</h3>
        {profile ? (
          <>
            <p>
              <strong>Name:</strong> {profile.name}
            </p>
            <p>
              <strong>Bio:</strong> {profile.bio}
            </p>
            <p>
              <strong>Subjects:</strong> {profile.subjects?.join(", ")}
            </p>
            <button
              onClick={handleShowForm}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Update Profile
            </button>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </>
        ) : (
          <>
            <p>No tutor profile found. Let's create one!</p>
            <button
              onClick={handleShowForm}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Create Profile
            </button>
          </>
        )}
      </div>

      {/* Availability Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>My Availability</h3>
        <form
          onSubmit={handleSaveAvailability}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr auto",
            gap: "10px",
            alignItems: "end",
          }}
        >
          <div>
            <label>Weekday</label>
            <select
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
          <div>
            <label>Time Slots (e.g., 09:00-12:00, 14:00-16:00)</label>
            <input
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
            }}
          >
            Save
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          {availability.length ? (
            <ul style={{ paddingLeft: 16 }}>
              {availability.map((a) => {
                const days = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                return (
                  <li key={`${a._id}`}>
                    <strong>{days[a.weekday]}:</strong>{" "}
                    {a.slots
                      .map(
                        (s) =>
                          `${String(Math.floor(s.startMinutes / 60)).padStart(
                            2,
                            "0"
                          )}:${String(s.startMinutes % 60).padStart(
                            2,
                            "0"
                          )} - ${String(Math.floor(s.endMinutes / 60)).padStart(
                            2,
                            "0"
                          )}:${String(s.endMinutes % 60).padStart(2, "0")}`
                      )
                      .join(", ")}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No availability set yet.</p>
          )}
        </div>
      </div>

      {/* Notifications Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0 }}>Notifications</h3>
          <span style={{ fontSize: 13, color: "#6c757d" }}>
            {notifications.filter((n) => !n.read).length} unread
          </span>
        </div>
        {notifications.length ? (
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {notifications.map((n) => (
              <li
                key={n._id}
                style={{
                  border: "1px solid #eef1f4",
                  borderLeft: `4px solid ${colorByType(n.type)}`,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  background: n.read ? "#f8f9fb" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      background: colorByType(n.type),
                      padding: "4px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {labelByType(n.type)}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{n.message}</div>
                    <div style={{ fontSize: 12, color: "#6c757d" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n._id)}
                    disabled={isMarking}
                    style={{
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                    }}
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0 }}>No notifications yet.</p>
        )}
      </div>

      {/* Profile Form */}
      {showProfileForm && (
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>{profile ? "Update Profile" : "Create Profile"}</h3>
          <form onSubmit={handleCreateOrUpdateProfile}>
            <div style={{ marginBottom: "10px" }}>
              <label>Name: </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Bio: </label>
              <input
                type="text"
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Subjects (comma-separated): </label>
              <input
                type="text"
                value={formSubjects}
                onChange={(e) => setFormSubjects(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
              }}
            >
              {isLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      )}

      {/* Sessions Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h3>My Sessions</h3>
        {sessions.length > 0 ? (
          <ul style={{ listStyle: "none", padding: "0" }}>
            {sessions.map((session) => (
              <li
                key={session._id}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                <strong>Date:</strong>{" "}
                {new Date(session.date).toLocaleDateString()} <br />
                <strong>Time:</strong>{" "}
                {new Date(session.date).toLocaleTimeString()} <br />
                <strong>Duration:</strong> {session.duration} min <br />
                <strong>Client ID:</strong>{" "}
                {session.client?._id || session.client} <br />
                <strong>Client Name:</strong> {session.client?.name || "N/A"}{" "}
                <br />
                <strong>Status:</strong> {session.status || "pending"}
                {(session.status === "pending" || session.status == null) && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openDecision("accept", session._id)}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: 6,
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => openDecision("reject", session._id)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: 6,
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No sessions booked yet.</p>
        )}
      </div>

      {/* Decision Modal */}
      {decisionModal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              width: "min(520px, 92vw)",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid #eef1f4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: 18 }}>
                {decisionModal.action === "accept"
                  ? "Accept Session"
                  : "Reject Session"}
              </strong>
              <button
                onClick={closeDecision}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                Optional message to client
              </label>
              <textarea
                value={decisionModal.message}
                onChange={(e) =>
                  setDecisionModal((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={4}
                placeholder={
                  decisionModal.action === "accept"
                    ? "e.g., Looking forward to our session!"
                    : "e.g., I’m unavailable at that time, please pick another slot."
                }
                style={{
                  width: "100%",
                  border: "1px solid #d7dce3",
                  borderRadius: 10,
                  padding: 10,
                  background: "#fbfcfe",
                }}
              />
            </div>
            <div
              style={{
                padding: 16,
                borderTop: "1px solid #eef1f4",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={closeDecision}
                style={{
                  background: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                style={{
                  background:
                    decisionModal.action === "accept" ? "#28a745" : "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                {decisionModal.action === "accept" ? "Accept" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
