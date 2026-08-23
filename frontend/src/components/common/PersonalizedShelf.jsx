import React, { useState } from 'react';
import { Plus, Check, Star, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const POPULAR_RECOMMENDATIONS = [
  {
    id: 1,
    name: 'Misal Pav',
    category: 'Maharashtrian',
    price: 90.0,
    originalPrice: 110.0,
    discount: '20% OFF',
    rating: 4.8,
    emoji: '🍛',
    restaurantId: 1,
    restaurantName: 'Pune Spice Kitchen',
  },
  {
    id: 6,
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    price: 280.0,
    originalPrice: 330.0,
    discount: '15% OFF',
    rating: 4.7,
    emoji: '🥘',
    restaurantId: 1,
    restaurantName: 'Pune Spice Kitchen',
  },
  {
    id: 10,
    name: 'Chicken Dum Biryani',
    category: 'Biryani',
    price: 320.0,
    originalPrice: 420.0,
    discount: '25% OFF',
    rating: 4.9,
    emoji: '🍗',
    restaurantId: 1,
    restaurantName: 'Pune Spice Kitchen',
  },
  {
    id: 11,
    name: 'Masala Dosa',
    category: 'South Indian',
    price: 120.0,
    originalPrice: 150.0,
    discount: '20% OFF',
    rating: 4.6,
    emoji: '🥞',
    restaurantId: 1,
    restaurantName: 'Pune Spice Kitchen',
  },
  {
    id: 15,
    name: 'Cold Coffee',
    category: 'Beverages',
    price: 120.0,
    originalPrice: 160.0,
    discount: '25% OFF',
    rating: 4.8,
    emoji: '☕',
    restaurantId: 1,
    restaurantName: 'Pune Spice Kitchen',
  },
];

export const PersonalizedShelf = ({ onSelectRestaurant }) => {
  const { activeUser } = useAuth();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState([]);

  const customerName = activeUser ? activeUser.name.split(' ')[0] : 'Foodie';

  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
      },
      item.restaurantId,
      item.restaurantName
    );

    setAddedIds((prev) => [...prev, item.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== item.id));
    }, 1500);
  };

  return (
    <div className="flipkart-shelf-wrapper">
      <div className="flipkart-shelf-container">
        {/* Flipkart Green Shelf Title Bar */}
        <div className="shelf-header">
          <h2 className="shelf-title">
            <ShoppingBag size={22} color="white" />
            <span>{customerName}, still craving these?</span>
          </h2>
          <span className="shelf-subtitle-badge">TOP PUNE RECOMENDATIONS</span>
        </div>

        {/* Food Items Horizontal Grid */}
        <div className="shelf-cards-grid">
          {POPULAR_RECOMMENDATIONS.map((item) => {
            const isAdded = addedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="shelf-item-card"
                onClick={() => onSelectRestaurant(item.restaurantId)}
              >
                {/* Food Image Container */}
                <div className="shelf-item-image-box">
                  <span className="shelf-item-emoji">{item.emoji}</span>
                  <span className="shelf-discount-badge">{item.discount}</span>
                </div>

                {/* Details */}
                <div className="shelf-item-details">
                  <div className="shelf-item-meta">
                    <span className="shelf-item-cat">{item.category}</span>
                    <span className="shelf-item-rating">
                      <Star size={12} fill="#fbbf24" stroke="none" />
                      {item.rating}
                    </span>
                  </div>

                  <h3 className="shelf-item-title">{item.name}</h3>

                  <div className="shelf-price-row">
                    <div className="shelf-price-box">
                      <span className="shelf-current-price">₹{item.price}</span>
                      <span className="shelf-original-price">₹{item.originalPrice}</span>
                    </div>

                    <button
                      className={`shelf-add-btn ${isAdded ? 'added' : ''}`}
                      onClick={(e) => handleAddToCart(item, e)}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} /> Added
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> ADD
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
