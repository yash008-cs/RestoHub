import React, { useEffect } from 'react';
import { Banknote, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CodPayment = ({ payableAmount = 0, onSelectPayment }) => {
  useEffect(() => {
    onSelectPayment({
      type: 'CASH_ON_DELIVERY',
      details: 'Pay on Delivery (Cash/UPI)',
    });
  }, [payableAmount]);

  return (
    <div className="payment-sub-card">
      <div className="cod-header-row">
        <div className="cod-icon-badge">
          <Banknote size={24} color="#16a34a" />
        </div>
        <div className="cod-title-meta">
          <h3 className="payment-section-title">Pay on Delivery (Cash/UPI)</h3>
          <p className="cod-description-text">
            Pay cash or ask for a QR code from the delivery partner at the time of delivery.
          </p>
        </div>
      </div>

      <div className="cod-amount-box">
        <span className="cod-label">Final Payable Amount: <strong>{formatCurrency(payableAmount)}</strong></span>
        <button type="button" className="cod-pay-action-btn">
          PLACE ORDER
        </button>
      </div>

      <div className="cod-note-banner">
        <ShieldAlert size={16} />
        <span>Please keep exact change ready to ensure a smooth delivery experience.</span>
      </div>
    </div>
  );
};
