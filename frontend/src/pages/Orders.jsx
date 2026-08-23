import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Utensils,
  ArrowRight,
  XCircle,
  X,
  UserCheck,
  ArrowLeft,
  Receipt,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  getOrderTimestampMs,
  calculateEstimatedTimings,
  getOrderTrackingInfo,
  getStatusDisplayMeta,
} from '../utils/orderTrackingUtils';

export const Orders = ({ onSelectRestaurant, selectedOrderId, onClearSelectedOrder }) => {
  const { activeUser, loading: authLoading, openLogin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('ACTIVE'); // 'ACTIVE' | 'COMPLETED'
  const [nowMs, setNowMs] = useState(Date.now());
  const [cancelModal, setCancelModal] = useState({ show: false, order: null, loading: false });
  const [cancelNotification, setCancelNotification] = useState({ show: false, orderId: null });
  const [activeDetailedOrderId, setActiveDetailedOrderId] = useState(selectedOrderId || null);

  useEffect(() => {
    if (selectedOrderId) {
      setActiveDetailedOrderId(selectedOrderId);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    if (activeDetailedOrderId) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeDetailedOrderId]);

  // 1-second live clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    if (!activeUser) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getCustomerOrders(activeUser.id);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      setError(err.message || 'Unable to fetch orders from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [activeUser, authLoading]);

  const handleOpenCancelModal = (order) => {
    setCancelModal({ show: true, order, loading: false });
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelModal.order) return;
    const canceledId = cancelModal.order.id;
    try {
      setCancelModal((prev) => ({ ...prev, loading: true }));
      await orderService.cancelOrder(canceledId);

      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === canceledId ? { ...o, status: 'CANCELLED' } : o))
      );
      setCancelModal({ show: false, order: null, loading: false });

      // Notify other components (e.g. LiveOrderBanner) immediately
      window.dispatchEvent(new CustomEvent('restohub_order_cancelled', { detail: { orderId: canceledId } }));

      // Trigger top-right notification toast
      setCancelNotification({ show: true, orderId: canceledId });
      setTimeout(() => {
        setCancelNotification({ show: false, orderId: null });
      }, 4500);
    } catch (err) {
      alert(err.message || 'Failed to cancel order. Please try again.');
      setCancelModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const userArea = (() => {
    try {
      const loc = localStorage.getItem('restohub_user_location');
      return loc ? JSON.parse(loc).area || 'Sus' : 'Sus';
    } catch {
      return 'Sus';
    }
  })();

  const processOrderList = (orderList) => {
    if (!orderList || orderList.length === 0) return [];
    return orderList.map((ord) => ({
      ...ord,
      displayOrderId: `#${ord.id}`,
      totalAmount: Number(ord.totalAmount) || 0,
      items: (ord.items || []).map((item) => ({ ...item, quantity: item.quantity || 1 })),
    }));
  };

  const isRawOrderActive = (ord) => {
    const status = String(ord.status || '').toUpperCase();
    if (status === 'COMPLETED' || status === 'CANCELLED') return false;

    const info = getOrderTrackingInfo(ord, nowMs, userArea);
    return info && info.elapsedSeconds < info.timings.totalSeconds + 10;
  };

  const processedAll = processOrderList(orders);
  const activeOrders = processedAll.filter((o) => isRawOrderActive(o));
  const pastOrders = processedAll
    .filter((o) => !isRawOrderActive(o))
    .sort((a, b) => getOrderTimestampMs(b) - getOrderTimestampMs(a));

  if (authLoading) {
    return (
      <div className="orders-page-container">
        <div className="orders-loading-skeleton">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="orders-empty-container">
        <ShoppingBag size={64} className="empty-orders-icon" />
        <h2>Sign In to View Orders</h2>
        <p>Your order history and live order tracking are saved under your profile.</p>
        <button className="orders-login-btn" onClick={openLogin}>
          SIGN IN TO RESTOHUB
        </button>
      </div>
    );
  }

  // Find targeted order for Detailed View
  const targetDetailedOrder = activeDetailedOrderId
    ? processedAll.find((o) => Number(o.id) === Number(activeDetailedOrderId))
    : null;

  // ----------------------------------------------------
  // DEDICATED ORDER DETAILS / TRACK ORDER PAGE VIEW
  // ----------------------------------------------------
  if (targetDetailedOrder) {
    const trackingInfo = getOrderTrackingInfo(targetDetailedOrder, nowMs, userArea);
    const stage = trackingInfo ? trackingInfo.stage : 'PLACED';
    const statusMeta = getStatusDisplayMeta(stage);
    const isCancelled = String(targetDetailedOrder.status).toUpperCase() === 'CANCELLED';

    const stageCompleted = (stageName) => {
      if (stage === 'DELIVERED') return true;
      if (stageName === 'PLACED') return stage === 'PREPARING' || stage === 'ASSIGNING_PARTNER' || stage === 'OUT_FOR_DELIVERY' || stage === 'DELIVERED';
      if (stageName === 'PREPARING') return stage === 'ASSIGNING_PARTNER' || stage === 'OUT_FOR_DELIVERY' || stage === 'DELIVERED';
      if (stageName === 'ASSIGNING_PARTNER') return stage === 'OUT_FOR_DELIVERY' || stage === 'DELIVERED';
      if (stageName === 'OUT_FOR_DELIVERY') return stage === 'DELIVERED';
      return false;
    };

    const itemTotal = targetDetailedOrder.items?.reduce(
      (sum, i) => sum + (Number(i.price || i.totalPrice || 0) * (i.quantity || 1)),
      0
    ) || targetDetailedOrder.totalAmount || 0;

    const deliveryFee = 45;
    const distanceCharges = 0;
    const gstCharges = 37;
    const grandTotal = targetDetailedOrder.totalAmount || (itemTotal + deliveryFee + gstCharges);

    return (
      <div className="orders-page-container">
        {/* Back Navigation Bar */}
        <button
          className="back-to-orders-btn"
          onClick={() => {
            setActiveDetailedOrderId(null);
            if (onClearSelectedOrder) onClearSelectedOrder();
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Orders</span>
        </button>

        {/* Detailed Order Card Box */}
        <div className="active-order-tracker-card" style={{ marginTop: '1rem' }}>
          {/* Header */}
          <div className="tracker-card-header">
            <div className="tracker-resto-meta">
              <div className="resto-avatar-box">
                <Utensils size={24} color="#fc8019" />
              </div>
              <div>
                <h3 className="tracker-resto-name">
                  <span>{targetDetailedOrder.restaurantName || `Restaurant #${targetDetailedOrder.restaurantId}`}</span>

                  {trackingInfo && !trackingInfo.isDelivered && !isCancelled && (
                    <span className="resto-live-timer-badge">
                      <Clock size={14} className="timer-spin-fast" />
                      <span>⏱ {trackingInfo.liveTimerFormatted} remaining</span>
                    </span>
                  )}
                </h3>
                <p className="tracker-order-id">
                  Order {targetDetailedOrder.displayOrderId} • 📍 {trackingInfo?.timings?.distanceKm || 2.5} km away • {formatDate(targetDetailedOrder.createdAt || targetDetailedOrder.orderDate)}
                </p>
              </div>
            </div>

            <div className={`tracker-status-pill ${isCancelled ? 'cancelled' : stage.toLowerCase()}`}>
              <span className="pulse-dot"></span>
              <span>{isCancelled ? 'CANCELLED' : stage.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* ORDER ITEMS LIST */}
          <div className="active-order-items-box" style={{ marginTop: '1.25rem' }}>
            <h4 className="box-title">ORDER ITEMS ({targetDetailedOrder.items?.length || 0})</h4>
            <div className="items-grid">
              {targetDetailedOrder.items && targetDetailedOrder.items.length > 0 ? (
                targetDetailedOrder.items.map((item, idx) => (
                  <div key={idx} className="active-item-row">
                    <span className="item-qty-badge">{item.quantity}x</span>
                    <span className="item-name-text">{item.foodName || `Food Item #${item.foodId}`}</span>
                    <span className="item-price-text">{formatCurrency((item.price || item.totalPrice || 0) * (item.quantity || 1))}</span>
                  </div>
                ))
              ) : (
                <p className="no-items-text">Order details updated...</p>
              )}
            </div>
          </div>

          {/* BILL DETAILS BREAKDOWN */}
          <div className="bill-details-breakdown-card">
            <h4 className="box-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Receipt size={16} color="#fc8019" />
              <span>BILL DETAILS</span>
            </h4>

            <div className="bill-row">
              <span>Item Total</span>
              <span>{formatCurrency(itemTotal)}</span>
            </div>
            <div className="bill-row">
              <span>Delivery Fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="bill-row">
              <span>Distance Charges</span>
              <span>{formatCurrency(distanceCharges)}</span>
            </div>
            <div className="bill-row">
              <span>GST &amp; Other Charges</span>
              <span>{formatCurrency(gstCharges)}</span>
            </div>

            <div className="bill-row total-paid-row">
              <span>TOTAL PAID</span>
              <span className="total-paid-amount">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Cancel Order Action */}
          {!isCancelled && !trackingInfo?.isDelivered && (
            <div className="tracker-card-footer" style={{ marginTop: '1.25rem' }}>
              <button
                className="animated-cancel-btn"
                onClick={() => handleOpenCancelModal(targetDetailedOrder)}
                title="Cancel this order"
              >
                <XCircle size={14} className="cancel-btn-icon" />
                <span>Cancel Order</span>
                <span className="cancel-pulse-dot" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Cancel Order Confirmation Modal */}
        {cancelModal.show && (
          <div className="cancel-modal-overlay" onClick={() => setCancelModal({ show: false, order: null, loading: false })}>
            <div className="cancel-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="cancel-modal-header">
                <div className="cancel-title-group">
                  <div className="cancel-warning-avatar">
                    <XCircle size={24} />
                  </div>
                  <h3 className="cancel-modal-title">Cancel Order #{cancelModal.order?.id}?</h3>
                </div>

                <button
                  className="cancel-modal-close-btn"
                  onClick={() => setCancelModal({ show: false, order: null, loading: false })}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="cancel-modal-body">
                <p className="cancel-question-text">
                  Are you sure you want to cancel your order from{' '}
                  <strong style={{ color: '#0f172a' }}>{cancelModal.order?.restaurantName || 'the restaurant'}</strong>?
                </p>
                <div className="cancel-sub-warning">
                  <span>This action cannot be undone. Any payment made will be refunded immediately.</span>
                </div>
              </div>

              <div className="cancel-modal-actions">
                <button
                  className="cancel-keep-btn"
                  onClick={() => setCancelModal({ show: false, order: null, loading: false })}
                  disabled={cancelModal.loading}
                >
                  No, Keep Order
                </button>
                <button
                  className="cancel-confirm-btn"
                  onClick={handleConfirmCancelOrder}
                  disabled={cancelModal.loading}
                >
                  <XCircle size={15} />
                  <span>{cancelModal.loading ? 'Cancelling...' : 'Yes, Cancel Order'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN MY ORDERS LIST VIEW (Active & Previous Orders)
  // ----------------------------------------------------
  return (
    <div className="orders-page-container">
      {/* Page Header */}
      <div className="orders-header-flex">
        <div>
          <h1 className="orders-page-title">My Orders</h1>
          <p className="orders-subtitle">View active order status &amp; your food order history</p>
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div className="orders-tabs-row">
        <button
          className={`order-tab-btn ${filterTab === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setFilterTab('ACTIVE')}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          className={`order-tab-btn ${filterTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilterTab('COMPLETED')}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* ACTIVE ORDERS SECTION */}
      {filterTab === 'ACTIVE' && (
        <div className="active-orders-section">
          {activeOrders.length > 0 ? (
            activeOrders.map((ord) => {
              const info = getOrderTrackingInfo(ord, nowMs, userArea);
              const stage = info ? info.stage : 'PLACED';
              const statusMeta = getStatusDisplayMeta(stage);

              return (
                <div key={ord.id} className="compact-active-order-card">
                  <div className="compact-active-left">
                    <div className="compact-resto-avatar">
                      <Utensils size={20} color="#fc8019" />
                    </div>
                    <div>
                      <h3 className="compact-resto-name">{ord.restaurantName || `Restaurant #${ord.restaurantId}`}</h3>
                      <p className="compact-status-title">
                        {statusMeta.title}
                        {info && !info.isDelivered && (
                          <span className="compact-eta-text"> • ⏱ {info.liveTimerFormatted} remaining</span>
                        )}
                      </p>
                      <p className="compact-meta-sub">
                        Order #{ord.id} • {formatCurrency(ord.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <button
                    className="compact-track-btn"
                    onClick={() => setActiveDetailedOrderId(ord.id)}
                  >
                    <span>TRACK ORDER</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="no-orders-box">
              <ShoppingBag size={48} color="#94a3b8" />
              <h3>No Active Orders Right Now</h3>
              <p>When you place an order, live tracking will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* PAST ORDERS SECTION */}
      {(filterTab === 'COMPLETED' || activeOrders.length === 0) && (
        <div className="past-orders-section">
          {pastOrders.length > 0 ? (
            pastOrders.map((ord) => {
              const isCancelled = String(ord.status).toUpperCase() === 'CANCELLED';

              return (
                <div key={ord.id} className="past-order-card">
                  <div className="past-card-left">
                    <div className="past-resto-avatar">
                      <Utensils size={20} color="#64748b" />
                    </div>
                    <div>
                      <div className="past-header-row">
                        <h3 className="past-resto-name">{ord.restaurantName || `Restaurant #${ord.restaurantId}`}</h3>
                        <span className={`past-status-badge ${isCancelled ? 'cancelled' : 'completed'}`}>
                          {isCancelled ? '❌ CANCELLED' : '✓ DELIVERED'}
                        </span>
                      </div>
                      <p className="past-meta-sub">
                        Order #{ord.id} • {formatCurrency(ord.totalAmount)} • {formatDate(ord.createdAt || ord.orderDate)}
                      </p>
                    </div>
                  </div>

                  <button
                    className="past-view-details-btn"
                    onClick={() => setActiveDetailedOrderId(ord.id)}
                  >
                    <span>VIEW DETAILS</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })
          ) : filterTab === 'COMPLETED' ? (
            <div className="no-orders-box">
              <ShoppingBag size={48} color="#94a3b8" />
              <h3>No Previous Orders Found</h3>
              <p>Your delivered or cancelled orders will be stored in your order history.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Floating Cancel Notification Toast */}
      {cancelNotification.show && (
        <div className="cancel-toast-notification">
          <div className="cancel-toast-icon">
            <XCircle size={20} />
          </div>
          <div className="cancel-toast-content">
            <h4>Order Cancelled</h4>
            <p>Order #{cancelNotification.orderId} was cancelled successfully.</p>
          </div>
          <button
            className="cancel-toast-close"
            onClick={() => setCancelNotification({ show: false, orderId: null })}
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
