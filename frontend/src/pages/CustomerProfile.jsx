import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Save, CheckCircle, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

export const CustomerProfile = ({ onOpenLocationModal }) => {
  const { activeUser, updateProfile, openLogin } = useAuth();
  const { savedAddresses } = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: activeUser?.name || '',
    email: activeUser?.email || '',
    phone: activeUser?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!activeUser) {
    return (
      <div className="profile-page-empty">
        <User size={64} className="profile-empty-icon" />
        <h2>Please Sign In</h2>
        <p>You need to log in to view and manage your profile details.</p>
        <button className="profile-login-btn" onClick={openLogin}>
          SIGN IN TO RESTOHUB
        </button>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      setSaving(true);
      await updateProfile(activeUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: activeUser.password || 'DefaultPassword123!',
      });
      setIsEditing(false);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const initialLetter = activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-page-container">
      {/* Profile Header Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-large">
          <span>{initialLetter}</span>
        </div>

        <div className="profile-meta-group">
          <div className="profile-name-row">
            <h1 className="profile-name-title">{activeUser.name}</h1>
            <span className="profile-member-badge">
              <Sparkles size={13} /> RestoHub Gold
            </span>
          </div>
          <p className="profile-sub-contact">{activeUser.email} • {activeUser.phone || 'Phone not set'}</p>
        </div>

        <button
          className="profile-edit-toggle-btn"
          onClick={() => {
            setIsEditing(!isEditing);
            setFormData({
              name: activeUser.name || '',
              email: activeUser.email || '',
              phone: activeUser.phone || '',
            });
          }}
        >
          <Edit3 size={15} />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {msg.text && (
        <div className={`profile-alert-banner ${msg.type}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Profile Sections Grid */}
      <div className="profile-sections-grid">
        {/* Personal Info Card */}
        <div className="profile-info-card">
          <div className="card-header-flex">
            <h3 className="card-section-title">Personal Information</h3>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="form-field-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-actions-row">
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details-list">
              <div className="profile-detail-row">
                <div className="detail-icon-badge">
                  <User size={18} />
                </div>
                <div className="detail-text-meta">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{activeUser.name}</span>
                </div>
              </div>

              <div className="profile-detail-row">
                <div className="detail-icon-badge">
                  <Mail size={18} />
                </div>
                <div className="detail-text-meta">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{activeUser.email}</span>
                </div>
              </div>

              <div className="profile-detail-row">
                <div className="detail-icon-badge">
                  <Phone size={18} />
                </div>
                <div className="detail-text-meta">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{activeUser.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Addresses Card */}
        <div className="profile-info-card">
          <div className="card-header-flex">
            <h3 className="card-section-title">Saved Addresses</h3>
            <button className="add-addr-pill-btn" onClick={onOpenLocationModal}>
              <Plus size={15} />
              <span>Add New</span>
            </button>
          </div>

          <div className="profile-addresses-list">
            {savedAddresses && savedAddresses.length > 0 ? (
              savedAddresses.map((addr) => (
                <div key={addr.id} className="profile-address-card">
                  <div className="addr-pin-badge">
                    <MapPin size={18} />
                  </div>
                  <div className="addr-details-meta">
                    <span className="addr-type-chip">{addr.type || 'HOME'}</span>
                    <p className="addr-street-text">
                      {addr.flatNo ? `${addr.flatNo}, ` : ''}{addr.apartment ? `${addr.apartment}, ` : ''}{addr.landmark ? `${addr.landmark}, ` : ''}{addr.area ? `${addr.area}, ` : ''}{addr.city || 'Pune'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-addresses-card">
                <MapPin size={32} className="no-addr-icon" />
                <p className="no-addr-msg">No saved delivery addresses found.</p>
                <button className="add-first-addr-btn" onClick={onOpenLocationModal}>
                  + Add Delivery Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
