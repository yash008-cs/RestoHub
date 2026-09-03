import React from 'react';
import { Utensils } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="zepto-footer-clean">
      <div className="footer-container">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <div
              className="ref-cloche-icon"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 40 32" width="24" height="20" fill="none">
                <circle cx="20" cy="5" r="3" fill="#FC8019" />
                <path
                  d="M6 21 C6 11 12 7 20 7 C28 7 34 11 34 21 Z"
                  fill="#FC8019"
                />
                <rect x="3" y="23" width="34" height="4" rx="2" fill="#FC8019" />
              </svg>
            </div>
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
