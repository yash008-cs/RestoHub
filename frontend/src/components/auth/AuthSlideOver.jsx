import React, { useState, useEffect } from 'react';
import { X, Lock, User, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthSlideOver = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    authError,
    loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Reset form inputs whenever modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setFormData({
        name: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLocalError('');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const isRegister = authModalMode === 'register';

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phoneNumber') {
      let digits = value.replace(/[^0-9]/g, '');
      if (digits.length > 10) {
        digits = digits.slice(-10);
      }
      value = digits;
    }
    setFormData({ ...formData, [e.target.name]: value });
    setLocalError('');
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setLocalError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({ name: '', phoneNumber: '', password: '', confirmPassword: '' });
  };

  const handleSwitchMode = (newMode) => {
    setAuthModalMode(newMode);
    setLocalError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({ name: '', phoneNumber: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLocalError('');

    if (isRegister) {
      // Registration Validation
      if (!formData.name.trim()) {
        setLocalError('Please enter your full name.');
        return;
      }
      if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
        setLocalError('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setLocalError('Password should contain at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }

      try {
        await register({
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password.trim(),
        });
        setFormData({ name: '', phoneNumber: '', password: '', confirmPassword: '' });
      } catch (err) {
        // Error handled in AuthContext
      }
    } else {
      // Customer Login Validation
      if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
        setLocalError('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!formData.password) {
        setLocalError('Please enter your password.');
        return;
      }

      try {
        await login(formData.phoneNumber.trim(), formData.password.trim());
        setFormData({ name: '', phoneNumber: '', password: '', confirmPassword: '' });
      } catch (err) {
        // Error handled in AuthContext
      }
    }
  };

  return (
    <div className="auth-overlay-wrapper">
      <div className="auth-backdrop" onClick={handleClose} />

      <div className="auth-slide-panel">
        {/* Header Close & Back */}
        <div className="auth-panel-header flex items-center justify-between">
          {isRegister ? (
            <button
              type="button"
              className="p-1.5 rounded-full text-slate-600 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => handleSwitchMode('login')}
              aria-label="Back to login"
            >
              <ArrowLeft size={22} />
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            className="p-1.5 rounded-full text-slate-600 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={handleClose}
            aria-label="Close authentication panel"
          >
            <X size={22} />
          </button>
        </div>

        <div className="auth-panel-body">
          {/* Form Header */}
          <div className="auth-hero-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <img src="/restohub-logo.png" alt="RestoHub Logo" className="auth-brand-logo-img" />
            <div className="auth-text-header">
              <h2 className="auth-main-title">
                {isRegister ? 'Create Account' : 'Customer Login'}
              </h2>
              <p className="auth-sub-subtitle">
                {isRegister
                  ? 'Join RestoHub today to order delicious food.'
                  : 'Login to continue ordering delicious food.'}
              </p>
            </div>
          </div>

          {/* Display Error Banner */}
          {(localError || authError) && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Form Element */}
          {isRegister ? (
            <form onSubmit={handleSubmit} className="auth-form-element" autoComplete="on">
              <div className="auth-input-group">
                <label className="auth-input-label">FULL NAME</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="auth-text-input"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">MOBILE NUMBER</label>
                <div className="phone-prefix-input-box">
                  <div className="country-code-prefix">+91</div>
                  <span className="phone-prefix-divider">|</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    className="phone-number-field"
                    maxLength={10}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">PASSWORD</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="auth-text-input"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">CONFIRM PASSWORD</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-field-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="auth-text-input"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-orange-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : 'CREATE ACCOUNT'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form-element" autoComplete="on">
              <div className="auth-input-group">
                <label className="auth-input-label">MOBILE NUMBER</label>
                <div className="phone-prefix-input-box">
                  <div className="country-code-prefix">+91</div>
                  <span className="phone-prefix-divider">|</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit mobile number"
                    className="phone-number-field"
                    maxLength={10}
                    autoComplete="tel username"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">PASSWORD</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="auth-text-input"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-orange-btn"
                disabled={loading}
              >
                {loading ? <span className="auth-spinner" /> : 'LOGIN'}
              </button>
            </form>
          )}

          {/* Mode Switch Link */}
          <div className="auth-bottom-switch-row">
            {!isRegister ? (
              <p className="auth-switch-text">
                New to RestoHub?{' '}
                <button
                  type="button"
                  className="auth-switch-link-btn"
                  onClick={() => handleSwitchMode('register')}
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="auth-switch-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link-btn"
                  onClick={() => handleSwitchMode('login')}
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
