import React, { useState, useEffect } from 'react';
import { Globe, Sparkles, Navigation, Volume2, VolumeX, Moon, Sun, ArrowUpRight } from 'lucide-react';

export const CyberGlassHero = ({ onNavigateRestaurants }) => {
  const [cursorPos, setCursorPos] = useState({ x: 960, y: 540 });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [themeMode, setThemeMode] = useState('GLASS');

  // Track mouse coordinates over the hero section
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setCursorPos({ x, y });
  };

  // Play subtle web audio tone on hover/click if sound is enabled
  const playUiSound = (freq = 440) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context fallback
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) playUiSound(880);
  };

  return (
    <div
      className={`cyber-glass-hero-wrapper ${themeMode.toLowerCase()}-theme`}
      onMouseMove={handleMouseMove}
    >
      {/* Background Mesh Lighting Glows */}
      <div className="cyber-ambient-glow glow-1"></div>
      <div className="cyber-ambient-glow glow-2"></div>

      {/* Grid Crosshairs Blueprint Lines */}
      <div className="cyber-grid-lines">
        <span className="crosshair ch-1">+</span>
        <span className="crosshair ch-2">+</span>
        <span className="crosshair ch-3">+</span>
        <span className="crosshair ch-4">+</span>
      </div>

      {/* Minimalist Top Technical Navigation Bar */}
      <header className="cyber-tech-navbar">
        <div className="tech-nav-left">
          <span className="tech-brand-logo">RESTOHUB.DESIGN</span>
          <span className="tech-brand-sub">Taste & Engineering</span>
        </div>

        <div className="tech-nav-center">
          <p>Thinking in flavors. Delivering with care.</p>
        </div>

        <div className="tech-nav-right">
          <button
            className="tech-nav-link"
            onMouseEnter={() => playUiSound(520)}
            onClick={onNavigateRestaurants}
          >
            WORK <ArrowUpRight size={14} />
          </button>
          <button
            className="tech-nav-link"
            onMouseEnter={() => playUiSound(580)}
            onClick={onNavigateRestaurants}
          >
            RESTAURANTS
          </button>
          <button
            className="tech-nav-pill-btn"
            onClick={() => {
              playUiSound(660);
              setThemeMode(themeMode === 'GLASS' ? 'NEO' : 'GLASS');
            }}
          >
            {themeMode === 'GLASS' ? <Sun size={13} /> : <Moon size={13} />}
            <span>THEME [{themeMode}]</span>
          </button>
          <button
            className={`tech-nav-pill-btn ${soundEnabled ? 'active-sound' : ''}`}
            onClick={toggleSound}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>SOUND [{soundEnabled ? '+' : '•'}]</span>
          </button>
        </div>
      </header>

      {/* Floating 3D Stickers & Badges */}
      <div className="cyber-stickers-container">
        {/* Neon Green 3D Graffiti Badge */}
        <div
          className="floating-sticker sticker-neon-green"
          onMouseEnter={() => playUiSound(720)}
        >
          <div className="sticker-content">
            <span className="graffiti-text">PUNE</span>
            <span className="graffiti-sub">TASTE 100%</span>
          </div>
        </div>

        {/* Magenta 3D Discount Badge */}
        <div
          className="floating-sticker sticker-magenta"
          onMouseEnter={() => playUiSound(800)}
        >
          <div className="sticker-content">
            <span className="badge-year">50%</span>
            <span className="badge-off">OFF</span>
          </div>
        </div>

        {/* 3D Blue Cursor Arrow Pointer */}
        <div className="floating-sticker sticker-blue-cursor">
          <Navigation size={38} className="cursor-arrow-icon" />
        </div>

        {/* Floating Strawberry Badge */}
        <div className="floating-sticker sticker-food-emoji">
          <span>🍓</span>
        </div>
      </div>

      {/* Center 3D Inflatable Liquid-Glass "RestoHub" Artwork */}
      <div className="cyber-main-canvas">
        <div className="inflatable-glass-artwork">
          <svg viewBox="0 0 900 240" className="inflatable-svg-text">
            <defs>
              {/* 3D Liquid Gloss Gradient */}
              <linearGradient id="liquidGlossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="30%" stopColor="#93c5fd" />
                <stop offset="70%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>

              {/* Specular Highlight Filter */}
              <filter id="glassSpecular" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
                <feSpecularLighting
                  in="blur"
                  surfaceScale="8"
                  specularConstant="2.2"
                  specularExponent="35"
                  lightingColor="#ffffff"
                  result="specular"
                >
                  <fePointLight x="200" y="50" z="300" />
                </feSpecularLighting>
                <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularClip" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="specularClip" />
                </feMerge>
              </filter>
            </defs>

            {/* Giant Inflatable Cursive 3D Text "RestoHub" */}
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="inflatable-text-path"
              fill="url(#liquidGlossGrad)"
              filter="url(#glassSpecular)"
            >
              RestoHub
            </text>
          </svg>

          {/* Lens Flare Sparkles */}
          <Sparkles size={24} className="lens-flare flare-1" />
          <Sparkles size={20} className="lens-flare flare-2" />
        </div>

        {/* Bold Editorial Left Headline */}
        <div className="cyber-headline-box">
          <h1 className="cyber-hero-headline">
            WE BRING<br />
            CRAFT & TASTE<br />
            TO PUNE DINING
          </h1>
        </div>
      </div>

      {/* Minimalist Live Technical Footer Status Bar */}
      <footer className="cyber-tech-footer">
        <div className="tech-footer-left">
          <span>GMT+5:30 PUNE 28°C</span>
        </div>

        <div className="tech-footer-center">
          <span className="coordinate-tracker">
            {String(cursorPos.x).padStart(4, '0')} X {String(cursorPos.y).padStart(4, '0')} Y
          </span>
        </div>

        <div className="tech-footer-right">
          <Globe size={18} className="globe-spin-icon" />
        </div>
      </footer>
    </div>
  );
};
