import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChefHat, Bike, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';
import { getOrderTrackingInfo, getStatusDisplayMeta } from '../../utils/orderTrackingUtils';

export const LiveOrderBanner = ({ activeTab, onNavigateToOrderDetails }) => {
  const { activeUser } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  // 1-second interval to update live clock & countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active order for logged in customer
  const checkActiveOrders = async () => {
    if (!activeUser?.id) {
      setActiveOrder(null);
      return;
    }

    try {
      const orders = await orderService.getCustomerOrders(activeUser.id);
      if (!orders || orders.length === 0) {
        setActiveOrder(null);
        return;
      }

      // Filter active orders (excluding CANCELLED and COMPLETED)
      const currentNow = Date.now();
      const activeList = orders.filter((ord) => {
        const status = String(ord.status || '').toUpperCase();
        if (status === 'CANCELLED' || status === 'COMPLETED') return false;

        const info = getOrderTrackingInfo(ord, currentNow);
        if (!info) return false;

        // Show banner while status is not delivered, or up to 8s after delivery success
        return info.elapsedSeconds < info.timings.totalSeconds + 8;
      });

      if (activeList.length > 0) {
        // Pick the most recent active order
        const newestActive = activeList.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
        setActiveOrder(newestActive);
      } else {
        setActiveOrder(null);
      }
    } catch (err) {
      console.warn('Failed to fetch active order for banner:', err);
    }
  };

  useEffect(() => {
    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 2000);
    const handleCancelledEvent = () => checkActiveOrders();
    window.addEventListener('restohub_order_cancelled', handleCancelledEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener('restohub_order_cancelled', handleCancelledEvent);
    };
  }, [activeUser]);

  if (!activeUser || !activeOrder) {
    return null; // Do not render anything when no active order exists
  }

  const userArea = (() => {
    try {
      const loc = localStorage.getItem('restohub_user_location');
      return loc ? JSON.parse(loc).area || 'Sus' : 'Sus';
    } catch {
      return 'Sus';
    }
  })();

  const trackingInfo = getOrderTrackingInfo(activeOrder, nowMs, userArea);
  if (!trackingInfo) return null;

  const stage = trackingInfo.stage;
  const statusMeta = getStatusDisplayMeta(stage);

  const stageCompleted = (stageName) => {
    if (stage === 'DELIVERED') return true;
    if (stageName === 'PLACED') return stage === 'PREPARING' || stage === 'ASSIGNING_PARTNER' || stage === 'OUT_FOR_DELIVERY' || stage === 'DELIVERED';
    if (stageName === 'PREPARING') return stage === 'ASSIGNING_PARTNER' || stage === 'OUT_FOR_DELIVERY' || stage === 'DELIVERED';
    if (stageName === 'ASSIGNING_PARTNER') return stage === 'OUT_FOR_DELIVERY' || stage === 'DELIVERED';
    if (stageName === 'OUT_FOR_DELIVERY') return stage === 'DELIVERED';
    return false;
  };

  return (
    <div className="live-order-banner-sticky">
      <div className="live-order-banner-card">
        {/* Top Header Row */}
        <div className="live-banner-header">
          <div className="live-banner-title-group">
            <span className="live-pulse-badge">
              <span className="live-dot" />
              <span>LIVE ORDER</span>
            </span>

            <h3 className="live-resto-name">{activeOrder.restaurantName || `Restaurant #${activeOrder.restaurantId}`}</h3>
            <span className="live-order-id-chip">Order #{activeOrder.id}</span>
          </div>

          <div className="live-banner-meta-right">
            {!trackingInfo.isDelivered && (
              <span className="live-eta-countdown">
                <Clock size={14} className="timer-spin-fast" />
                <span>⏱ {trackingInfo.liveTimerFormatted} remaining</span>
              </span>
            )}

            <span className="live-total-chip">{formatCurrency(activeOrder.totalAmount || 0)}</span>

            {activeTab === 'home' && (
              <button
                className="live-track-btn"
                onClick={() => onNavigateToOrderDetails && onNavigateToOrderDetails(activeOrder.id)}
              >
                <span>TRACK ORDER</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Message Text */}
        <div className="live-status-message-row">
          <span className="status-main-text">{statusMeta.title}</span>
          <span className="status-sub-text">• {statusMeta.subtext}</span>
        </div>

        {/* Compact Horizontal Progress Stepper */}
        <div className="live-banner-stepper">
          {/* Step 1: Order Placed */}
          <div className={`compact-step-node ${stageCompleted('PLACED') ? 'completed' : stage === 'PLACED' ? 'active' : ''}`}>
            <div className="compact-icon-circle">
              <CheckCircle2 size={13} />
            </div>
            <span className="compact-step-label">Placed</span>
          </div>

          {/* Connector 1: Placed -> Preparing */}
          <div className={`compact-connector ${stageCompleted('PLACED') ? 'completed' : ''}`}>
            <div
              className={`compact-connector-fill ${stage === 'PREPARING' ? 'wave-active' : ''}`}
              style={{ width: `${trackingInfo.line1FillPct}%` }}
            />
          </div>

          {/* Step 2: Kitchen Preparing */}
          <div className={`compact-step-node ${stageCompleted('PREPARING') ? 'completed' : stage === 'PREPARING' ? 'active' : ''}`}>
            <div className="compact-icon-circle">
              {stageCompleted('PREPARING') ? <CheckCircle2 size={13} /> : <ChefHat size={13} />}
            </div>
            <span className="compact-step-label">Preparing</span>
          </div>

          {/* Connector 2: Preparing -> Assigning Partner */}
          <div className={`compact-connector ${stageCompleted('PREPARING') ? 'completed' : ''}`}>
            <div
              className={`compact-connector-fill ${stage === 'ASSIGNING_PARTNER' ? 'wave-active' : ''}`}
              style={{ width: `${trackingInfo.line2FillPct}%` }}
            />
          </div>

          {/* Step 3: Assigning Partner */}
          <div className={`compact-step-node ${stageCompleted('ASSIGNING_PARTNER') ? 'completed' : stage === 'ASSIGNING_PARTNER' ? 'active' : ''}`}>
            <div className="compact-icon-circle">
              {stageCompleted('ASSIGNING_PARTNER') ? <CheckCircle2 size={13} /> : <UserCheck size={13} />}
            </div>
            <span className="compact-step-label">Assigning Partner</span>
          </div>

          {/* Connector 3: Assigning Partner -> Out for Delivery */}
          <div className={`compact-connector ${stageCompleted('ASSIGNING_PARTNER') ? 'completed' : ''}`}>
            <div
              className={`compact-connector-fill ${stage === 'OUT_FOR_DELIVERY' ? 'wave-active' : ''}`}
              style={{ width: `${trackingInfo.line3FillPct}%` }}
            />
          </div>

          {/* Step 4: Out for Delivery */}
          <div className={`compact-step-node ${stageCompleted('OUT_FOR_DELIVERY') ? 'completed' : stage === 'OUT_FOR_DELIVERY' ? 'active' : ''}`}>
            <div className="compact-icon-circle">
              {stageCompleted('OUT_FOR_DELIVERY') ? <CheckCircle2 size={13} /> : <Bike size={13} />}
            </div>
            <span className="compact-step-label">Out for Delivery</span>
          </div>

          {/* Connector 4: Delivery -> Delivered */}
          <div className={`compact-connector ${stageCompleted('OUT_FOR_DELIVERY') ? 'completed' : ''}`}>
            <div
              className="compact-connector-fill"
              style={{ width: `${stage === 'DELIVERED' ? 100 : 0}%` }}
            />
          </div>

          {/* Step 5: Delivered */}
          <div className={`compact-step-node ${stage === 'DELIVERED' ? 'completed' : ''}`}>
            <div className="compact-icon-circle">
              <CheckCircle2 size={13} />
            </div>
            <span className="compact-step-label">Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
};
