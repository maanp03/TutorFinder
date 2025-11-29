import React from "react";
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import "./Footer.css";

//FOOTER FOR LANDING PAGE

const Footer = () => {
  return (
    <footer className="footer">
      <div className="f-container">

        {/* ABOUT TUTORFINDER */}
        <div className="footer-section">
          <h4 className="footer-title">TutorFinder</h4>
          <p className="footer-text">
            Personalized tutoring made simple. Connect
            and achieve academic success.
          </p>
          <p className="footer-mail">mail@tutorfinder.com</p>

    {/* SOCIALS ICONS - APPS */}
    <div className="f-socials">
        <FacebookIcon className="app-icon" />
        <InstagramIcon className="app-icon" />
        <LinkedInIcon className="app-icon" />
        <XIcon className="app-icon" />
    </div>

        </div>

        {/* TUTORFINDER LINKS */}
        <div className="info-section">
          <h4 className="footer-subtitle">Useful Links</h4>
          <ul>
            <li>Connect with Tutors</li>
            <li>Become a Tutor with us</li>
            <li>FAQ</li>
          </ul>
        </div>

        {/* ABOUT */}
        <div className="info-section">
          <h4 className="footer-subtitle">About Us</h4>
          <ul>
            <li>Our Mission</li>
            <li>How to Find a Tutor </li>
            <li>Testimonials</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* SUBSCRIBE */}
        <div className="info-section">
          <h4 className="footer-subtitle">Subscribe</h4>
          <p className="footer-text">Stay updated with TutorFinder.</p>

        {/* SUBSCRIBTION BOX */}
          <div className="subscribtion-b">
            <input 
              type="email"
              placeholder="Enter your email"
              className="subscribe-input"
            />
            <button className="subscribe-btn">Subscribe</button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} TutorFinder
      </div>
    </footer>
  );
};

export default Footer;