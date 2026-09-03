import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, User, AlertCircle, Eye, EyeOff, ArrowLeft, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export const AuthSlideOver = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    authError,
    loading: authLoading,
  } = useAuth();

  // Mode: 'login' | 'register' | 'forgot-password' | 'verify-otp' | 'reset-password'
  const [formData, setFormData] = useState({
    name: '',
    email: '', // email for register
    identifier: '', // email or phone for login
    phoneNumber: '', // for register
    password: '',
    confirmPassword: '',
    resetEmail: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset errors and fields on modal open or mode change
  useEffect(() => {
    if (isAuthModalOpen) {
      setLocalError('');
      setLocalSuccess('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      if (authModalMode === 'login' || authModalMode === 'forgot-password' || authModalMode === 'register') {
        setFormData({
          name: '',
          email: '',
          identifier: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          resetEmail: '',
          otp: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    }
  }, [isAuthModalOpen, authModalMode]);

  const loginIdentifierInputRef = useRef(null);

  // Smart automated identifier detection for Login:
  // - Starts typing digits or pasted numbers -> activate phone mode (+91 appears)
  // - Starts typing letters or email symbols -> remain in standard email mode
  const trimmedId = (formData.identifier || '').trim();
  const isPhoneMode = Boolean(
    trimmedId.startsWith('+') ||
    (/^\d/.test(trimmedId) && !/[a-zA-Z@]/.test(trimmedId))
  );

  // Keep focus and cursor position smooth when phone mode toggles
  const prevIsPhoneMode = useRef(isPhoneMode);
  useEffect(() => {
    if (prevIsPhoneMode.current !== isPhoneMode && loginIdentifierInputRef.current) {
      prevIsPhoneMode.current = isPhoneMode;
      if (document.activeElement === loginIdentifierInputRef.current) {
        const len = loginIdentifierInputRef.current.value.length;
        loginIdentifierInputRef.current.setSelectionRange(len, len);
      }
    }
  }, [isPhoneMode]);

  const isRegister = authModalMode === 'register';
  const isForgotPassword = authModalMode === 'forgot-password';
  const isVerifyOtp = authModalMode === 'verify-otp';
  const isResetPassword = authModalMode === 'reset-password';
  const isLogin = authModalMode === 'login';

  const handleIdentifierChange = (e) => {
    let val = e.target.value;

    // Strip leading +91 or + if typed or pasted
    if (val.startsWith('+91')) {
      val = val.slice(3).trim();
    } else if (val.startsWith('+')) {
      val = val.slice(1).trim();
    }

    // If starts with digit and has no letters/@, treat as mobile number
    if (/^\d/.test(val.trim()) && !/[a-zA-Z@]/.test(val)) {
      let digits = val.replace(/[^0-9]/g, '');
      if (digits.length > 10) digits = digits.slice(0, 10);
      setFormData((prev) => ({ ...prev, identifier: digits }));
    } else {
      // Standard email or text credentials
      setFormData((prev) => ({ ...prev, identifier: val }));
    }
    setLocalError('');
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phoneNumber') {
      let digits = value.replace(/[^0-9]/g, '');
      if (digits.length > 10) digits = digits.slice(-10);
      value = digits;
    } else if (name === 'otp') {
      let digits = value.replace(/[^0-9]/g, '');
      if (digits.length > 6) digits = digits.slice(0, 6);
      value = digits;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setLocalError('');
    setLocalSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: '',
      email: '',
      identifier: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      resetEmail: '',
      otp: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  };

  const handleSwitchMode = (newMode) => {
    setAuthModalMode(newMode);
    setLocalError('');
    setLocalSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (newMode === 'forgot-password' || newMode === 'login') {
      setFormData((prev) => ({
        ...prev,
        otp: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    }
  };

  // Back button navigation
  const handleBack = () => {
    if (isVerifyOtp) {
      handleSwitchMode('forgot-password');
    } else if (isResetPassword) {
      handleSwitchMode('verify-otp');
    } else {
      handleSwitchMode('login');
    }
  };

  // Step 1: Send OTP
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const input = formData.resetEmail?.trim();
    if (!input) {
      setLocalError('Please enter your registered email address or mobile number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormData((prev) => ({ ...prev, otp: '' }));
      const res = await authService.forgotPassword(input);
      setLocalSuccess(res.message || 'Verification code sent to your registered email.');
      setCooldown(60); // 60s cooldown
      // Transition to OTP verification step
      setTimeout(() => {
        handleSwitchMode('verify-otp');
      }, 700);
    } catch (err) {
      setLocalError(err.message || 'No account found with this email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const email = formData.resetEmail?.trim();
    const otp = formData.otp?.trim();

    if (!otp || otp.length !== 6) {
      setLocalError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.verifyResetOtp(email, otp);
      if (res.success) {
        setLocalSuccess('Email verified successfully.');
        setFormData((prev) => ({ ...prev, otp: '' }));
        setTimeout(() => {
          handleSwitchMode('reset-password');
        }, 700);
      } else {
        setLocalError(res.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setLocalError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setLocalError('');
    setLocalSuccess('');
    setFormData((prev) => ({ ...prev, otp: '' }));

    const email = formData.resetEmail?.trim();
    try {
      setIsSubmitting(true);
      const res = await authService.resendResetOtp(email);
      setLocalSuccess(res.message || 'A new verification code has been sent to your email.');
      setCooldown(60);
    } catch (err) {
      setLocalError(err.message || 'Could not resend code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const email = formData.resetEmail?.trim();
    const { newPassword, confirmNewPassword } = formData;

    if (!newPassword || newPassword.length < 6) {
      setLocalError('Password should contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.resetPassword(email, newPassword.trim());
      setLocalSuccess(res.message || 'Password reset successfully! You can now log in.');
      // Pre-fill identifier for login and wipe out all OTP/reset fields
      setFormData((prev) => ({
        ...prev,
        identifier: email,
        password: '',
        otp: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
      setTimeout(() => {
        handleSwitchMode('login');
      }, 1500);
    } catch (err) {
      setLocalError(err.message || 'Could not reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login & Register handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (isRegister) {
      if (!formData.name.trim()) {
        setLocalError('Please enter your full name.');
        return;
      }
      const cleanEmail = (formData.email || '').trim();
      if (!cleanEmail) {
        setLocalError('Please enter your email address.');
        return;
      }
      if (!cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setLocalError('Please enter a valid email address.');
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
          email: cleanEmail,
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password.trim(),
        });
      } catch (err) {
        // Error handled in AuthContext
      }
    } else {
      // Login
      const idInput = formData.identifier?.trim();
      if (!idInput) {
        setLocalError('Please enter your email or 10-digit mobile number.');
        return;
      }
      if (isPhoneMode) {
        if (idInput.length !== 10) {
          setLocalError('Please enter a valid 10-digit mobile number.');
          return;
        }
      } else if (idInput.includes('@')) {
        if (!idInput.match(/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
          setLocalError('Please enter a valid email address.');
          return;
        }
      }
      if (!formData.password) {
        setLocalError('Please enter your password.');
        return;
      }

      try {
        await login(idInput, formData.password.trim());
        setFormData({
          name: '',
          identifier: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          resetEmail: '',
          otp: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } catch (err) {
        // Error handled in AuthContext
      }
    }
  };

  const isLoading = authLoading || isSubmitting;

  if (!isAuthModalOpen) return null;

  return (
    <div className="auth-overlay-wrapper">
      <div className="auth-backdrop" onClick={handleClose} />

      <div className="auth-slide-panel">
        {/* Header Close & Back */}
        <div className="auth-panel-header flex items-center justify-between">
          {!isLogin ? (
            <button
              type="button"
              className="p-1.5 rounded-full text-slate-600 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={handleBack}
              aria-label="Back"
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
          <div
            className="auth-hero-meta"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '0.65rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              className="ref-cloche-icon"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#fff7ed',
                border: '1px solid #ffedd5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title="RestoHub"
            >
              <svg viewBox="0 0 40 32" width="30" height="24" fill="none">
                <circle cx="20" cy="5" r="3" fill="#FC8019" />
                <path
                  d="M6 21 C6 11 12 7 20 7 C28 7 34 11 34 21 Z"
                  fill="#FC8019"
                />
                <rect x="3" y="23" width="34" height="4" rx="2" fill="#FC8019" />
              </svg>
            </div>
            <h2
              className="auth-main-title"
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {isRegister && 'Create Account'}
              {isLogin && 'Customer Login'}
              {isForgotPassword && 'Forgot Password'}
              {isVerifyOtp && 'Verify OTP'}
              {isResetPassword && 'Set New Password'}
            </h2>
          </div>

          {/* Display Error Banner */}
          {(localError || (isLogin && authError)) && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Display Success Banner */}
          {localSuccess && (
            <div className="auth-success-banner">
              <CheckCircle2 size={18} />
              <span>{localSuccess}</span>
            </div>
          )}

          {/* MODE: REGISTER */}
          {isRegister && (
            <form onSubmit={handleAuthSubmit} className="auth-form-element" autoComplete="on">
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
                <label className="auth-input-label">EMAIL ADDRESS</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-field-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="auth-text-input"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">MOBILE NUMBER</label>
                <div className="phone-prefix-input-box">
                  <div className="country-code-prefix select-none">+91</div>
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

              <button type="submit" className="auth-submit-orange-btn" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}

          {/* MODE: LOGIN */}
          {isLogin && (
            <form onSubmit={handleAuthSubmit} className="auth-form-element" autoComplete="off">
              <div className="auth-input-group">
                <label className="auth-input-label">
                  {isPhoneMode ? 'MOBILE NUMBER' : 'EMAIL OR MOBILE NUMBER'}
                </label>
                <div
                  className={isPhoneMode ? 'phone-prefix-input-box' : 'auth-input-wrapper'}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {isPhoneMode ? (
                    <>
                      <div className="country-code-prefix select-none">+91</div>
                      <span className="phone-prefix-divider">|</span>
                    </>
                  ) : (
                    <Mail size={18} className="auth-field-icon" />
                  )}
                  <input
                    ref={loginIdentifierInputRef}
                    type={isPhoneMode ? 'tel' : 'text'}
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleIdentifierChange}
                    placeholder={isPhoneMode ? 'Enter 10-digit mobile' : 'Enter email or 10-digit mobile'}
                    className={isPhoneMode ? 'phone-number-field' : 'auth-text-input'}
                    style={isPhoneMode ? { paddingLeft: 0 } : undefined}
                    maxLength={isPhoneMode ? 10 : 80}
                    autoComplete={isPhoneMode ? 'tel-national' : 'username'}
                    required
                  />
                  {formData.identifier && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, identifier: '' }));
                        loginIdentifierInputRef.current?.focus();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: isPhoneMode ? 'static' : 'absolute',
                        right: isPhoneMode ? undefined : '12px',
                      }}
                      title="Clear input"
                    >
                      <X size={16} />
                    </button>
                  )}
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                  <button
                    type="button"
                    className="auth-forgot-password-link"
                    onClick={() => handleSwitchMode('forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea580c',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c2410c')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ea580c')}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-orange-btn"
                disabled={isLoading}
              >
                {isLoading ? <span className="auth-spinner" /> : 'LOGIN'}
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD (STEP 1) */}
          {isForgotPassword && (
            <form onSubmit={handleForgotPasswordSubmit} className="auth-form-element">
              <div className="auth-input-group">
                <label className="auth-input-label">REGISTERED EMAIL OR MOBILE NUMBER</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    name="resetEmail"
                    value={formData.resetEmail}
                    onChange={handleChange}
                    placeholder="Enter registered email or 10-digit mobile"
                    className="auth-text-input"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-orange-btn"
                disabled={isLoading}
              >
                {isLoading ? <span className="auth-spinner" /> : 'SEND VERIFICATION CODE'}
              </button>
            </form>
          )}

          {/* MODE: VERIFY OTP (STEP 2) */}
          {isVerifyOtp && (
            <form onSubmit={handleVerifyOtpSubmit} className="auth-form-element">
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Mail size={22} style={{ color: '#ea580c', flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: '#9a3412', lineHeight: '1.35' }}>
                  A 6-digit verification code was sent to:
                  <br />
                  <strong style={{ color: '#7c2d12', fontWeight: 700 }}>{formData.resetEmail}</strong>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">6-DIGIT VERIFICATION CODE</label>
                <div className="auth-input-wrapper">
                  <KeyRound size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code from email"
                    className="auth-text-input"
                    maxLength={6}
                    style={{ letterSpacing: '0.25rem', fontWeight: 'bold', fontSize: '1.1rem' }}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span className="text-slate-500">Didn't receive code?</span>
                {cooldown > 0 ? (
                  <span className="text-slate-400 font-medium">Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea580c',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-orange-btn"
                disabled={isLoading || formData.otp.length !== 6}
              >
                {isLoading ? <span className="auth-spinner" /> : 'VERIFY CODE'}
              </button>
            </form>
          )}

          {/* MODE: SET NEW PASSWORD (STEP 3) */}
          {isResetPassword && (
            <form onSubmit={handleResetPasswordSubmit} className="auth-form-element">
              <div className="auth-input-group">
                <label className="auth-input-label">NEW PASSWORD</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
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
                <label className="auth-input-label">CONFIRM NEW PASSWORD</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-field-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
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

              <button
                type="submit"
                className="auth-submit-orange-btn"
                disabled={isLoading}
              >
                {isLoading ? <span className="auth-spinner" /> : 'RESET PASSWORD'}
              </button>
            </form>
          )}

          {/* Mode Switch Link */}
          <div className="auth-bottom-switch-row" style={{ marginTop: '1.5rem' }}>
            {isLogin && (
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
            )}

            {isRegister && (
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

            {(isForgotPassword || isVerifyOtp || isResetPassword) && (
              <p className="auth-switch-text">
                Remembered your password?{' '}
                <button
                  type="button"
                  className="auth-switch-link-btn"
                  onClick={() => handleSwitchMode('login')}
                >
                  Back to Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
