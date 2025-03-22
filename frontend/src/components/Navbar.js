import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {}
        <div className="navbar-logo-container">
          <div className="navbar-logo" onClick={() => navigate("/")}>
            TutorFinder
          </div>
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

              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
