import React from 'react';
import { Utensils } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="zepto-footer-clean">
      <div className="footer-container">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <img src="/restohub-logo.png" alt="RestoHub Logo" className="footer-brand-logo-img" />
            <span className="logo-title">RestoHub</span>
          </div>
          <p className="footer-tagline">Delicious Food. Delivered Fast.</p>
          <p className="footer-copy">© 2026 RestoHub Application. All rights reserved.</p>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>RestoHub</h4>
            <a href="#about">About Us</a>
            <a href="#careers">Careers</a>
            <a href="#team">Team</a>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <a href="#help">Help & Support</a>
            <a href="#partner">Partner With Us</a>
            <a href="#ride">Ride With Us</a>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#privacy">Terms & Conditions</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#refund">Refund & Cancellation</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
