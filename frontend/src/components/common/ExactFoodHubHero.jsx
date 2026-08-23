import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, User, ShoppingBag } from 'lucide-react';

export const ExactFoodHubHero = ({ onSearch, onLocationChange }) => {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Pune');

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleLocationSelect = (e) => {
    const val = e.target.value;
    setSelectedLocation(val);
    if (onLocationChange) onLocationChange(val);
  };

  return (
    <div className="exact-foodhub-wrapper">
      {/* Top Navbar */}
      <header className="exact-foodhub-navbar">
        <div className="exact-navbar-container">
          {/* Logo */}
          <div className="exact-logo-brand">
            <svg viewBox="0 0 40 40" className="exact-logo-svg">
              <path
                d="M20 5 C15 5 12 9 12 14 C12 19 16 20 20 20 C24 20 28 19 28 14 C28 9 25 5 20 5 Z"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              />
              <path
                d="M20 35 C15 35 12 31 12 26 C12 21 16 20 20 20 C24 20 28 21 28 26 C28 31 25 35 20 35 Z"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              />
              <path
                d="M5 20 C5 15 9 12 14 12 C19 12 20 16 20 20 C20 24 19 28 14 28 C9 28 5 25 5 20 Z"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              />
              <path
                d="M35 20 C35 15 31 12 26 12 C21 12 20 16 20 20 C20 24 21 28 26 28 C31 28 35 25 35 20 Z"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              />
            </svg>
            <span className="exact-logo-text">RestoHub</span>
          </div>

          {/* Center/Right Nav Links */}
          <div className="exact-nav-links-row">
            <a href="#home" className="exact-nav-link active">
              Home
              <span className="active-dots">• • •</span>
            </a>
            <a href="#recipes" className="exact-nav-link">Recipes</a>
            <a href="#pages" className="exact-nav-link">Pages</a>
            <a href="#blog" className="exact-nav-link">Blog</a>
            <a href="#shop" className="exact-nav-link">Shop</a>

            {/* Quick Action Icons */}
            <div className="exact-nav-icons-group">
              <button className="icon-btn"><Search size={16} color="white" /></button>
              <button className="icon-btn"><User size={16} color="white" /></button>
              <button className="icon-btn"><ShoppingBag size={16} color="white" /></button>
            </div>

            <button className="submit-recipe-btn">Order Now</button>
          </div>
        </div>
      </header>

      {/* Main Hero Section with Food Delivery Quote & Dual Pill Search */}
      <section className="exact-hero-body">
        <div className="exact-hero-container">
          {/* Left Text & Dual Pill Search Bar */}
          <div className="exact-hero-left">
            <h1 className="exact-quote-title">
              Order Food & Groceries.<br />Discover Best Restaurants.
            </h1>

            <p className="exact-quote-subtitle">
              Savor top-rated Pune restaurants, authentic Maharashtrian dishes & 20-minute delivery to your doorstep.
            </p>

            {/* Dual Pill Search Controls matching user screenshot */}
            <div className="dual-pill-search-container">
              {/* Pill 1: Location Selector Pill */}
              <div className="pill-location-selector">
                <MapPin size={20} className="location-pin-icon" />
                <select value={selectedLocation} onChange={handleLocationSelect}>
                  <option value="Pune">Enter your delivery location</option>
                  <option value="Kothrud">Kothrud, Pune</option>
                  <option value="Baner">Baner, Pune</option>
                  <option value="Wakad">Wakad, Pune</option>
                  <option value="Hinjawadi">Hinjawadi, Pune</option>
                  <option value="Viman Nagar">Viman Nagar, Pune</option>
                  <option value="Koregaon Park">Koregaon Park, Pune</option>
                </select>
                <ChevronDown size={18} className="location-arrow" />
              </div>

              {/* Pill 2: Restaurant & Item Search Pill */}
              <div className="pill-search-input">
                <input
                  type="text"
                  placeholder="Search for restaurant, item or more"
                  value={query}
                  onChange={handleQueryChange}
                />
                <Search size={18} className="input-search-icon" />
              </div>
            </div>
          </div>

          {/* Right Column: Bowl Visual */}
          <div className="exact-hero-right">
            <div className="exact-bowl-wrapper">
              <svg viewBox="0 0 500 500" className="exact-bowl-svg">
                <defs>
                  <radialGradient id="exactShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.65)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </radialGradient>
                  <linearGradient id="exactBowlBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="exactChicken" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fed7aa" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <linearGradient id="exactAvocado" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>

                {/* Drop shadow */}
                <ellipse cx="250" cy="440" rx="220" ry="40" fill="url(#exactShadow)" />

                {/* Bowl Rim */}
                <circle cx="250" cy="240" r="204" fill="url(#exactBowlBg)" stroke="#334155" strokeWidth="7" />
                <circle cx="250" cy="240" r="190" fill="#111827" />

                {/* Grain Base */}
                <circle cx="250" cy="240" r="184" fill="#374151" opacity="0.35" />

                {/* Grilled Chicken Slices */}
                <g transform="translate(130, 130) rotate(-15)">
                  <rect x="0" y="0" width="125" height="36" rx="10" fill="url(#exactChicken)" />
                  <line x1="20" y1="0" x2="25" y2="36" stroke="#9a3412" strokeWidth="2.5" />
                  <line x1="50" y1="0" x2="55" y2="36" stroke="#9a3412" strokeWidth="2.5" />
                  <line x1="80" y1="0" x2="85" y2="36" stroke="#9a3412" strokeWidth="2.5" />

                  <rect x="5" y="42" width="120" height="36" rx="10" fill="url(#exactChicken)" />
                  <line x1="25" y1="42" x2="30" y2="78" stroke="#9a3412" strokeWidth="2.5" />
                  <line x1="60" y1="42" x2="65" y2="78" stroke="#9a3412" strokeWidth="2.5" />
                </g>

                {/* Creamy Avocado Slices */}
                <g transform="translate(235, 255)">
                  <path d="M10 20 Q50 0 75 55 Q35 75 10 20 Z" fill="url(#exactAvocado)" />
                  <path d="M25 30 Q58 15 75 60 Q42 75 25 30 Z" fill="url(#exactAvocado)" />
                  <path d="M40 40 Q68 25 85 70 Q52 80 40 40 Z" fill="url(#exactAvocado)" />
                </g>

                {/* Diced Carrots */}
                <g transform="translate(115, 235)">
                  <rect x="10" y="10" width="24" height="24" rx="4" fill="#ea580c" />
                  <rect x="38" y="15" width="20" height="20" rx="4" fill="#f97316" />
                  <rect x="15" y="40" width="22" height="22" rx="4" fill="#ea580c" />
                  <rect x="42" y="40" width="26" height="26" rx="4" fill="#c2410c" />
                </g>

                {/* Broccoli Florets */}
                <g transform="translate(295, 135)">
                  <circle cx="20" cy="20" r="19" fill="#15803d" />
                  <circle cx="42" cy="22" r="17" fill="#16a34a" />
                  <circle cx="30" cy="42" r="19" fill="#166534" />
                  <rect x="26" y="48" width="8" height="26" rx="3" fill="#86efac" />
                </g>

                {/* Sweet Corn */}
                <g transform="translate(305, 245)">
                  <circle cx="10" cy="10" r="5" fill="#facc15" />
                  <circle cx="22" cy="14" r="5" fill="#fef08a" />
                  <circle cx="14" cy="26" r="5" fill="#eab308" />
                  <circle cx="28" cy="28" r="5" fill="#facc15" />
                  <circle cx="38" cy="18" r="5" fill="#fef08a" />
                </g>
              </svg>

              {/* Black Slate Cutlery */}
              <div className="exact-cutlery-fork">
                <div className="fork-tines"></div>
                <div className="cutlery-line-handle"></div>
              </div>
              <div className="exact-cutlery-knife">
                <div className="knife-top-blade"></div>
                <div className="cutlery-line-handle"></div>
              </div>

              {/* Floating Leaves */}
              <span className="exact-floating-leaf leaf-top">🌿</span>
              <span className="exact-floating-leaf leaf-bottom">🍃</span>
              <span className="exact-floating-garlic garlic-left">🧄</span>

              <div className="exact-buy-discount-badge">Buy with discount</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
