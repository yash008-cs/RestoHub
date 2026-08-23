import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/orderService';

const ORDER_STATUSES = [
  { value: 'PLACED', label: 'Placed' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const StatusUpdateModal = ({ isOpen, onClose, order, onStatusUpdated }) => {
  const [selectedStatus, setSelectedStatus] = useState(order ? order.status : 'PLACED');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      setSubmitting(true);
      const updatedOrder = await orderService.updateOrderStatus(order.id, selectedStatus);
      if (onStatusUpdated) onStatusUpdated(updatedOrder);
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
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw style={{ color: '#ea580c' }} /> Update Order #{order.id} Status
          </h3>
          <button onClick={onClose} style={{ color: '#64748b' }}><X size={20} /></button>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Status: <strong>{order.status}</strong></label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.value})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Save New Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
