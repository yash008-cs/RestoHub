import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Toast = () => {
  const { toast, hideToast } = useAuth();

  if (!toast || !toast.show) return null;

  return (
    <div className={`toast-notification-banner ${toast.type}`}>
      <div className="toast-content">
        {toast.type === 'success' ? (
          <CheckCircle size={20} className="toast-icon success" />
        ) : (
          <AlertCircle size={20} className="toast-icon error" />
        )}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close-btn" onClick={hideToast} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
};
