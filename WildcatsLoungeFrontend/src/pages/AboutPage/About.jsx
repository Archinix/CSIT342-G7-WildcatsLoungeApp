import React from 'react'
import AppShell from '../../components/AppShell'
import '../AboutPage/About.css'

function About() {
  return (
    <AppShell>
      <div className="about-container">
        <div className="about-header">
          <h1>☕ Wildcats Lounge</h1>
          <p className="subtitle">Your Digital Café Companion</p>
        </div>

        <section className="about-section">
          <h2>🎯 Our Mission</h2>
          <p>
            Wildcats Lounge is a student-run café ordering platform designed to make campus coffee 
            and pastry ordering fast, convenient, and rewarding. We eliminate long queues and simplify 
            the ordering experience for CIT-U community members.
          </p>
        </section>

        <section className="about-section">
          <h2>✨ What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🏃 Quick Ordering</h3>
              <p>Order your favorite coffee or pastry in just a few taps and skip the line.</p>
            </div>
            <div className="feature-card">
              <h3>☕ Menu Variety</h3>
              <p>Hot, cold, and specialty drinks paired with fresh pastries and snacks.</p>
            </div>
            <div className="feature-card">
              <h3>⭐ Loyalty Rewards</h3>
              <p>Earn points with every purchase and redeem them for exclusive discounts.</p>
            </div>
            <div className="feature-card">
              <h3>📲 Multi-Platform</h3>
              <p>Access Wildcats Lounge from web or mobile—order anytime, anywhere on campus.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🏆 Loyalty Tiers</h2>
          <p>Earn more points as you climb the tiers with every purchase!</p>
          <div className="loyalty-tiers">
            <div className="tier">
              <h4>Tier 1</h4>
              <p>1 point per peso</p>
            </div>
            <div className="tier">
              <h4>Tier 2</h4>
              <p>1.5 points per peso</p>
            </div>
            <div className="tier">
              <h4>Tier 3</h4>
              <p>2 points per peso</p>
            </div>
            <div className="tier">
              <h4>Tier 4</h4>
              <p>3 points per peso</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>❤️ Why Choose Wildcats Lounge?</h2>
          <ul className="benefits-list">
            <li><strong>Fast Checkout:</strong> Complete an order in under 2 minutes</li>
            <li><strong>Secure:</strong> Your data is protected with JWT authentication</li>
            <li><strong>Loyalty First:</strong> Every purchase brings you closer to free coffee</li>
            <li><strong>Accessible:</strong> Optimized for both desktop and mobile</li>
            <li><strong>On Campus:</strong> Orders tailored for CIT-U locations and delivery times</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>📍 Contact & Support</h2>
          <div className="contact-info">
            <p>
              <strong>Location:</strong> Cebu Institute of Technology University<br />
              <strong>Platform:</strong> Web & Mobile App<br />
              <strong>Operating Hours:</strong> Check the app for daily café hours<br />
              <strong>Feedback:</strong> We'd love to hear from you!
            </p>
          </div>
        </section>

        <section className="about-section about-footer">
          <p>
            <small>
              Wildcats Lounge v1.0 | Built by Archienni Al R. Abatayo | 
              © 2026 Cebu Institute of Technology University
            </small>
          </p>
        </section>
      </div>
    </AppShell>
  )
}

export default About
