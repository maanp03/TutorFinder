import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaBell, FaCheck, FaSignOutAlt, FaUser, FaChalkboardTeacher, FaUserShield, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth.token) return;
    let t;
    const poll = async () => {
      try {
        const res = await fetch(
          "https://tutorfinder-dk85.onrender.com/api/notifications",
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        const data = await res.json();
        setItems(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      } catch (e) {}
      finally { t = setTimeout(poll, 12000); }
    };
    poll();
    return () => clearTimeout(t);
  }, [auth.token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const markAllRead = async () => {
    try {
      await fetch("https://tutorfinder-dk85.onrender.com/api/notifications/read-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setOpen(false);
    } catch {}
  };

  const getDashboardIcon = () => {
    if (auth.role === "client") return <FaUser />;
    if (auth.role === "tutor") return <FaChalkboardTeacher />;
    if (auth.role === "admin") return <FaUserShield />;
    return null;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate("/")} data-testid="navbar-logo">
          TutorFinder
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-center">
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
          <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}>Pricing</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Mobile Nav Links */}
          <div className="mobile-nav-links">
            <Link to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>

          {auth.token ? (
            <>
              <span className="navbar-username" data-testid="navbar-username">{auth.name}</span>

              {auth.role && (
                <button onClick={() => { navigate(`/${auth.role}`); setMobileMenuOpen(false); }} data-testid="dashboard-btn">
                  {getDashboardIcon()}
                  <span>Dashboard</span>
                </button>
              )}

              {/* Bell Notification */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setOpen(!open)} title="Notifications" data-testid="notification-btn" style={{ position: 'relative' }}>
                  <FaBell />
                  {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: -4, right: -4, background: "#dc3545", color: "#fff", borderRadius: 999, fontSize: 10, padding: "2px 6px", fontWeight: 700, minWidth: 18, textAlign: 'center' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {open && (
                  <div className="notification-dropdown" data-testid="notification-dropdown">
                    <div className="notification-header">
                      <strong>Notifications</strong>
                      <button onClick={markAllRead} style={{ background: "rgba(74, 124, 89, 0.3)", border: "1px solid rgba(74, 124, 89, 0.5)", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaCheck size={10} />
                        Mark all read
                      </button>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {items.length ? items.map((n) => (
                        <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                          <div className="notification-message">{n.message}</div>
                          <div className="notification-time">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      )) : (
                        <div style={{ padding: 16, color: "rgba(255,255,255,0.5)", textAlign: 'center' }}>No notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="logout-button" onClick={handleLogout} data-testid="logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn login-btn" onClick={() => setMobileMenuOpen(false)} data-testid="login-btn">
                Sign In
              </Link>
              <Link to="/register" className="nav-btn signup-btn" onClick={() => setMobileMenuOpen(false)} data-testid="signup-btn">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
