import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaStar, FaArrowRight } from 'react-icons/fa';
import './Dashboard.css';

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '15',
      period: 'per hour',
      description: 'Perfect for occasional tutoring needs',
      features: [
        'Access to verified tutors',
        'Basic subject coverage',
        'Email support',
        'Session scheduling',
        'Progress tracking'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '25',
      period: 'per hour',
      description: 'Most popular choice for students',
      features: [
        'Access to top-rated tutors',
        'All subjects available',
        'Priority support',
        'Flexible scheduling',
        'Progress reports',
        'Session recordings',
        'Study materials included'
      ],
      popular: true
    },
    {
      name: 'Elite',
      price: '40',
      period: 'per hour',
      description: 'For serious academic excellence',
      features: [
        'Access to expert tutors',
        'All subjects + test prep',
        '24/7 priority support',
        'Unlimited scheduling',
        'Detailed analytics',
        'Session recordings',
        'Personalized study plan',
        'College prep guidance'
      ],
      popular: false
    }
  ];

  return (
    <div className="dashboard-container" data-testid="pricing-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title"><span>Pricing</span></h1>
        <p className="dashboard-subtitle">Choose the plan that fits your learning goals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, maxWidth: 1100, margin: '0 auto' }}>
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className="glass-card" 
            style={{ 
              padding: 40, 
              position: 'relative',
              border: plan.popular ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
            }}
            data-testid={`plan-${plan.name.toLowerCase()}`}
          >
            {plan.popular && (
              <div style={{ 
                position: 'absolute', 
                top: -12, 
                left: '50%', 
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #d4af37 0%, #c4a030 100%)',
                color: '#1a2e1a',
                padding: '6px 20px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <FaStar /> MOST POPULAR
              </div>
            )}
            
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#fff', marginBottom: 8 }}>{plan.name}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 }}>{plan.description}</p>
            
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: '#d4af37' }}>${plan.price}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}> /{plan.period}</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0' }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  <FaCheck style={{ color: '#4ade80', flexShrink: 0 }} />
                  {feature}
                </li>
              ))}
            </ul>
            
            <button 
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', padding: 14 }}
              onClick={() => navigate('/register')}
            >
              Get Started <FaArrowRight />
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div style={{ maxWidth: 800, margin: '80px auto 0' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 40 }}>
          Frequently Asked <span style={{ color: '#d4af37' }}>Questions</span>
        </h2>
        
        <div className="glass-card" style={{ padding: 30 }}>
          {[
            { q: 'Can I change my plan later?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
            { q: 'Is there a free trial?', a: 'We offer a free first session with any tutor so you can find the perfect match before committing.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for your convenience.' },
            { q: 'Can I get a refund?', a: 'If you\'re not satisfied with a session, contact us within 24 hours for a full refund.' }
          ].map((faq, i) => (
            <div key={i} style={{ padding: '20px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <h4 style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>{faq.q}</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
