import React, { useState } from 'react';
import { CheckCircle2, MapPin, CreditCard, ShieldCheck, ArrowRight, Home, Briefcase, Plus, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { PaymentMethodSelector } from '../components/payment/PaymentMethodSelector';
import { formatCurrency } from '../utils/formatters';
import { calculateCartBreakdown } from '../utils/pricingUtils';
import { paymentService } from '../services/paymentService';

export const Checkout = ({ onOrderPlaced, onOpenLocationModal }) => {
  const { cartItems, restaurant, checkout } = useCart();
  const { activeUser } = useAuth();
  const { savedAddresses, selectedAddress, setSelectedAddress, currentLocation } = useLocation();

  const [step, setStep] = useState(1); // Step 1: Address, Step 2: Payment, Step 3: Confirmation
  const [selectedPaymentMeta, setSelectedPaymentMeta] = useState({
    type: 'RAZORPAY',
    details: 'Pay Online',
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const deliveryLocality = selectedAddress?.area || currentLocation?.area || 'Sus';
  const breakdown = calculateCartBreakdown(cartItems, restaurant, deliveryLocality);
  const finalTotal = breakdown.finalTotal;

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setStep(2);
  };

  const handlePaymentSuccess = async (rzpResponse, verifyResult) => {
    try {
      setPlacingOrder(true);
      const createdOrder = await checkout(
        activeUser.id,
        selectedAddress?.area || currentLocation?.area || 'Sus'
      );
      setConfirmedOrder({
        ...createdOrder,
        paymentDetails: {
          type: 'RAZORPAY',
          details: `RestoHub Custom Checkout (Verified Payment ID: ${rzpResponse.razorpay_payment_id})`,
          razorpayPaymentId: rzpResponse.razorpay_payment_id,
          razorpayOrderId: rzpResponse.razorpay_order_id,
          razorpaySignature: rzpResponse.razorpay_signature,
          verified: true,
        },
        deliveryAddress: selectedAddress,
        finalTotal: createdOrder.totalAmount || finalTotal,
      });
      setStep(3);
      if (onOrderPlaced) onOrderPlaced(createdOrder);
    } catch (err) {
      setOrderError(err.message || 'Failed to complete order after payment verification.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentError = (errMsg) => {
    setOrderError(errMsg || 'Payment failed. Your order has not been confirmed. Please try again.');
    setPlacingOrder(false);
  };

  const handleConfirmOrder = async () => {
    if (!activeUser) {
      setOrderError('You must be logged in to place an order.');
      return;
    }
    if (!selectedAddress) {
      setOrderError('Please select a delivery address.');
      return;
    }
    if (!selectedPaymentMeta) {
      setOrderError('Please select a payment method.');
      return;
    }

    setOrderError('');

    // --- RAZORPAY ONLINE PAYMENT FLOW ---
    if (selectedPaymentMeta?.type === 'RAZORPAY') {
      setPlacingOrder(true);
      try {
        const scriptLoaded = await paymentService.loadRazorpayCustomScript();
        if (!scriptLoaded) {
          setOrderError('Failed to load Razorpay Custom Checkout SDK. Please check your internet connection.');
          setPlacingOrder(false);
          return;
        }

        // Call backend POST /api/payments/create-order with amount in RUPEES
        const razorpayOrder = await paymentService.createRazorpayOrder(finalTotal);

        if (!razorpayOrder || !razorpayOrder.razorpayOrderId) {
          throw new Error('Failed to initialize Razorpay payment order');
        }

        const options = {
          key: razorpayOrder.keyId,
          amount: razorpayOrder.amountInPaise,
          currency: razorpayOrder.currency || 'INR',
          name: 'RestoHub',
          description: 'RestoHub Food Order',
          order_id: razorpayOrder.razorpayOrderId,
          prefill: {
            name: activeUser?.name || activeUser?.username || '',
            email: activeUser?.email || '',
            contact: activeUser?.phone || '',
          },
          theme: {
            color: '#ea580c',
          },
          handler: async function (response) {
            try {
              const verifyRes = await paymentService.verifyPaymentSignature({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (!verifyRes || !verifyRes.verified) {
                setOrderError('Payment verification failed on server. Please try again.');
                return;
              }

              await handlePaymentSuccess(response, verifyRes);
            } catch (err) {
              setOrderError('Payment verification failed. Please try again.');
            } finally {
              setPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: function () {
              setPlacingOrder(false);
              setOrderError('Payment cancelled. You can try again.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failure) {
          setPlacingOrder(false);
          setOrderError('Payment failed. Please try again.');
        });
        rzp.open();
      } catch (err) {
        setPlacingOrder(false);
        setOrderError(err.message || 'Failed to initiate Razorpay Custom Checkout. Please try again.');
      }
      return;
    }

    // --- STANDARD COD / OTHER PAYMENT FLOW ---
    try {
      setPlacingOrder(true);
      const createdOrder = await checkout(activeUser.id, selectedAddress?.area || currentLocation?.area || 'Sus');
      setConfirmedOrder({
        ...createdOrder,
        paymentDetails: selectedPaymentMeta,
        deliveryAddress: selectedAddress,
        finalTotal: createdOrder.totalAmount || finalTotal,
      });
      setStep(3);
      if (onOrderPlaced) onOrderPlaced(createdOrder);
    } catch (err) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (step === 3 && confirmedOrder) {
    return (
      <div className="order-confirmation-container">
        <div className="confirmation-card">
          <div className="success-icon-box">
            <CheckCircle2 size={64} color="#16a34a" />
          </div>
          <h2>Order Placed Successfully!</h2>
          <p className="conf-sub">Thank you for ordering with RestoHub. Your food is being prepared.</p>

          <div className="conf-details-box">
            <div className="conf-row">
              <span className="label">Order ID:</span>
              <strong className="value">#{confirmedOrder.id}</strong>
            </div>

            <div className="conf-row">
              <span className="label">Restaurant:</span>
              <span className="value">{restaurant?.name || confirmedOrder.restaurantName || 'Gourmet Kitchen'}</span>
            </div>

            <div className="conf-row">
              <span className="label">Total Amount:</span>
              <strong className="value-price">{formatCurrency(confirmedOrder.totalAmount || confirmedOrder.finalTotal || finalTotal)}</strong>
            </div>

            <div className="conf-row">
              <span className="label">Payment Method:</span>
              <span className="value">{confirmedOrder.paymentDetails?.details || 'Pay on Delivery'}</span>
            </div>

            <div className="conf-row">
              <span className="label">Delivery Address:</span>
              <span className="value">{confirmedOrder.deliveryAddress?.flatNo}, {confirmedOrder.deliveryAddress?.area}, {confirmedOrder.deliveryAddress?.city}</span>
            </div>
          </div>

          <button className="back-home-btn" onClick={() => window.location.reload()}>
            BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <h1 className="checkout-page-title">Checkout</h1>

      {orderError && (
        <div className="checkout-error-banner">
          <AlertCircle size={18} />
          <span>{orderError}</span>
        </div>
      )}

      <div className="checkout-main-layout">
        {/* Left Column: Steps */}
        <div className="checkout-steps-column">
          {/* STEP 1: Delivery Address */}
          <div className={`checkout-step-card ${step === 1 ? 'active' : 'completed'}`}>
            <div className="step-card-header" onClick={() => setStep(1)}>
              <div className="step-num">1</div>
              <div className="step-title-meta">
                <h2>Select Delivery Address</h2>
                {selectedAddress && step > 1 && (
                  <p className="selected-summary">
                    {selectedAddress.label} • {selectedAddress.flatNo}, {selectedAddress.area}
                  </p>
                )}
              </div>
            </div>

            {step === 1 && (
              <div className="step-body-content">
                <div className="saved-addresses-grid">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    const cleanLandmark = addr.landmark
                      ? (addr.landmark.toLowerCase().startsWith('near') ? addr.landmark : `Near ${addr.landmark}`)
                      : '';

                    return (
                      <div
                        key={addr.id}
                        className={`address-select-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectAddress(addr)}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div className="addr-header-row">
                              <div className="addr-icon-badge">
                                {addr.type === 'HOME' ? <Home size={16} /> : <Briefcase size={16} />}
                              </div>
                              <span className="type-title">{addr.label}</span>
                            </div>

                            {isSelected && (
                              <span className="selected-badge">
                                <CheckCircle2 size={13} />
                                <span>SELECTED</span>
                              </span>
                            )}
                          </div>

                          <div className="addr-full-desc">
                            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', marginBottom: '2px' }}>{addr.flatNo}</p>
                            <p style={{ color: '#475569', fontSize: '0.82rem', marginBottom: '2px' }}>{addr.apartment}</p>
                            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                              {cleanLandmark ? `${cleanLandmark}, ` : ''}{addr.area}, {addr.city}
                            </p>
                          </div>
                        </div>

                        <button className="deliver-here-btn">
                          {isSelected ? 'DELIVERING HERE' : 'DELIVER HERE'}
                        </button>
                      </div>
                    );
                  })}

                  {/* Add New Address Card Box */}
                  <div
                    className="add-new-address-card"
                    onClick={onOpenLocationModal}
                    title="Add a new delivery address"
                  >
                    <div className="add-icon-circle">
                      <Plus size={22} />
                    </div>
                    <div>
                      <span className="add-title">ADD NEW ADDRESS</span>
                      <p className="add-sub">Deliver to a new location in Pune</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method */}
          <div className={`checkout-step-card ${step === 2 ? 'active' : ''}`}>
            <div className="step-card-header">
              <div className="step-num">2</div>
              <div className="step-title-meta">
                <h2>Payment Options</h2>
                <p className="sub">Choose how you would like to pay</p>
              </div>
            </div>

            {step === 2 && (
              <div className="step-body-content">
                <PaymentMethodSelector
                  payableAmount={finalTotal}
                  onSelectPaymentOption={(meta) => setSelectedPaymentMeta(meta)}
                  activeUser={activeUser}
                  selectedAddress={selectedAddress}
                  currentLocation={currentLocation}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  restaurantAcceptingOrders={restaurant?.acceptingOrders !== false}
                />

                {restaurant?.acceptingOrders === false && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <span>🔴 This restaurant is not accepting orders right now. Please choose an active restaurant.</span>
                  </div>
                )}

                <div className="place-order-actions-bar">
                  <button
                    className={`place-order-final-btn ${restaurant?.acceptingOrders === false ? 'opacity-50 cursor-not-allowed bg-slate-400' : ''}`}
                    onClick={() => {
                      if (restaurant?.acceptingOrders === false) {
                        setOrderError('This restaurant is currently not accepting orders right now. Please choose an active restaurant.');
                        return;
                      }
                      handleConfirmOrder();
                    }}
                    disabled={placingOrder || restaurant?.acceptingOrders === false}
                  >
                    {restaurant?.acceptingOrders === false
                      ? 'RESTAURANT NOT ACCEPTING ORDERS'
                      : placingOrder
                      ? 'PLACING ORDER...'
                      : selectedPaymentMeta?.type === 'CASH_ON_DELIVERY'
                      ? 'PLACE ORDER'
                      : `PAY ${formatCurrency(finalTotal)} & PLACE ORDER`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Items Summary */}
        <div className="checkout-summary-column">
          <div className="summary-card">
            <h3>Order Summary ({restaurant?.name || 'Gourmet Dining'})</h3>
            <div className="summary-items-list">
              {cartItems.map(({ food, quantity }) => (
                <div key={food.id} className="summary-item-row">
                  <span className="qty">{quantity}x</span>
                  <span className="name">{food.name}</span>
                  <span className="price">{formatCurrency(Number(food.price) * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="bill-breakdown-box">
              <div className="row">
                <span>Item Total</span>
                <span>{formatCurrency(breakdown.subtotal)}</span>
              </div>

              <div className="row">
                <span>
                  Delivery Fee | {breakdown.distanceKm} kms <span className="info-icon" title="Distance-based delivery fee" style={{ cursor: 'pointer', color: '#64748b' }}>ⓘ</span>
                </span>
                <span>
                  {breakdown.baseDeliveryCharge === 0 && breakdown.distanceCharge === 0 ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '6px', fontSize: '0.85rem' }}>
                        ₹45.00
                      </span>
                      <strong style={{ color: '#16a34a' }}>FREE</strong>
                    </>
                  ) : (
                    formatCurrency(breakdown.baseDeliveryCharge + breakdown.distanceCharge)
                  )}
                </span>
              </div>

              <div className="row">
                <span>
                  GST &amp; Other Charges <span className="info-icon" title="5% GST and packaging charges" style={{ cursor: 'pointer', color: '#64748b' }}>ⓘ</span>
                </span>
                <span>{formatCurrency(breakdown.taxes)}</span>
              </div>

              <div className="divider" />

              <div className="row grand">
                <span style={{ textTransform: 'uppercase', fontWeight: 800 }}>TO PAY</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
