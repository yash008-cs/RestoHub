import React, { useState, useEffect } from 'react';
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
      if (authModalMode === 'login' || authModalMode === 'forgot-password') {
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
      }
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const isRegister = authModalMode === 'register';
  const isForgotPassword = authModalMode === 'forgot-password';
  const isVerifyOtp = authModalMode === 'verify-otp';
  const isResetPassword = authModalMode === 'reset-password';
  const isLogin = authModalMode === 'login';

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

    const email = formData.resetEmail?.trim();
    if (!email) {
      setLocalError('Please enter your registered email address.');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormData((prev) => ({ ...prev, otp: '' }));
      const res = await authService.forgotPassword(email);
      setLocalSuccess(res.message || 'Verification code sent to your email.');
      setCooldown(60); // 60s cooldown
      // Transition to OTP verification step
      setTimeout(() => {
        handleSwitchMode('verify-otp');
      }, 900);
    } catch (err) {
      setLocalError(err.message || 'No account found with this email.');
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
      setLocalError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.verifyResetOtp(email, otp);
      if (res.success) {
        setLocalSuccess('Code verified successfully.');
        // Immediately clear the verified OTP so it disappears and never reappears
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
      setLocalSuccess(res.message || 'A new verification code has been sent.');
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
            <img
              src="/restohub-logo.png"
              alt="RestoHub Logo"
              className="auth-brand-logo-img"
              style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
            />
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

              <button type="submit" className="auth-submit-orange-btn" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}

          {/* MODE: LOGIN */}
          {isLogin && (
            <form onSubmit={handleAuthSubmit} className="auth-form-element" autoComplete="off">
              <div className="auth-input-group">
                <label className="auth-input-label">EMAIL OR MOBILE NUMBER</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Enter email or 10-digit mobile"
                    className="auth-text-input"
                    autoComplete="off"
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
                <label className="auth-input-label">REGISTERED EMAIL ADDRESS</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-field-icon" />
                  <input
                    type="email"
                    name="resetEmail"
                    value={formData.resetEmail}
                    onChange={handleChange}
                    placeholder="Enter your registered email"
                    className="auth-text-input"
                    autoComplete="email"
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
              <p style={{ margin: '-0.35rem 0 0.35rem 0', color: '#64748b', fontSize: '0.88rem' }}>
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>{formData.resetEmail}</strong>
              </p>
              <div className="auth-input-group">
                <label className="auth-input-label">6-DIGIT VERIFICATION CODE</label>
                <div className="auth-input-wrapper">
                  <KeyRound size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder=""
                    className="auth-text-input"
                    maxLength={6}
                    style={{ letterSpacing: '0.35rem', fontWeight: 'bold', fontSize: '1.1rem' }}
                    autoComplete="off"
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
