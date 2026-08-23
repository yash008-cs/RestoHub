import React from 'react';

export const RealisticFire = ({ size = 28, className = '' }) => {
  return (
    <span
      className={`realistic-fire-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justify: 'center',
        position: 'relative',
        width: size,
        height: size,
        verticalAlign: 'middle',
        marginRight: '8px',
        flexShrink: 0,
      }}
      title="Hot Deal"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="realistic-fire-svg"
      >
        <defs>
          {/* Outer Red/Orange Flame Gradient */}
          <linearGradient id="fireGradOuter" x1="18" y1="36" x2="18" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="30%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Middle Golden Flame Gradient */}
          <linearGradient id="fireGradMid" x1="18" y1="34" x2="18" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Core White Hot Flame Gradient */}
          <linearGradient id="fireGradCore" x1="18" y1="32" x2="18" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Soft Blur Filter for Flame Aura */}
          <filter id="fireAuraGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Backlight Halo */}
        <circle cx="18" cy="22" r="11" fill="#ea580c" opacity="0.38" className="fire-ambient-glow" />

        {/* Base Ember Core */}
        <path
          d="M18 4C18 4 25 12 25 21C25 27.627 21.866 32 18 32C14.134 32 11 27.627 11 21C11 15 15 8 18 4Z"
          fill="url(#fireGradOuter)"
          filter="url(#fireAuraGlow)"
          className="fire-layer-outer"
        />

        {/* Left Flickering Wing Flame */}
        <path
          d="M13 16C13 16 8 20 8 25C8 28.866 10.5 32 14.5 32C12.2 28.5 12.2 25 14.5 21.5C16.8 18 13 16 13 16Z"
          fill="url(#fireGradOuter)"
          className="fire-wing-left"
        />

        {/* Right Flickering Wing Flame */}
        <path
          d="M23 16C23 16 28 20 28 25C28 28.866 25.5 32 21.5 32C23.8 28.5 23.8 25 21.5 21.5C19.2 18 23 16 23 16Z"
          fill="url(#fireGradOuter)"
          className="fire-wing-right"
        />

        {/* Golden Middle Flame */}
        <path
          d="M18 10C18 10 22.5 15.5 22.5 22.5C22.5 27 20.5 30 18 30C15.5 30 13.5 27 13.5 22.5C13.5 18 16.5 13.5 18 10Z"
          fill="url(#fireGradMid)"
          className="fire-layer-mid"
        />

        {/* Inner White Hot Flame */}
        <path
          d="M18 16C18 16 20.2 19.5 20.2 24C20.2 27 19.2 28.5 18 28.5C16.8 28.5 15.8 27 15.8 24C15.8 21 17 18.5 18 16Z"
          fill="url(#fireGradCore)"
          className="fire-layer-core"
        />

        {/* Rising Ember Sparks */}
        <circle cx="15" cy="11" r="1.1" fill="#fef08a" className="fire-spark spark-1" />
        <circle cx="21" cy="9" r="1.3" fill="#fbbf24" className="fire-spark spark-2" />
        <circle cx="18" cy="5" r="0.9" fill="#ffffff" className="fire-spark spark-3" />
      </svg>
    </span>
  );
};
