import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck, FaStar, FaShieldAlt, FaClock, FaArrowRight, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Perfect <span>Tutor</span> Today
          </h1>
          <p className="hero-subtitle">
            Connect with experienced tutors for personalized one-on-one sessions. 
            Excel in your studies with TutorFinder's curated network of qualified educators.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/register')} data-testid="get-started-btn">
              Get Started <FaArrowRight />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Expert Tutors</span>
            </div>
            <div className="stat">
              <span className="stat-number">2,000+</span>
              <span className="stat-label">Happy Students</span>
            </div>
            <div className="stat">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Sessions Completed</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1758685733907-42e9651721f5?auto=format&fit=crop&w=800&q=80" alt="Tutoring Session" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose <span>TutorFinder</span>?</h2>
          <p>We make finding the right tutor simple and effective</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FaChalkboardTeacher /></div>
            <h3>Qualified Tutors</h3>
            <p>All tutors are verified and experienced in their subjects, ensuring quality education.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaCalendarCheck /></div>
            <h3>Easy Booking</h3>
            <p>Book sessions instantly based on tutor availability. No hassle, no waiting.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaClock /></div>
            <h3>Flexible Scheduling</h3>
            <p>Choose times that work for you. Morning, afternoon, or evening sessions available.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaShieldAlt /></div>
            <h3>Safe & Secure</h3>
            <p>Your data and payments are protected with industry-standard security measures.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaStar /></div>
            <h3>Personalized Learning</h3>
            <p>One-on-one sessions tailored to your learning pace and academic goals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaUserGraduate /></div>
            <h3>All Subjects</h3>
            <p>From Math to Science, English to History - find tutors for any subject.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It <span>Works</span></h2>
          <p>Get started in just three simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up as a student or tutor in less than a minute</p>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Find a Tutor</h3>
            <p>Browse tutors by subject, availability, and reviews</p>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Book & Learn</h3>
            <p>Schedule sessions and start your learning journey</p>
          </div>
        </div>
        <button className="btn-primary center-btn" onClick={() => navigate('/register')} data-testid="cta-btn">
          Start Learning Today <FaArrowRight />
        </button>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our <span>Students</span> Say</h2>
          <p>Real stories from real students</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p>"TutorFinder helped me improve my math grades from C to A in just two months. The tutors are amazing!"</p>
            <div className="testimonial-author">
              <strong>Sarah M.</strong>
              <span>High School Student</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p>"As a tutor, this platform makes it easy to manage my schedule and connect with students who need help."</p>
            <div className="testimonial-author">
              <strong>Dr. James K.</strong>
              <span>Physics Tutor</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p>"The personalized attention my son gets has made a huge difference. Highly recommend TutorFinder!"</p>
            <div className="testimonial-author">
              <strong>Lisa P.</strong>
              <span>Parent</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Excel in Your Studies?</h2>
          <p>Join thousands of students who have transformed their academic journey with TutorFinder</p>
          <div className="cta-buttons">
            <button className="btn-gold" onClick={() => navigate('/register')}>
              Get Started Free <FaArrowRight />
            </button>
            <button className="btn-outline" onClick={() => navigate('/pricing')}>
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>TutorFinder</h3>
            <p>Empowering students to achieve academic excellence through personalized tutoring.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/register">Sign Up</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>For Students</h4>
            <ul>
              <li><a href="/register">Find a Tutor</a></li>
              <li><a href="/pricing">Session Rates</a></li>
              <li><a href="/about">How It Works</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li><FaEnvelope /> maanpatel1811@gmail.com</li>
              <li><FaPhone /> +1 (555) 123-4567</li>
              <li><FaMapMarkerAlt /> San Francisco, CA</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 TutorFinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
