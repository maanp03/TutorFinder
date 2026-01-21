import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaHandshake, FaAward, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';
import './Dashboard.css';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container" data-testid="about-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">About <span>TutorFinder</span></h1>
        <p className="dashboard-subtitle">Empowering students to achieve academic excellence</p>
      </div>

      {/* Mission Section */}
      <div className="glass-card" style={{ padding: 50, maxWidth: 900, margin: '0 auto 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#fff', marginBottom: 20 }}>Our Mission</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
          TutorFinder bridges the gap between high school students seeking personalized academic support and qualified tutors available for one-on-one sessions. We believe every student deserves access to quality education, regardless of their location or schedule.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto 60px' }}>
        {[
          { number: '500+', label: 'Verified Tutors' },
          { number: '2,000+', label: 'Active Students' },
          { number: '10,000+', label: 'Sessions Completed' },
          { number: '4.9', label: 'Average Rating' }
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: 30, textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#d4af37', marginBottom: 8 }}>{stat.number}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 40 }}>
        Our <span style={{ color: '#d4af37' }}>Values</span>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, maxWidth: 1100, margin: '0 auto 60px' }}>
        {[
          { icon: <FaUserGraduate />, title: 'Student-First', desc: 'Every decision we make puts student success at the center. Your academic goals are our priority.' },
          { icon: <FaChalkboardTeacher />, title: 'Quality Education', desc: 'We carefully vet all tutors to ensure they meet our high standards of expertise and teaching ability.' },
          { icon: <FaHandshake />, title: 'Accessibility', desc: 'Education should be accessible to everyone. We offer flexible scheduling and competitive pricing.' },
          { icon: <FaAward />, title: 'Excellence', desc: 'We strive for excellence in everything we do, from our platform to our customer support.' }
        ].map((value, i) => (
          <div key={i} className="glass-card" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, margin: '0 auto 20px', background: 'rgba(212,175,55,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#d4af37' }}>
              {value.icon}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#fff', marginBottom: 12 }}>{value.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6 }}>{value.desc}</p>
          </div>
        ))}
      </div>

      {/* Story Section */}
      <div className="glass-card" style={{ padding: 50, maxWidth: 900, margin: '0 auto 60px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#fff', marginBottom: 24, textAlign: 'center' }}>Our Story</h2>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <FaQuoteLeft style={{ fontSize: 40, color: '#d4af37', opacity: 0.5, flexShrink: 0 }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              TutorFinder was born from a simple observation: too many students struggle to find quality tutoring that fits their schedule and budget. High tutoring costs, difficulty in finding the right tutor, and scheduling conflicts were common barriers to academic success.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.8 }}>
              We created TutorFinder to solve these problems by building a platform that connects students with verified, experienced tutors. Our easy-to-use booking system and flexible scheduling ensure that quality education is just a click away.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#fff', marginBottom: 16 }}>Ready to Start Learning?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 30 }}>Join thousands of students who have transformed their academic journey</p>
        <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '16px 40px', fontSize: 16 }}>
          Get Started Today <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
