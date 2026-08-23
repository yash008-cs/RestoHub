import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, UserCheck } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

export const CustomerSelectorModal = ({ isOpen, onClose }) => {
  const { customers, activeCustomer, selectCustomer, registerNewCustomer } = useCustomer();
  const [tab, setTab] = useState('select'); // 'select' | 'register'
  
  // Registration Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic frontend validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await registerNewCustomer(formData);
      setFormData({ name: '', email: '', phone: '', password: '' });
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Active Customer Profile</h3>
          <button onClick={onClose} style={{ color: '#64748b' }}><X size={20} /></button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            className={`btn btn-sm ${tab === 'select' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('select')}
          >
            <UserCheck size={16} /> Select Profile ({customers.length})
          </button>
          <button
            className={`btn btn-sm ${tab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('register')}
          >
            <UserPlus size={16} /> Register New Customer
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-danger">{errorMsg}</div>
        )}

        {tab === 'select' ? (
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
              Select an active customer profile to place food orders and view customer order history:
            </p>
            {customers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>No customer profiles registered yet.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('register')}>
                  Create First Customer Profile
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                {customers.map((customer) => {
                  const isSelected = activeCustomer && activeCustomer.id === customer.id;
                  return (
                    <div
                      key={customer.id}
                      onClick={() => { selectCustomer(customer); onClose(); }}
                      style={{
                        padding: '0.9rem 1.1rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #ea580c' : '1px solid #e2e8f0',
                        background: isSelected ? '#ffedd5' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out',
                      }}
                    >
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{customer.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.email} • {customer.phone}</p>
                      </div>
                      {isSelected && <CheckCircle size={20} style={{ color: '#ea580c' }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
