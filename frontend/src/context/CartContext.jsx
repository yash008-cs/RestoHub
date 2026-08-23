import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, openLogin, showToast } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('restohub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restaurant, setRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('restohub_cart_restaurant');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen for logout event to clear memory cart state immediately
  useEffect(() => {
    const handleLogout = () => {
      setCartItems([]);
      setRestaurant(null);
      localStorage.removeItem('restohub_cart');
      localStorage.removeItem('restohub_cart_restaurant');
      localStorage.removeItem('restohub_target_append_order_id');
    };
    window.addEventListener('restohub_logout', handleLogout);
    return () => window.removeEventListener('restohub_logout', handleLogout);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('restohub_cart', JSON.stringify(cartItems));
      if (cartItems.length === 0) {
        setRestaurant(null);
        localStorage.removeItem('restohub_cart_restaurant');
      }
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    if (restaurant && isAuthenticated) {
      localStorage.setItem('restohub_cart_restaurant', JSON.stringify(restaurant));
    }
  }, [restaurant, isAuthenticated]);

  const addToCart = (food) => {
    // REQUIRE AUTHENTICATION: Logged-out users can only preview the website
    if (!isAuthenticated) {
      if (showToast) showToast('Please login to add items to your cart', 'info');
      if (openLogin) openLogin('login');
      return false;
    }

    // Verify restaurant consistency
    if (restaurant && restaurant.id !== food.restaurantId) {
      const confirmClear = window.confirm(
        `Your cart contains items from "${restaurant.name}". Clear cart and add items from "${food.restaurantName}"?`
      );
      if (!confirmClear) return false;
      
      setCartItems([{ food, quantity: 1 }]);
      setRestaurant({ id: food.restaurantId, name: food.restaurantName });
      return true;
    }

    if (!restaurant) {
      setRestaurant({ id: food.restaurantId, name: food.restaurantName });
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { food, quantity: 1 }];
    });

    return true;
  };

  const updateQuantity = (foodId, value) => {
    // REQUIRE AUTHENTICATION: Logged-out users can only preview the website
    if (!isAuthenticated) {
      if (showToast) showToast('Please login to modify items in your cart', 'info');
      if (openLogin) openLogin('login');
      return;
    }

    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.food.id === foodId) {
            let newQty;
            if (value === -1) {
              newQty = item.quantity - 1;
            } else if (value === 1) {
              newQty = item.quantity + 1;
            } else {
              newQty = value;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (foodId) => {
    setCartItems((prev) => prev.filter((item) => item.food.id !== foodId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
    localStorage.removeItem('restohub_cart');
    localStorage.removeItem('restohub_cart_restaurant');
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.food.price) * item.quantity,
    0
  );

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [targetAppendOrderId, setTargetAppendOrderIdState] = useState(() => {
    return localStorage.getItem('restohub_target_append_order_id') || null;
  });

  const setTargetAppendOrderId = (orderId) => {
    setTargetAppendOrderIdState(orderId);
    if (orderId) {
      localStorage.setItem('restohub_target_append_order_id', String(orderId));
      localStorage.setItem(`restohub_add_items_clicked_${orderId}`, 'true');
      localStorage.setItem(`restohub_order_appended_${orderId}`, 'true');
    } else {
      localStorage.removeItem('restohub_target_append_order_id');
    }
  };

  const checkout = async (customerId, deliveryLocality = 'Sus') => {
    if (!customerId) {
      throw new Error('Please select or register a customer profile before placing an order.');
    }
    if (cartItems.length === 0 || !restaurant) {
      throw new Error('Your cart is empty.');
    }

    const payload = {
      customerId: Number(customerId),
      restaurantId: Number(restaurant.id),
      deliveryLocality: deliveryLocality || 'Sus',
      items: cartItems.map((item) => ({
        foodId: Number(item.food.id),
        quantity: item.quantity,
      })),
    };

    let resultOrder;
    let isAppended = false;

    const targetId = targetAppendOrderId || localStorage.getItem('restohub_target_append_order_id');

    if (targetId) {
      try {
        resultOrder = await orderService.addItemsToOrder(targetId, payload);
        isAppended = true;
      } catch (err) {
        console.warn('Failed to append to existing order, fallback to create order:', err);
        resultOrder = await orderService.createOrder(payload);
      }
      localStorage.setItem(`restohub_order_appended_${targetId}`, 'true');
      setTargetAppendOrderId(null);
    } else {
      resultOrder = await orderService.createOrder(payload);
    }

    if (resultOrder && resultOrder.id) {
      localStorage.setItem(`restohub_order_placed_time_${resultOrder.id}`, Date.now().toString());
    }

    clearCart();
    return { ...resultOrder, isAppended };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurant,
        totalAmount,
        totalCount,
        targetAppendOrderId,
        setTargetAppendOrderId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
