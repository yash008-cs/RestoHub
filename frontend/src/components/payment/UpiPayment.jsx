import React, { useState } from 'react';
import { QrCode, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { validateUpiId } from '../../utils/validators';

export const UpiPayment = ({ onSelectPayment }) => {
  const [mode, setMode] = useState('id'); // 'id' | 'qr'
  const [upiId, setUpiId] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!validateUpiId(upiId)) {
      setError('Please enter a valid UPI ID (e.g. name@upi or mobile@upi)');
      setVerified(false);
      return;
    }
    setError('');
    setVerified(true);
    onSelectPayment({ type: 'UPI', details: `UPI ID: ${upiId}` });
  };

  const handleSelectQr = () => {
    setMode('qr');
    onSelectPayment({ type: 'UPI', details: 'Scan Demo QR Code' });
  };

  return (
    <div className="payment-sub-card">
      <h3 className="payment-section-title">Pay via UPI</h3>

      {/* Mode Selector Pills */}
      <div className="upi-mode-pills">
        <button
          type="button"
          className={`upi-pill-btn ${mode === 'id' ? 'active' : ''}`}
          onClick={() => setMode('id')}
        >
          <Smartphone size={16} />
          <span>Enter VPA / UPI ID</span>
        </button>
        <button
          type="button"
          className={`upi-pill-btn ${mode === 'qr' ? 'active' : ''}`}
          onClick={handleSelectQr}
        >
          <QrCode size={16} />
          <span>Scan QR Code</span>
        </button>
      </div>

      {mode === 'id' ? (
        <div className="upi-id-form-box">
          <label className="upi-form-label">UPI ID / VPA</label>
          <div className="upi-input-row">
            <input
              type="text"
              placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
              value={upiId}
              onChange={(e) => {
                setUpiId(e.target.value);
                setVerified(false);
                setError('');
              }}
              className="upi-text-input"
            />
            <button
              type="button"
              className="upi-verify-btn"
              onClick={handleVerify}
            >
              VERIFY & PAY
            </button>
          </div>

          {error && (
            <div className="upi-error-msg">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {verified && (
            <div className="upi-success-msg">
              <CheckCircle size={16} />
              <span>UPI ID Verified! Ready to proceed with payment.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="upi-qr-display-box">
          <div className="demo-qr-card">
            {/* SVG QR Code Simulation */}
            <div className="qr-box-simulated">
              <QrCode size={160} color="#0f172a" />
              <div className="qr-badge-demo">Demo Payment QR Code</div>
            </div>
            <p className="qr-instructions">
              Scan this QR code using any UPI App (GPay, PhonePe, Paytm) to simulate your order payment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
