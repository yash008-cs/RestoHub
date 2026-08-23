import React, { useState, useRef, useEffect } from 'react';
import {
  Utensils,
  MapPin,
  Search,
  ShoppingCart,
  User,
  ShoppingBag,
  Heart,
  LogOut,
  ChevronDown,
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
          <div className="brand-logo-box" onClick={() => setActiveTab('home')}>
            <img src="/restohub-logo.png" alt="RestoHub Logo" className="navbar-logo-img" />
            <span className="brand-name-text">RestoHub</span>
          </div>

          <div
            className="navbar-location-badge"
            onClick={() => setIsLocationModalOpen(true)}
            title="Change Delivery Location"
          >
            <MapPin size={16} className="loc-pin" />
            <div className="loc-text-meta">
              <span className="loc-title">Location</span>
              <span className="loc-value">{currentLocation.area || 'Pune'}</span>
            </div>
            <ChevronDown size={14} className="loc-chevron" />
          </div>
        </div>

        {/* Center: Clean Search Bar */}
        <div
          className="navbar-center-search"
          onClick={() => {
            if (activeTab !== 'search') {
              setActiveTab('search');
            }
          }}
        >
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search for food or restaurants"
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
              <button className="nav-action-btn" onClick={handleProfileClick} title={activeUser.name}>
                <User size={20} className="nav-btn-icon" />
                <span className="nav-btn-label">
                  {activeUser.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} className={`nav-chevron ${showProfileDropdown ? 'open' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-user-info">
                    <div className="avatar-circle-sm">
                      {activeUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-text">
                      <span className="name">{activeUser.name}</span>
                    </div>
                  </div>
                  <div className="dropdown-line" />

                  {/* Customer-Specific Dropdown Items */}
                  <button className="dropdown-link-btn" onClick={() => handleDropdownNavigation('profile')}>
                    <User size={16} /> <span>My Profile</span>
                  </button>
                  <button className="dropdown-link-btn" onClick={() => handleDropdownNavigation('orders')}>
                    <ShoppingBag size={16} /> <span>My Orders</span>
                  </button>
                  <button className="dropdown-link-btn" onClick={() => handleDropdownNavigation('favourites')}>
                    <Heart size={16} /> <span>Favourites</span>
                  </button>

                  <div className="dropdown-line" />
                  <button className="dropdown-link-btn logout" onClick={handleLogout}>
                    <LogOut size={16} /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-action-btn" onClick={() => openLogin('login')} title="Login">
              <User size={20} className="nav-btn-icon" />
              <span className="nav-btn-label">Login</span>
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
          >
            <div className="cart-icon-box">
              <ShoppingCart size={20} />
              {totalCount > 0 && <span className="cart-badge-count">{totalCount}</span>}
            </div>
            <span className="cart-btn-label">Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
};
