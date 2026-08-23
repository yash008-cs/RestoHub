import React, { useEffect } from 'react';
import { ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RazorpayPayment = ({ payableAmount = 0, onSelectPayment }) => {
  useEffect(() => {
    onSelectPayment({
      type: 'RAZORPAY',
      details: 'Pay Online',
    });
  }, [payableAmount, onSelectPayment]);

  return (
    <div className="payment-sub-card">
      <div className="cod-header-row">
        <div className="cod-icon-badge" style={{ background: '#fff7ed', borderColor: '#ffedd5' }}>
          <ShieldCheck size={24} color="#ea580c" />
        </div>
        <div className="cod-title-meta">
          <h3 className="payment-section-title">Pay Online</h3>
          <p className="cod-description-text">
            Pay safely using Credit/Debit Cards, UPI (GPay, PhonePe), NetBanking, or Wallets.
          </p>
        </div>
      </div>

      <div className="cod-amount-box">
        <span className="cod-label">
          Final Payable Amount: <strong>{formatCurrency(payableAmount)}</strong>
        </span>
        <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} /> 100% Safe &amp; Instant Checkout
        </div>
      </div>

      <div className="cod-note-banner">
        <CreditCard size={16} />
        <span>100% Encrypted &amp; Secure Payment Processing.</span>
      </div>
    </div>
  );
};
