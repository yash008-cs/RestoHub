import React, { useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export const BottomCartBar = ({ onNavigateCart, onOrderAppended }) => {
  const { cartItems, totalCount, totalAmount, restaurant, targetAppendOrderId, checkout } = useCart();
  const { activeUser, isAuthenticated, openLogin, showToast } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  if (!cartItems || cartItems.length === 0 || !isAuthenticated) return null;

  const handleBarClick = async () => {
    if (!isAuthenticated || !activeUser) {
      if (openLogin) openLogin('login');
      return;
    }
    if (targetAppendOrderId && activeUser) {
      try {
        setSubmitting(true);
        const orderIdToAppend = targetAppendOrderId;
        const updatedOrder = await checkout(activeUser.id);
        if (showToast) {
          showToast(`Items have been added to Order #${orderIdToAppend || updatedOrder?.id}!`, 'success');
        }
        if (onOrderAppended) {
          onOrderAppended(updatedOrder);
        } else if (onNavigateCart) {
          onNavigateCart('orders');
        }
      } catch (err) {
        console.error('Failed to append items to order:', err);
      } finally {
        setSubmitting(false);
      }
    } else {
      if (onNavigateCart) onNavigateCart('cart');
    }
  };

  return (
    <div className="bottom-cart-sticky-bar">
      <div className="bottom-cart-bar-container" onClick={handleBarClick}>
        <div className="bottom-cart-left-meta">
          <div className="cart-item-count-badge">
            <ShoppingBag size={18} color="white" />
            <span className="count-text">{totalCount} {totalCount === 1 ? 'Item' : 'Items'} Added</span>
          </div>
          {restaurant && (
            <span className="cart-restaurant-name">from {restaurant.name}</span>
          )}
        </div>

        <div className="bottom-cart-right-action">
          <span className="bottom-cart-total-price">{formatCurrency(totalAmount)}</span>
          <div className="view-cart-link-group">
            <span className="view-cart-bold">
              {targetAppendOrderId ? (submitting ? 'ADDING...' : 'ADD ITEMS') : 'VIEW CART'}
            </span>
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};
