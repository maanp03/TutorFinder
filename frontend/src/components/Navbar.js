import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!auth.token) return;
    let t;
    const poll = async () => {
      try {
        const res = await fetch(
          "https://tutorfinder-dk85.onrender.com/api/notifications" /*http://localhost:5000/api/notifications*/,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        const data = await res.json();
        setItems(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      } catch (e) {
        // ignore
      } finally {
        t = setTimeout(poll, 12000);
      }
    };
    poll();
    return () => clearTimeout(t);
  }, [auth.token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {}

        <div
        className="navbar-logo-container"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
        >
          <img
          src="/images/tutorfinder.png"
          alt="TutorFinder Logo"
          className="navbar-logo"
          style={{
            height: "60px", 
            width: "auto"
            }}
          />
        </div>

        {}
        <div className="navbar-links">
          {auth.token ? (
            <>
              {}
              <span className="navbar-username">{auth.name}</span>

              {}
              {auth.role === "client" && (
                <button onClick={() => navigate("/client")}>
                  Client Dashboard
                </button>
              )}
              {auth.role === "tutor" && (
                <button onClick={() => navigate("/tutor")}>
                  Tutor Dashboard
                </button>
              )}
              {auth.role === "admin" && (
                <button onClick={() => navigate("/admin")}>
                  Admin Dashboard
                </button>
              )}

              {/* Bell */}
              <div style={{ position: "relative", marginRight: 8 }}>
                <button onClick={() => setOpen(!open)} title="Notifications">
                  514
                </button>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#dc3545",
                      color: "#fff",
                      borderRadius: 999,
                      fontSize: 10,
                      padding: "2px 6px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
                {open && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "110%",
                      width: 320,
                      background: "#fff",
                      border: "1px solid #e9ecef",
                      borderRadius: 12,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 10,
                        borderBottom: "1px solid #eef1f4",
                      }}
                    >
                      <strong>Notifications</strong>
                      <button
                        onClick={async () => {
                          try {
                            await fetch(
                              "https://tutorfinder-dk85.onrender.com/api/notifications/read-all" /*'http://localhost:5000/api/notifications/read-all'*/,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${auth.token}`,
                                },
                              }
                            );
                            setItems((prev) =>
                              prev.map((n) => ({ ...n, read: true }))
                            );
                            setUnreadCount(0);
                            setOpen(false);
                          } catch {}
                        }}
                        style={{
                          background: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 8px",
                        }}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div style={{ maxHeight: 360, overflowY: "auto" }}>
                      {items.length ? (
                        items.map((n) => (
                          <div
                            key={n._id}
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #f2f4f7",
                              background: n.read ? "#f8f9fb" : "#fff",
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#000' }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: 12, color: "#6c757d" }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 12, color: "#6c757d" }}>
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (

            <Link to="/login" className="login-button"
            style={{
              marginRight:"20px"
            }}>
              Login
            </Link>
            
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;