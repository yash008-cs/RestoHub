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
  X,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Award,
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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
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
    <>
      <header className="ref-navbar-header">
        <div className="ref-navbar-container">
          {/* Left: Cloche Icon + Brand Name */}
          <div className="ref-brand-group">
            <div
              className="ref-brand-logo"
              onClick={() => setActiveTab('home')}
              role="button"
              tabIndex={0}
              title="RestoHub Home"
            >
              <div className="ref-cloche-icon">
                <svg viewBox="0 0 40 32" width="34" height="28" fill="none">
                  {/* Top Knob */}
                  <circle cx="20" cy="5" r="3" fill="#FC8019" />
                  {/* Dome */}
                  <path
                    d="M6 21 C6 11 12 7 20 7 C28 7 34 11 34 21 Z"
                    fill="#FC8019"
                  />
                  {/* Base Platter Line */}
                  <rect x="3" y="23" width="34" height="4" rx="2" fill="#FC8019" />
                </svg>
              </div>
              <span className="ref-brand-name">RestoHub</span>
            </div>

            {/* Location Selector Badge */}
            <div
              className="ref-location-badge"
              onClick={() => setIsLocationModalOpen(true)}
              title="Change Delivery Location"
              role="button"
              tabIndex={0}
            >
              <MapPin size={14} className="ref-loc-icon" />
              <span className="ref-loc-text">{currentLocation.area || 'Baner, Pune'}</span>
              <ChevronDown size={12} className="ref-loc-arrow" />
            </div>
          </div>

          {/* Center Navigation Links (Matching Reference: Home, Menu, About Us, Contact) */}
          <nav className="ref-nav-menu">
            <button
              className={`ref-nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button
              className={`ref-nav-link ${activeTab === 'restaurants' ? 'active' : ''}`}
              onClick={() => setActiveTab('restaurants')}
            >
              Menu
            </button>
            <button
              className="ref-nav-link"
              onClick={() => setShowAboutModal(true)}
            >
              About Us
            </button>
            <button
              className="ref-nav-link"
              onClick={() => setShowContactModal(true)}
            >
              Contact
            </button>
            {isAuthenticated && (
              <button
                className={`ref-nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
            )}
            {isAuthenticated && (
              <button
                className={`ref-nav-link ${activeTab === 'favourites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favourites')}
              >
                Favourites
              </button>
            )}
          </nav>

          {/* Right Group: Search Pill, User Profile / Log In, Cart */}
          <div className="ref-nav-actions">
            {/* Search Input Bar */}
            <div
              className="ref-search-bar"
              onClick={() => {
                if (activeTab !== 'search') {
                  setActiveTab('search');
                }
              }}
            >
              <Search size={15} className="ref-search-icon" />
              <input
                type="text"
                placeholder="Search cuisine, dishes or restaurants"
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
                className="ref-search-input"
              />
            </div>

            {/* Log In Button (Solid Orange Pill matching Reference) or Profile Dropdown */}
            {isAuthenticated ? (
              <div
                className="ref-user-dropdown-wrap"
                ref={loginDropdownRef}
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <button
                  className="ref-user-pill-btn"
                  onClick={handleProfileClick}
                  title={activeUser.name}
                >
                  <div className="ref-user-avatar">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ref-user-name">
                    {activeUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className={`ref-chevron ${showProfileDropdown ? 'open' : ''}`} />
                </button>

                {showProfileDropdown && (
                  <div className="ref-dropdown-menu">
                    <div className="ref-dropdown-user-header">
                      <div className="ref-user-avatar-lg">
                        {activeUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ref-user-details">
                        <span className="ref-user-fullname">{activeUser.name}</span>
                        <span className="ref-user-email">{activeUser.email || activeUser.phoneNumber || 'Member'}</span>
                      </div>
                    </div>
                    <div className="ref-dropdown-divider" />
                    <button className="ref-dropdown-item" onClick={() => handleDropdownNavigation('profile')}>
                      <User size={15} /> <span>My Profile</span>
                    </button>
                    <button className="ref-dropdown-item" onClick={() => handleDropdownNavigation('orders')}>
                      <ShoppingBag size={15} /> <span>My Orders</span>
                    </button>
                    <button className="ref-dropdown-item" onClick={() => handleDropdownNavigation('favourites')}>
                      <Heart size={15} /> <span>Favourites</span>
                    </button>
                    <div className="ref-dropdown-divider" />
                    <button className="ref-dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={15} /> <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="ref-login-orange-btn"
                onClick={() => openLogin('login')}
                title="Log In to RestoHub"
              >
                Log In
              </button>
            )}

            {/* Cart Button */}
            <button
              className={`ref-cart-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => {
                if (!isAuthenticated) {
                  openLogin('login');
                  return;
                }
                setActiveTab('cart');
              }}
              title="View Cart"
            >
              <ShoppingCart size={18} />
              {totalCount > 0 && (
                <span className="ref-cart-badge">{totalCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="ref-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="ref-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ref-modal-header">
              <div className="ref-modal-title-box">
                <Award size={22} color="#FC8019" />
                <h3>About RestoHub</h3>
              </div>
              <button className="ref-modal-close" onClick={() => setShowAboutModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ref-modal-body">
              <p className="ref-modal-lead">
                RestoHub is Pune's leading modern food delivery platform delivering delicious culinary experiences from the city's finest restaurants directly to your doorstep in minutes.
              </p>
              <div className="ref-about-grid">
                <div className="ref-about-item">
                  <Clock size={20} color="#FC8019" />
                  <h4>Lightning Fast</h4>
                  <p>Average delivery in under 30 minutes with live GPS rider tracking.</p>
                </div>
                <div className="ref-about-item">
                  <ShieldCheck size={20} color="#FC8019" />
                  <h4>Hygiene Guaranteed</h4>
                  <p>100% verified kitchen safety and contactless delivery protocols.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="ref-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="ref-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ref-modal-header">
              <div className="ref-modal-title-box">
                <Phone size={22} color="#FC8019" />
                <h3>Contact RestoHub Support</h3>
              </div>
              <button className="ref-modal-close" onClick={() => setShowContactModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ref-modal-body">
              <p className="ref-modal-lead">
                Have questions about your order or need help? Our Pune customer care team is available 24/7.
              </p>
              <div className="ref-contact-list">
                <div className="ref-contact-row">
                  <Phone size={18} color="#FC8019" />
                  <div>
                    <strong>Customer Helpline:</strong>
                    <p>+91 (020) 2555-7378 / +91 98765 43210</p>
                  </div>
                </div>
                <div className="ref-contact-row">
                  <Mail size={18} color="#FC8019" />
                  <div>
                    <strong>Support Email:</strong>
                    <p>support@restohub.in</p>
                  </div>
                </div>
                <div className="ref-contact-row">
                  <MapPin size={18} color="#FC8019" />
                  <div>
                    <strong>HQ Address:</strong>
                    <p>RestoHub Towers, Senapati Bapat Road, Shivajinagar, Pune 411016</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
