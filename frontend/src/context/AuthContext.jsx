import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Toast Notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Load initial active session safely from localStorage / sessionStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const savedId = localStorage.getItem('restohub_user_id') || sessionStorage.getItem('restohub_user_id');

        if (savedId) {
          const user = await customerService.getCustomerById(Number(savedId));
          if (user) {
            setActiveUser(user);
            localStorage.setItem('restohub_user_id', String(user.id));
            sessionStorage.setItem('restohub_user_id', String(user.id));
          }
        }
      } catch (err) {
        console.warn('Could not restore session:', err.message);
        localStorage.removeItem('restohub_user_id');
        sessionStorage.removeItem('restohub_user_id');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Customer Login with Phone Number + Password
  const login = async (phoneNumber, password) => {
    setAuthError(null);
    try {
      setLoading(true);
      const res = await authService.login({ phoneNumber, password });
      const authenticatedUser = res.customer;

      if (authenticatedUser) {
        setActiveUser(authenticatedUser);
        localStorage.setItem('restohub_user_id', String(authenticatedUser.id));
        sessionStorage.setItem('restohub_user_id', String(authenticatedUser.id));
      }
      setIsAuthModalOpen(false);

      showToast(res.message || 'Logged in successfully', 'success');
      return authenticatedUser;
    } catch (err) {
      const msg = err.message || 'Invalid mobile number or password.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Register with Name, Phone Number + Password
  const register = async ({ name, phoneNumber, password }) => {
    setAuthError(null);
    try {
      setLoading(true);
      const res = await authService.register({ name, phoneNumber, password });
      const newCustomer = res.customer;

      if (newCustomer) {
        setActiveUser(newCustomer);
        sessionStorage.setItem('restohub_user_id', newCustomer.id);
      }
      setIsAuthModalOpen(false);

      showToast('Account created successfully!', 'success');
      return newCustomer;
    } catch (err) {
      const msg = err.message || 'Unable to create account. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (id, updatedData) => {
    try {
      const res = await customerService.updateCustomer(id, updatedData);
      setActiveUser(res);
      showToast('Profile updated successfully!', 'success');
      return res;
    } catch (err) {
      const msg = err.message || 'Failed to update profile.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setActiveUser(null);
    sessionStorage.removeItem('restohub_user_id');
    localStorage.removeItem('restohub_user_id');
    localStorage.removeItem('restohub_cart');
    localStorage.removeItem('restohub_cart_restaurant');
    localStorage.removeItem('restohub_target_append_order_id');
    
    // Dispatch custom event to notify CartContext to wipe cart state in memory
    window.dispatchEvent(new Event('restohub_logout'));

    setAuthError(null);
    setIsAuthModalOpen(false);
    setAuthModalMode('login');
    showToast('Logged out successfully. You are now browsing in preview mode.', 'info');
  };

  const openLogin = (initialMode = 'login') => {
    setAuthError(null);
    setAuthModalMode(initialMode);
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthError(null);
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        activeUser,
        isAuthenticated: !!activeUser,
        loading,
        authError,
        isAuthModalOpen,
        authModalMode,
        toast,
        showToast,
        hideToast,
        setIsAuthModalOpen,
        setAuthModalMode,
        openLogin,
        openRegister,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
