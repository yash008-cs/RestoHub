import React from 'react';
import { Smartphone, Star, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const AppDownloadSection = () => {
  return (
    <section className="app-download-section-wrap" aria-label="Download RestoHub Mobile App">
      <div className="app-download-box">
        {/* Decorative background glows */}
        <div className="app-box-glow-1" />
        <div className="app-box-glow-2" />

        {/* Left: Promotional Details & Real App Store / Play Store Badges */}
        <div className="app-download-content">
          <div className="app-download-badge">
            <Smartphone size={15} className="app-badge-icon" />
            <span>RestoHub Mobile Experience</span>
          </div>

          <h2 className="app-download-headline">
            Hungry? Order Faster with the <span className="app-headline-accent">RestoHub App</span>
          </h2>

          <p className="app-download-description">
            Get your favourite meals delivered piping hot to your doorstep. Track your live orders in real-time,
            unlock exclusive app-only discounts, and enjoy a faster, smoother dining experience anywhere in Pune.
          </p>

          {/* Value Highlights */}
          <div className="app-perks-row">
            <div className="app-perk-item">
              <div className="app-perk-icon-wrap">
                <Zap size={16} />
              </div>
              <div className="app-perk-text">
                <strong>Instant Tracking</strong>
                <span>Live GPS order updates</span>
              </div>
            </div>

            <div className="app-perk-item">
              <div className="app-perk-icon-wrap">
                <Sparkles size={16} />
              </div>
              <div className="app-perk-text">
                <strong>App-Only Offers</strong>
                <span>Up to 50% OFF daily</span>
              </div>
            </div>

            <div className="app-perk-item">
              <div className="app-perk-icon-wrap">
                <ShieldCheck size={16} />
              </div>
              <div className="app-perk-text">
                <strong>Quick Checkout</strong>
                <span>1-Tap seamless orders</span>
              </div>
            </div>
          </div>

          {/* Real Play Store & App Store Buttons */}
          <div className="app-store-buttons-container">
            {/* Google Play Store Button */}
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="store-download-btn google-play"
              title="Get RestoHub on Google Play"
            >
              <div className="store-btn-logo">
                <svg width="25" height="27" viewBox="0 0 512 512" fill="none">
                  <path fill="#00D2FF" d="M38.8 8.1C28.2 13.9 21.2 24.9 21.2 38.3v435.4c0 13.4 7 24.4 17.6 30.2l242.2-247.9L38.8 8.1z"/>
                  <path fill="#00E676" d="M344.2 329.8L281 256l-242.2 247.9c4.8 2.6 10.4 4.1 16.5 4.1 7.8 0 15.2-2.5 21.3-6.9l267.6-171.3z"/>
                  <path fill="#FFA000" d="M473.2 230.1L344.2 182.2 281 256l63.2 73.8 129-47.9c13.7-5.1 22.8-17.7 22.8-32.9 0-15.1-9.1-27.8-22.8-38.9z"/>
                  <path fill="#FF3D00" d="M55.3 4.1C49.2 4.1 43.6 5.6 38.8 8.1L281 256l63.2-73.8L76.6 10.9C70.5 6.6 63.1 4.1 55.3 4.1z"/>
                </svg>
              </div>
              <div className="store-btn-labels">
                <span className="store-btn-sub">GET IT ON</span>
                <span className="store-btn-main">Google Play</span>
              </div>
            </a>

            {/* Apple App Store Button */}
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="store-download-btn app-store"
              title="Download RestoHub on the App Store"
            >
              <div className="store-btn-logo">
                <svg width="24" height="28" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14.01-6.1-9.44-10.9-20.09-14.42-31.95-3.52-11.86-5.28-23.01-5.28-33.45 0-14.04 3.49-25.59 10.47-34.65 6.98-9.06 15.69-13.68 26.14-13.87 4.13 0 9.07 1.13 14.83 3.39 5.76 2.26 9.53 3.45 11.31 3.56 1.48-.11 5.4-1.39 11.77-3.84 6.37-2.45 11.69-3.54 15.96-3.27 12.39 1.01 22.09 5.86 29.1 14.54-10.95 6.64-16.31 15.71-16.08 27.22.23 9.04 3.65 16.59 10.26 22.65 6.61 6.06 14.5 9.4 23.67 10.02-2.12 6.64-4.81 13.06-8.07 19.26zM119.22 33.15c0-6.98 2.53-13.72 7.59-20.22 5.06-6.5 11.39-10.84 18.99-13.03.88 5.67.1 11.59-2.33 17.77-2.43 6.18-6.19 11.32-11.28 15.42-3.81 3.15-7.79 5.25-11.94 6.3-1.28-.9-1.03-6.24-1.03-6.24z" />
                </svg>
              </div>
              <div className="store-btn-labels">
                <span className="store-btn-sub">Download on the</span>
                <span className="store-btn-main">App Store</span>
              </div>
            </a>
          </div>

          {/* Social Proof & Rating Stars */}
          <div className="app-social-proof">
            <div className="app-rating-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span className="app-rating-text">
              <strong>4.8 / 5</strong> Rating • 500k+ App Downloads in Pune
            </span>
          </div>
        </div>

        {/* Right: Realistic Floating Smartphone App Mockup */}
        <div className="app-download-visual-wrap">
          <div className="app-mockup-frame">
            <img
              src="/restohub-app-mockup.jpg"
              alt="RestoHub Mobile App Screen"
              className="app-mockup-image"
              loading="lazy"
            />
            {/* Floating micro badges */}
            <div className="app-floating-badge top-right">
              <span className="badge-pulse" />
              <span>⚡ 25 min delivery</span>
            </div>
            <div className="app-floating-badge bottom-left">
              <span>🍕 30+ Pune Restaurants</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
