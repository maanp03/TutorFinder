import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheck } from 'react-icons/fa';
import './Dashboard.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Send email using mailto or form submission
    const mailtoLink = `mailto:maanpatel1811@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoLink;
    
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-container" data-testid="contact-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Contact <span>Us</span></h1>
        <p className="dashboard-subtitle">Have questions? We'd love to hear from you</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, maxWidth: 1100, margin: '0 auto' }}>
        {/* Contact Info */}
        <div className="glass-card" style={{ padding: 40 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#fff', marginBottom: 24 }}>Get In Touch</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 30, lineHeight: 1.7 }}>
            We're here to help! Whether you have questions about our platform, need support, or want to become a tutor, reach out to us.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 50, height: 50, background: 'rgba(212,175,55,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 20 }}>
                <FaEnvelope />
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Email</div>
                <a href="mailto:maanpatel1811@gmail.com" style={{ color: '#fff', textDecoration: 'none', fontSize: 15 }}>maanpatel1811@gmail.com</a>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 50, height: 50, background: 'rgba(212,175,55,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 20 }}>
                <FaPhone />
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Phone</div>
                <span style={{ color: '#fff', fontSize: 15 }}>+1 (555) 123-4567</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 50, height: 50, background: 'rgba(212,175,55,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: 20 }}>
                <FaMapMarkerAlt />
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Location</div>
                <span style={{ color: '#fff', fontSize: 15 }}>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card" style={{ padding: 40 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ width: 80, height: 80, background: 'rgba(74,222,128,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#4ade80', fontSize: 36 }}>
                <FaCheck />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#fff', marginBottom: 12 }}>Message Sent!</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#fff', marginBottom: 24 }}>Send a Message</h3>
              
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Your Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="John Doe" required data-testid="contact-name" />
              </div>
              
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Your Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="john@example.com" required data-testid="contact-email" />
              </div>
              
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Subject</label>
                <input type="text" name="subject" className="form-input" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required data-testid="contact-subject" />
              </div>
              
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Message</label>
                <textarea name="message" className="form-input" value={formData.message} onChange={handleChange} placeholder="Tell us more..." rows={5} style={{ resize: 'vertical' }} required data-testid="contact-message" />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading} data-testid="contact-submit">
                {loading ? 'Sending...' : <><FaPaperPlane /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
