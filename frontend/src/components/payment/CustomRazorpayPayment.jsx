import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { paymentService } from '../../services/paymentService';

export const CustomRazorpayPayment = ({
  payableAmount = 0,
  activeUser,
  selectedAddress,
  currentLocation,
  onPaymentSuccess,
  onPaymentError,
  restaurantAcceptingOrders = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePayNow = async () => {
    if (!restaurantAcceptingOrders) {
      setErrorMsg('This restaurant is currently not accepting orders.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setLoadingMessage('Creating secure payment session...');

    try {
      // 1. Load official Razorpay Checkout SDK (v1/checkout.js)
      const sdkLoaded = await paymentService.loadRazorpayCustomScript();
      if (!sdkLoaded) {
        throw new Error('Failed to initialize payment engine. Please check your network connection.');
      }

      // 2. Call backend POST /api/payments/create-order with amount in RUPEES
      setLoadingMessage('Creating payment order...');
      const orderData = await paymentService.createRazorpayOrder(payableAmount);

      if (!orderData || !orderData.razorpayOrderId) {
        throw new Error('Failed to create payment order on server.');
      }

      setLoadingMessage('Opening secure payment gateway...');

      // 3. Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'RestoHub',
        description: 'RestoHub Food Order Payment',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: activeUser?.name || activeUser?.username || '',
          email: activeUser?.email || 'customer@restohub.com',
          contact: activeUser?.phone || '9876543210',
        },
        notes: {
          restoHubOrderId: '',
        },
        theme: {
          color: '#ea580c',
        },
        handler: async function (response) {
          try {
            setLoading(true);
            setLoadingMessage('Verifying payment signature on server...');

            const verificationResult = await paymentService.verifyPaymentSignature({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!verificationResult || !verificationResult.verified) {
              setErrorMsg('Payment verification failed on server. Please contact support.');
              if (onPaymentError) onPaymentError('Payment verification failed.');
              setLoading(false);
              return;
            }

            setLoadingMessage('Payment verified! Finalizing your order...');
            if (onPaymentSuccess) {
              await onPaymentSuccess(response, verificationResult);
            }
          } catch (verifyErr) {
            console.error('Signature verification error:', verifyErr);
            setErrorMsg('Failed to verify payment signature on server.');
            if (onPaymentError) onPaymentError(verifyErr.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setLoadingMessage('');
            setErrorMsg('Payment session was cancelled. You can try again anytime.');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (failure) {
        setLoading(false);
        setLoadingMessage('');
        const desc = failure?.error?.description || 'Payment failed. Please try another payment method.';
        setErrorMsg(`Payment Failed: ${desc}`);
        if (onPaymentError) onPaymentError(desc);
      });

      // Launch Razorpay Checkout Modal
      if (rzp && typeof rzp.open === 'function') {
        rzp.open();
      } else {
        throw new Error('Payment gateway is re-initializing. Please click Pay again.');
      }

      // Release loading state after 1.5 seconds
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage('');
      }, 1500);

    } catch (err) {
      console.error('Online Payment error:', err);
      setLoading(false);
      setLoadingMessage('');
      setErrorMsg(err.message || 'Failed to process payment. Please try again.');
      if (onPaymentError) onPaymentError(err.message);
    }
  };

  return (
    <div className="restohub-custom-payment-card" style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      padding: '1.5rem',
      marginBottom: '1rem'
    }}>
      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1.2rem',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontWeight: 800, fontSize: '1.1rem' }}>
            <ShieldCheck size={22} />
            <span>Pay Online</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '3px' }}>
            Fast, 100% encrypted &amp; secure instant payment
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Total Amount</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
            {formatCurrency(payableAmount)}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Supported Instruments Showcase Grid */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={16} color="#ea580c" />
          <span>All Payment Options Supported:</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem'
        }}>
          {/* Card 1: Cards */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#ea580c', padding: '0.5rem', borderRadius: '8px' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Credit / Debit Cards</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Visa, Mastercard, RuPay, Amex</div>
            </div>
          </div>

          {/* Card 2: UPI */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', color: '#16a34a', padding: '0.5rem', borderRadius: '8px' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>UPI &amp; QR</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>GPay, PhonePe, Paytm, BHIM</div>
            </div>
          </div>

          {/* Card 3: NetBanking */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb', padding: '0.5rem', borderRadius: '8px' }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Net Banking</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>SBI, HDFC, ICICI &amp; 50+ Banks</div>
            </div>
          </div>

          {/* Card 4: Wallets */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <div style={{ background: '#faf5ff', border: '1px solid #f3e8ff', color: '#9333ea', padding: '0.5rem', borderRadius: '8px' }}>
              <Wallet size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Wallets &amp; Pay Later</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Paytm, MobiKwik, LazyPay</div>
            </div>
          </div>
        </div>
      </div>



      {/* Main Action Proceed Button */}
      <button
        type="button"
        onClick={handlePayNow}
        disabled={loading || !restaurantAcceptingOrders}
        style={{
          width: '100%',
          padding: '0.95rem',
          borderRadius: '12px',
          border: 'none',
          background: loading || !restaurantAcceptingOrders ? '#94a3b8' : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1.05rem',
          cursor: loading || !restaurantAcceptingOrders ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
          transition: 'all 0.2s ease'
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>{loadingMessage || 'PROCESSING PAYMENT...'}</span>
          </>
        ) : (
          <>
            <Lock size={18} />
            <span>PROCEED TO PAY {formatCurrency(payableAmount)} &amp; PLACE ORDER</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
};
