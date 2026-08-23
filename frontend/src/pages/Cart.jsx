import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Store, MapPin, Tag, Percent, Sparkles, CheckCircle2, Clock, Info, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { formatCurrency } from '../utils/formatters';
import { calculateCartBreakdown } from '../utils/pricingUtils';
import { getFoodImage, handleImageError, FALLBACK_FOOD_IMAGE } from '../utils/imageMapper';

export const Cart = ({ onNavigateCheckout, onNavigateRestaurants }) => {
  const { cartItems, restaurant, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, openLogin, showToast } = useAuth();
  const { currentLocation } = useLocation();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const userArea = currentLocation?.area || 'Sus';
  const breakdown = calculateCartBreakdown(cartItems, restaurant, userArea);

  const AVAILABLE_COUPONS = [
    { code: 'RESTO50', title: '50% OFF', desc: 'Up to ₹100 on first order' },
    { code: 'FREEDEL', title: 'FREE DEL', desc: 'Zero delivery charge' },
    { code: 'GOURMET150', title: '₹150 OFF', desc: 'On biryanis & combos' },
  ];

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page-empty-wrapper">
        <div className="cart-page-empty-card">
          <div className="empty-cart-illustration">
            <ShoppingCart size={64} className="empty-cart-icon" />
            <div className="empty-cart-badge">0</div>
          </div>
          <h2 className="empty-cart-title">Your Food Basket is Empty</h2>
          <p className="empty-cart-desc">
            Good food is always waiting for you! Explore Pune's top-rated restaurants & signature gourmet dishes.
          </p>

          <button className="browse-restaurants-hero-btn" onClick={onNavigateRestaurants}>
            <span>EXPLORE RESTAURANTS NEAR YOU</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const handleApplyPromoCode = (codeToApply) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) return;

    const matched = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (matched || code === 'RESTO50' || code === 'FREEDEL' || code === 'GOURMET150') {
      setAppliedPromo(code);
      setPromoCode(code);
      if (showToast) showToast(`Coupon ${code} applied successfully!`, 'success');
    } else {
      if (showToast) showToast('Invalid coupon code. Try RESTO50 or FREEDEL', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedPromo(null);
    setPromoCode('');
    if (showToast) showToast('Coupon removed', 'info');
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      if (showToast) showToast('Please login to proceed with your order', 'info');
      if (openLogin) openLogin('login');
      return;
    }
    onNavigateCheckout();
  };

  return (
    <div className="cart-page-container">
      {/* 1. Header Section */}
      <div className="cart-header-row">
        <div>
          <div className="cart-title-meta-group">
            <h1 className="cart-title">Your Food Basket</h1>
            <span className="cart-item-count-chip">
              {cartItems.length} {cartItems.length === 1 ? 'Dish' : 'Dishes'}
            </span>
          </div>
          <p className="cart-subtitle">Review items, apply discount coupons &amp; proceed to instant checkout</p>
        </div>

        {/* Clear Cart Action Button */}
        {showClearConfirm ? (
          <div className="clear-confirm-popover">
            <span>Clear basket?</span>
            <button
              className="confirm-yes-btn"
              onClick={() => {
                clearCart();
                setShowClearConfirm(false);
                if (showToast) showToast('Cart cleared', 'info');
              }}
            >
              Yes
            </button>
            <button className="confirm-no-btn" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="clear-cart-btn" onClick={() => setShowClearConfirm(true)}>
            <Trash2 size={14} />
            <span>Clear Basket</span>
          </button>
        )}
      </div>

      <div className="cart-main-grid">
        {/* Left Column: Items & Restaurant Details */}
        <div className="cart-items-column">
          {/* Restaurant Header Card */}
          {restaurant && (
            <div className="cart-restaurant-banner-card">
              <div className="resto-icon-badge">
                <Store size={22} color="#ea580c" />
              </div>
              <div className="resto-banner-info">
                <div className="resto-banner-title-row">
                  <h3>Ordering from {restaurant.name}</h3>
                  <span className="live-status-pill">
                    <Clock size={12} /> 25-30 min delivery
                  </span>
                </div>
                <span className="resto-banner-subloc">
                  <MapPin size={13} color="#ea580c" /> Delivering to <strong>{userArea}, Pune</strong>
                </span>
              </div>
            </div>
          )}

          {/* Cart Item Cards */}
          <div className="cart-items-list-card">
            {cartItems.map(({ food, quantity }) => {
              const dishImg = getFoodImage(food);

              return (
                <div key={food.id} className="cart-item-row-interactive">
                  {/* Dish Thumbnail */}
                  <div className="cart-item-thumb-box">
                    <img
                      src={dishImg}
                      alt={food.name}
                      className="cart-dish-cover-img"
                      onError={(e) => handleImageError(e, FALLBACK_FOOD_IMAGE)}
                    />
                  </div>

                  {/* Dish Meta */}
                  <div className="item-meta-content">
                    <h4 className="item-title-text">{food.name}</h4>
                    <span className="item-price-per-unit">
                      {formatCurrency(food.price)} <span className="unit-label">per item</span>
                    </span>
                  </div>

                  {/* Quantity Stepper & Price Action */}
                  <div className="item-actions-group">
                    <div className="quantity-stepper-modern">
                      <button
                        className="stepper-btn minus"
                        onClick={() => updateQuantity(food.id, -1)}
                        title="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="stepper-value">{quantity}</span>
                      <button
                        className="stepper-btn plus"
                        onClick={() => updateQuantity(food.id, 1)}
                        title="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span className="item-line-total-price">
                      {formatCurrency(Number(food.price) * quantity)}
                    </span>

                    <button
                      className="remove-dish-icon-btn"
                      onClick={() => removeFromCart(food.id)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Coupons & Promo Codes Section */}
          <div className="cart-coupon-card">
            <div className="coupon-header-row">
              <div className="coupon-header-title">
                <Tag size={20} className="tag-icon-highlight" />
                <span>Apply Coupons &amp; Offers</span>
              </div>
              {appliedPromo && (
                <div className="active-coupon-badge-group">
                  <span className="active-coupon-badge">
                    <CheckCircle2 size={14} /> Coupon <strong>{appliedPromo}</strong> Applied
                  </span>
                  <button
                    type="button"
                    className="remove-coupon-btn"
                    onClick={handleRemoveCoupon}
                    title="Remove coupon"
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              )}
            </div>

            {/* Quick Coupon Chips */}
            <div className="quick-coupons-chips-row">
              {AVAILABLE_COUPONS.map((coupon) => (
                <div
                  key={coupon.code}
                  className={`coupon-chip-card ${appliedPromo === coupon.code ? 'active' : ''}`}
                  onClick={() => {
                    if (appliedPromo === coupon.code) {
                      handleRemoveCoupon();
                    } else {
                      handleApplyPromoCode(coupon.code);
                    }
                  }}
                >
                  <div className="coupon-chip-top">
                    <span className="coupon-chip-code">{coupon.code}</span>
                    <span className="coupon-chip-tag">{coupon.title}</span>
                  </div>
                  <span className="coupon-chip-desc">{coupon.desc}</span>
                </div>
              ))}
            </div>

            {/* Custom Coupon Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyPromoCode();
              }}
              className="coupon-input-form"
            >
              <input
                type="text"
                className="coupon-input-field"
                placeholder="Enter promo code (e.g. RESTO50)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button type="submit" className="apply-coupon-submit-btn">
                APPLY CODE
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Bill Summary */}
        <div className="cart-bill-column">
          <div className="bill-summary-sticky-card">
            <h3 className="bill-summary-title">Bill Summary</h3>

            <div className="bill-detail-rows-group">
              <div className="bill-detail-row">
                <span className="bill-label">Item Total</span>
                <span className="bill-value">{formatCurrency(breakdown.subtotal)}</span>
              </div>

              <div className="bill-detail-row">
                <span className="bill-label flex items-center gap-1">
                  Delivery Fee ({breakdown.distanceKm} kms)
                  <span className="info-tooltip-trigger" title="Distance based delivery fee">
                    <Info size={13} />
                  </span>
                </span>
                <span className="bill-value">
                  {breakdown.baseDeliveryCharge === 0 && breakdown.distanceCharge === 0 ? (
                    <>
                      <span className="striked-price">₹45.00</span>
                      <strong className="free-tag">FREE</strong>
                    </>
                  ) : (
                    formatCurrency(breakdown.baseDeliveryCharge + breakdown.distanceCharge)
                  )}
                </span>
              </div>

              <div className="bill-detail-row">
                <span className="bill-label flex items-center gap-1">
                  GST &amp; Packaging
                  <span className="info-tooltip-trigger" title="5% GST and packaging charges">
                    <Info size={13} />
                  </span>
                </span>
                <span className="bill-value">{formatCurrency(breakdown.taxes)}</span>
              </div>

              {appliedPromo && (
                <div className="bill-detail-row discount-row">
                  <span className="bill-label flex items-center gap-1">
                    <Sparkles size={14} color="#16a34a" /> Coupon Discount ({appliedPromo})
                  </span>
                  <div className="discount-value-action-group">
                    <span className="bill-value discount-value">-₹50.00</span>
                    <button
                      type="button"
                      className="bill-remove-coupon-btn"
                      onClick={handleRemoveCoupon}
                      title="Remove coupon"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bill-divider-line" />

            <div className="bill-detail-row grand-total-row">
              <div>
                <span className="grand-total-label">TO PAY</span>
                <span className="tax-inclusive-subtext">Inclusive of all taxes</span>
              </div>
              <span className="grand-total-amount">
                {formatCurrency(appliedPromo ? Math.max(0, breakdown.finalTotal - 50) : breakdown.finalTotal)}
              </span>
            </div>

            <div className="safety-guarantee-box">
              <ShieldCheck size={18} className="safety-shield-icon" />
              <span>100% Safe &amp; Contactless Delivery</span>
            </div>

            {restaurant?.acceptingOrders === false && (
              <div className="resto-closed-warning-box">
                <span>🔴 {restaurant.name} is not accepting orders right now.</span>
              </div>
            )}

            <button
              className={`checkout-primary-action-btn ${restaurant?.acceptingOrders === false ? 'disabled' : ''}`}
              onClick={() => {
                if (restaurant?.acceptingOrders === false) {
                  if (showToast) showToast(`${restaurant.name} is closed right now.`, 'error');
                  return;
                }
                handleProceedToCheckout();
              }}
              disabled={restaurant?.acceptingOrders === false}
            >
              <span>{restaurant?.acceptingOrders === false ? 'RESTAURANT CLOSED' : 'PROCEED TO CHECKOUT'}</span>
              <ArrowRight size={18} className="arrow-icon-animated" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
