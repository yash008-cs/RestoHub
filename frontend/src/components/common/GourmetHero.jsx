import React, { useState } from 'react';
import { Search, Utensils, ChevronDown, Sparkles } from 'lucide-react';

export const GourmetHero = ({ onSearch, onNavigateRestaurants }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query, selectedCategory);
    if (onNavigateRestaurants) onNavigateRestaurants();
  };

  return (
    <div className="gourmet-hero-fullbleed">
      {/* Dark Slate Textured Background */}
      <div className="gourmet-hero-bg-overlay"></div>

      <div className="gourmet-hero-container">
        {/* Left Column: Impressive Quote & Integrated Search Bar */}
        <div className="gourmet-hero-left">
          <div className="gourmet-badge-pill">
            <Sparkles size={14} color="#f59e0b" />
            <span>FINEST PUNE GOURMET EXPERIENCE</span>
          </div>

          <h1 className="gourmet-hero-quote">
            Discover Authentic Flavors & Gourmet Delights
          </h1>

          <p className="gourmet-hero-subtitle">
            Savor top-rated Pune restaurants, traditional Maharashtrian delicacies & artisanal recipes delivered hot straight to your doorstep.
          </p>

          {/* Integrated Search Bar Pill (Matching Reference Image) */}
          <form className="gourmet-search-bar-form" onSubmit={handleSearchSubmit}>
            <div className="gourmet-search-input-wrap">
              <input
                type="text"
                placeholder="I want to eat..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="gourmet-search-input"
              />
            </div>

            <div className="gourmet-category-dropdown-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="gourmet-category-select"
              >
                <option value="All Categories">All Categories</option>
                <option value="Maharashtrian">Maharashtrian</option>
                <option value="Biryani">Biryani & Rice</option>
                <option value="South Indian">South Indian</option>
                <option value="Fast Food">Fast Food & Snacks</option>
                <option value="Desserts">Desserts & Sweets</option>
              </select>
              <ChevronDown size={14} className="dropdown-arrow-icon" />
            </div>

            <button type="submit" className="gourmet-search-btn">
              <Search size={18} />
            </button>
          </form>

          {/* Quick Tags under Search */}
          <div className="gourmet-popular-tags">
            <span className="popular-tag-label">Popular:</span>
            <button className="tag-chip" onClick={() => onNavigateRestaurants()}>Misal Pav</button>
            <button className="tag-chip" onClick={() => onNavigateRestaurants()}>Dum Biryani</button>
            <button className="tag-chip" onClick={() => onNavigateRestaurants()}>Paneer Masala</button>
            <button className="tag-chip" onClick={() => onNavigateRestaurants()}>Cold Coffee</button>
          </div>
        </div>

        {/* Right Column: High-Resolution Gourmet Nourish Bowl Visual */}
        <div className="gourmet-hero-right">
          <div className="gourmet-bowl-graphic-wrapper">
            {/* SVG Culinary Art: Fresh Nourish Bowl with Grilled Chicken, Avocado, Broccoli & Carrots */}
            <svg viewBox="0 0 500 500" className="gourmet-bowl-svg">
              <defs>
                <radialGradient id="bowlShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>

                <linearGradient id="bowlCeramic" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                <linearGradient id="chickenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>

                <linearGradient id="avocadoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>

              {/* Floor Shadow */}
              <ellipse cx="250" cy="440" rx="210" ry="40" fill="url(#bowlShadow)" />

              {/* Main Bowl Outer Circle */}
              <circle cx="250" cy="240" r="200" fill="url(#bowlCeramic)" stroke="#334155" strokeWidth="6" />
              <circle cx="250" cy="240" r="186" fill="#111827" />

              {/* Food Ingredients Section 1: Quinoa & Buckwheat Base */}
              <circle cx="250" cy="240" r="180" fill="#374151" opacity="0.3" />

              {/* Sliced Grilled Chicken Breast */}
              <g transform="translate(130, 130) rotate(-15)">
                <rect x="0" y="0" width="120" height="35" rx="10" fill="url(#chickenGrad)" />
                <line x1="20" y1="0" x2="25" y2="35" stroke="#9a3412" strokeWidth="2.5" />
                <line x1="50" y1="0" x2="55" y2="35" stroke="#9a3412" strokeWidth="2.5" />
                <line x1="80" y1="0" x2="85" y2="35" stroke="#9a3412" strokeWidth="2.5" />

                <rect x="5" y="40" width="115" height="35" rx="10" fill="url(#chickenGrad)" />
                <line x1="25" y1="40" x2="30" y2="75" stroke="#9a3412" strokeWidth="2.5" />
                <line x1="60" y1="40" x2="65" y2="75" stroke="#9a3412" strokeWidth="2.5" />
              </g>

              {/* Creamy Avocado Slices */}
              <g transform="translate(240, 260)">
                <path d="M10 20 Q50 0 70 50 Q30 70 10 20 Z" fill="url(#avocadoGrad)" />
                <path d="M25 30 Q55 15 70 55 Q40 70 25 30 Z" fill="url(#avocadoGrad)" />
                <path d="M40 40 Q65 25 80 65 Q50 75 40 40 Z" fill="url(#avocadoGrad)" />
              </g>

              {/* Roasted Carrots Diced */}
              <g transform="translate(120, 240)">
                <rect x="10" y="10" width="22" height="22" rx="4" fill="#ea580c" />
                <rect x="36" y="15" width="18" height="18" rx="4" fill="#f97316" />
                <rect x="15" y="38" width="20" height="20" rx="4" fill="#ea580c" />
                <rect x="40" y="38" width="24" height="24" rx="4" fill="#c2410c" />
              </g>

              {/* Fresh Broccoli Florets */}
              <g transform="translate(290, 140)">
                <circle cx="20" cy="20" r="18" fill="#15803d" />
                <circle cx="40" cy="22" r="16" fill="#16a34a" />
                <circle cx="28" cy="40" r="18" fill="#166534" />
                <rect x="24" y="45" width="8" height="25" rx="3" fill="#86efac" />
              </g>

              {/* Yellow Sweet Corn & Seeds */}
              <g transform="translate(300, 240)">
                <circle cx="10" cy="10" r="5" fill="#facc15" />
                <circle cx="22" cy="14" r="5" fill="#fef08a" />
                <circle cx="14" cy="26" r="5" fill="#eab308" />
                <circle cx="28" cy="28" r="5" fill="#facc15" />
                <circle cx="38" cy="18" r="5" fill="#fef08a" />
              </g>

              {/* Floating Basil Leaf Accent */}
              <path d="M260 110 Q280 80 300 110 Q280 130 260 110 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            </svg>

            {/* Black Slate Cutlery (Fork & Knife) */}
            <div className="gourmet-cutlery-fork">
              <div className="cutlery-head fork-head"></div>
              <div className="cutlery-handle"></div>
            </div>

            <div className="gourmet-cutlery-knife">
              <div className="cutlery-head knife-blade"></div>
              <div className="cutlery-handle"></div>
            </div>

            {/* Floating Basil Leaves & Garlic Cloves */}
            <div className="floating-ingredient leaf-1">🍃</div>
            <div className="floating-ingredient leaf-2">🌿</div>
            <div className="floating-ingredient garlic-1">🧄</div>

            {/* Discount Badge Ribbon */}
            <div className="gourmet-discount-tag-pill">
              <span>Buy with discount</span>
              <div className="discount-code-badge">PROMO: RESTO50</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
