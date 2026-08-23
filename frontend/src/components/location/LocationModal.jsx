import React, { useState } from 'react';
import { X, MapPin, Navigation, Home, Briefcase, Building } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { PUNE_AREAS, DEFAULT_CITY, DEFAULT_STATE } from '../../constants/defaultLocations';

export const LocationModal = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    savedAddresses,
    setSelectedAddress,
    updateLocation,
    addSavedAddress,
  } = useLocation();

  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'new'
  const [formData, setFormData] = useState({
    type: 'HOME',
    flatNo: '',
    apartment: '',
    landmark: '',
    area: 'Baner',
    city: DEFAULT_CITY,
    state: DEFAULT_STATE,
    pincode: '411045',
  });

  if (!isLocationModalOpen) return null;

  const handleSelectExisting = (addr) => {
    setSelectedAddress(addr);
    updateLocation({ area: addr.area, city: addr.city, state: addr.state });
    setIsLocationModalOpen(false);
  };

  const handleApplyNewAddress = (e) => {
    e.preventDefault();
    if (!formData.flatNo.trim()) return;

    addSavedAddress(formData);
    setIsLocationModalOpen(false);
  };

  return (
    <div className="location-modal-overlay">
      <div className="location-modal-card">
        {/* Header */}
        <div className="location-modal-header">
          <div className="location-title-box">
            <MapPin size={22} className="location-header-pin" />
            <h3>Select Delivery Location</h3>
          </div>
          <button className="location-close-btn" onClick={() => setIsLocationModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="location-tab-toggle">
          <button
            className={`location-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Addresses
          </button>
          <button
            className={`location-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            + Add New Address
          </button>
        </div>

        {/* Modal Body */}
        <div className="location-modal-body">
          {activeTab === 'saved' ? (
            <div className="saved-addresses-list">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="saved-address-card"
                  onClick={() => handleSelectExisting(addr)}
                >
                  <div className="addr-icon-box">
                    {addr.type === 'HOME' ? <Home size={18} /> : <Briefcase size={18} />}
                  </div>
                  <div className="addr-info-group">
                    <span className="addr-label">{addr.label || addr.type}</span>
                    <p className="addr-full-text">
                      {addr.flatNo}, {addr.apartment}, {addr.landmark}, {addr.area}, {addr.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleApplyNewAddress} className="new-address-form">
              <div className="addr-type-selector">
                <label className="form-sub-label">Save address as:</label>
                <div className="type-pills-row">
                  {['HOME', 'WORK', 'OTHER'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-pill ${formData.type === t ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, type: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="input-field-box">
                  <label>Flat No / House No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 304, Bldg A"
                    value={formData.flatNo}
                    onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                  />
                </div>

                <div className="input-field-box">
                  <label>Apartment Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenwood Society"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-field-box">
                <label>Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near High Street"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
              </div>

              <div className="form-grid-3col">
                <div className="input-field-box">
                  <label>Area / Locality</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  >
                    {PUNE_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-field-box">
                  <label>City</label>
                  <input type="text" value={formData.city} readOnly />
                </div>

                <div className="input-field-box">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>

              {/* Bottom Right Apply Button */}
              <div className="location-apply-wrapper">
                <button type="submit" className="location-apply-btn">
                  APPLY ADDRESS
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
