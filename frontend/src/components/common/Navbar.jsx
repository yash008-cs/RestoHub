import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Search,
  ShoppingCart,
  User,
  ShoppingBag,
  Heart,
  LogOut,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';

export const Navbar = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const { activeUser, isAuthenticated, openLogin, logout } = useAuth();
  const { totalCount } = useCart();
  const { currentLocation, setIsLocationModalOpen } = useLocation();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const loginDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      openLogin('login');
    } else {
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  const handleDropdownNavigation = (tabName) => {
    setActiveTab(tabName);
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    setActiveTab('home');
  };

  return (
    <header className="zepto-navbar-sticky">
      <div className="zepto-navbar-container">
        {/* Left Side: Brand Logo + Location Selector */}
        <div className="navbar-left-group">
          <div className="brand-logo-box" onClick={() => setActiveTab('home')} role="button" tabIndex={0}>
            <div className="navbar-brand-icon-cloche">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a2 2 0 0 0-2 2h4a2 2 0 0 0-2-2z" fill="#FC8019" stroke="#FC8019" />
                <path d="M4 14a8 8 0 0 1 16 0H4z" fill="#FC8019" fillOpacity="0.15" stroke="#FC8019" />
                <line x1="2" y1="18" x2="22" y2="18" stroke="#FC8019" strokeWidth="2.5" />
              </svg>
            </div>
            <span className="brand-name-text">RestoHub</span>
          </div>

          <div
            className="navbar-location-badge"
            onClick={() => setIsLocationModalOpen(true)}
            title="Change Delivery Location"
            role="button"
            tabIndex={0}
          >
            <MapPin size={15} className="loc-pin" />
            <div className="loc-text-meta">
              <span className="loc-title">Location</span>
              <span className="loc-value">{currentLocation.area || 'Pune'}</span>
            </div>
            <ChevronDown size={13} className="loc-chevron" />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div
          className="navbar-center-search"
          onClick={() => {
            if (activeTab !== 'search') {
              setActiveTab('search');
            }
          }}
        >
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search for food or restaurants..."
            value={searchQuery || ''}
            onFocus={() => {
              if (activeTab !== 'search') {
                setActiveTab('search');
              }
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'search') {
                setActiveTab('search');
              }
            }}
            className="search-input-field"
          />
        </div>

        {/* Navigation Links */}
        <nav className="navbar-nav-links">
          <button
            className={`nav-text-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`nav-text-link ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Menu
          </button>
          {isAuthenticated && (
            <button
              className={`nav-text-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          )}
          {isAuthenticated && (
            <button
              className={`nav-text-link ${activeTab === 'favourites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favourites')}
            >
              Favourites
            </button>
          )}
        </nav>

        {/* Right Side: Login / Profile + Cart */}
        <div className="navbar-right-group">
          {/* Login / Profile */}
          {isAuthenticated ? (
            <div
              className="nav-dropdown-wrapper"
              ref={loginDropdownRef}
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <button className="nav-action-btn logged-in" onClick={handleProfileClick} title={activeUser.name}>
                <div className="avatar-circle-nav">
                  {activeUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="nav-btn-label">
                  {activeUser.name.split(' ')[0]}
                </span>
                <ChevronDown size={13} className={`nav-chevron ${showProfileDropdown ? 'open' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-user-info">
                    <div className="avatar-circle-sm">
                      {activeUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-text">
                      <span className="name">{activeUser.name}</span>
                      <span className="email">{activeUser.email || 'Customer'}</span>
                    </div>
                  </div>
                  <div className="dropdown-line" />

                  {/* Customer-Specific Dropdown Items */}
                  <button className="dropdown-link-btn" onClick={() => handleDropdownNavigation('profile')}>
                    <User size={15} /> <span>My Profile</span>
                  </button>
                  <button className="dropdown-link-btn" onClick={() => handleDropdownNavigation('orders')}>
                    <ShoppingBag size={15} /> <span>My Orders</span>
                  </button>
                  <button className="dropdown-link-btn" onClick={() => handleDropdownNavigation('favourites')}>
                    <Heart size={15} /> <span>Favourites</span>
                  </button>

                  <div className="dropdown-line" />
                  <button className="dropdown-link-btn logout" onClick={handleLogout}>
                    <LogOut size={15} /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar-login-pill-btn" onClick={() => openLogin('login')} title="Log In">
              Log In
            </button>
          )}

          {/* Cart Button */}
          <button
            className={`navbar-cart-btn ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => {
              if (!isAuthenticated) {
                openLogin('login');
                return;
              }
              setActiveTab('cart');
            }}
            title="Shopping Cart"
          >
            <div className="cart-icon-box">
              <ShoppingCart size={18} />
              {totalCount > 0 && <span className="cart-badge-count">{totalCount}</span>}
            </div>
            <span className="cart-btn-label">Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
};
