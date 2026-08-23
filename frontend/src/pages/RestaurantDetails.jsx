import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Plus, Minus, Trash2, Heart, Check, ShoppingBag, AlertCircle, Clock, Search } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { foodService } from '../services/foodService';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { useAuth } from '../context/AuthContext';
import { AddFoodModal } from '../components/food/AddFoodModal';
import { formatCurrency } from '../utils/formatters';
import { getRestaurantImage, getFoodImage, handleImageError, FALLBACK_RESTAURANT_IMAGE, FALLBACK_FOOD_IMAGE } from '../utils/imageMapper';

export const RestaurantDetails = ({ restaurantId, onBack, onNavigateCart }) => {
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { toggleFavouriteRestaurant, isRestaurantFavourite, toggleFavouriteFood, isFoodFavourite } = useFavourites();
  const { showToast } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);
  const [nonVegOnlyFilter, setNonVegOnlyFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);

  const handleVegToggle = () => {
    if (!vegOnlyFilter) {
      setVegOnlyFilter(true);
      setNonVegOnlyFilter(false);
    } else {
      setVegOnlyFilter(false);
    }
  };

  const handleNonVegToggle = () => {
    if (!nonVegOnlyFilter) {
      setNonVegOnlyFilter(true);
      setVegOnlyFilter(false);
    } else {
      setNonVegOnlyFilter(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [restData, foodsData] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        foodService.getFoodsByRestaurantId(restaurantId),
      ]);
      setRestaurant(restData);
      setFoods(foodsData || []);
    } catch (err) {
      setError(err.message || 'Could not load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchData();
  }, [restaurantId]);

  const getItemQuantityInCart = (foodId) => {
    const item = cartItems.find((ci) => ci.food.id === foodId);
    return item ? item.quantity : 0;
  };

  const categories = ['ALL', ...new Set(foods.map((f) => f.category).filter(Boolean))];

  const filteredFoods = foods.filter((f) => {
    const matchesCategory = activeCategory === 'ALL' || f.category === activeCategory;
    const nameDesc = ((f.name || '') + ' ' + (f.description || '')).toLowerCase();
    const isVeg = (f.category || '').toLowerCase() === 'veg' || !(nameDesc.includes('chicken') || nameDesc.includes('mutton') || nameDesc.includes('egg') || nameDesc.includes('fish') || nameDesc.includes('prawn') || nameDesc.includes('kebab') || nameDesc.includes('tikka'));
    const isNonVeg = !isVeg;

    let matchesDiet = true;
    if (vegOnlyFilter) {
      matchesDiet = isVeg;
    } else if (nonVegOnlyFilter) {
      matchesDiet = isNonVeg;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || f.name.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q));
    return matchesCategory && matchesDiet && matchesSearch;
  });

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading restaurant menu...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="resto-details-error">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Restaurants
        </button>
        <div className="alert alert-danger">{error || 'Restaurant not found'}</div>
      </div>
    );
  }

  const isFav = isRestaurantFavourite(restaurant.id);
  const coverImg = getRestaurantImage(restaurant);

  return (
    <div className="restaurant-details-container">
      <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Restaurants
      </button>

      {/* Restaurant Backdrop & Header Banner */}
      <div className="restaurant-detail-hero-banner">
        <div className="hero-backdrop-img-wrapper">
          <img
            src={coverImg}
            alt={restaurant.name}
            className="hero-backdrop-img"
            onError={(e) => handleImageError(e, FALLBACK_RESTAURANT_IMAGE)}
          />
          <div className="hero-backdrop-overlay" />
        </div>

        <div className="restaurant-hero-content">
          <div className="banner-left">
            <span className="brand-tag">Gourmet Partner</span>
            <div className="title-row-fav">
              <h1 className="banner-title">{restaurant.name}</h1>
              <button
                className={`fav-heart-toggle-btn ${isFav ? 'active' : ''}`}
                onClick={() => toggleFavouriteRestaurant(restaurant)}
                title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
              >
                <Heart size={20} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#ffffff'} />
              </button>
            </div>
            <p className="banner-cuisine">{restaurant.cuisineType || 'North Indian • Biryani • Fast Food'}</p>
            <p className="banner-location">
              <MapPin size={15} /> {restaurant.address || restaurant.locality || 'Pune'}, {restaurant.city || 'Pune'}
            </p>
            <div className="banner-meta-pills">
              <span className="meta-pill"><Clock size={13} /> 25-30 min delivery</span>
              <span className="meta-pill">₹30 Delivery Fee</span>
              <span className="meta-pill">₹300 for two</span>
            </div>
          </div>

          <div className="banner-right">
            <div className="rating-badge-lg">
              <Star size={18} fill="#F59E0B" stroke="none" />
              <span>{restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}</span>
              <span className="rating-count-sub">(500+ ratings)</span>
            </div>
            <button className="add-item-primary-btn" onClick={() => setIsAddFoodOpen(true)}>
              <Plus size={18} /> Add Food Item
            </button>
          </div>
        </div>
      </div>

      {/* WARNING BANNER IF RESTAURANT IS NOT ACCEPTING ORDERS */}
      {restaurant.acceptingOrders === false && (
        <div className="resto-closed-warning-banner">
          <div className="warning-banner-icon">
            <AlertCircle size={22} color="#dc2626" />
          </div>
          <div className="warning-banner-text">
            <h4>This restaurant is currently NOT accepting orders</h4>
            <p>
              You can browse menu items, but order placement is temporarily disabled until online ordering reopens.
            </p>
          </div>
        </div>
      )}

      {/* Menu Controls: Search & Dual Veg/Non-Veg Filter Sliders */}
      <div className="menu-controls-row">
        <div className="menu-search-box">
          <Search size={16} className="menu-search-icon" />
          <input
            type="text"
            placeholder="Search within this menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="menu-search-input"
          />
        </div>

        <div className="diet-filter-toggles-group">
          {/* 1. Veg Only Toggle Slider */}
          <label className={`veg-toggle-switch-label ${vegOnlyFilter ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={vegOnlyFilter}
              onChange={handleVegToggle}
              style={{ display: 'none' }}
            />
            <span className="diet-toggle-track" />
            <span className="toggle-label-text">🟢 Veg Only</span>
          </label>

          {/* 2. Non-Veg Toggle Slider */}
          <label className={`nonveg-toggle-switch-label ${nonVegOnlyFilter ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={nonVegOnlyFilter}
              onChange={handleNonVegToggle}
              style={{ display: 'none' }}
            />
            <span className="diet-toggle-track" />
            <span className="toggle-label-text">🔴 Non-Veg</span>
          </label>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="category-pills-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Food Items List */}
      <h2 className="menu-section-title">Menu Items ({filteredFoods.length})</h2>

      {filteredFoods.length === 0 ? (
        <div className="empty-menu-box">
          <p>No food items match your search or filter selection.</p>
          <button className="add-item-primary-btn" onClick={() => setIsAddFoodOpen(true)}>
            <Plus size={18} /> Add Menu Item
          </button>
        </div>
      ) : (
        <div className="gourmet-menu-grid">
          {filteredFoods.map((food) => {
            const qty = getItemQuantityInCart(food.id);
            const foodFav = isFoodFavourite(food.id);
            const isRestClosed = restaurant.acceptingOrders === false;
            const dishImg = getFoodImage(food);
            const isVeg = (food.category || '').toLowerCase() === 'veg' || !((food.name + ' ' + (food.description || '')).toLowerCase().includes('chicken') || (food.name + ' ' + (food.description || '')).toLowerCase().includes('mutton') || (food.name + ' ' + (food.description || '')).toLowerCase().includes('egg'));

            return (
              <div key={food.id} className="gourmet-food-card">
                <div className="gourmet-food-thumb">
                  <img
                    src={dishImg}
                    alt={food.name}
                    className="food-item-cover-img"
                    onError={(e) => handleImageError(e, FALLBACK_FOOD_IMAGE)}
                    loading="lazy"
                  />
                  {/* Veg/Non-Veg dot badge removed per user request */}
                  <button
                    className="food-fav-btn"
                    onClick={() => toggleFavouriteFood(food)}
                    title="Toggle Favourite"
                  >
                    <Heart size={16} fill={foodFav ? '#ef4444' : 'none'} color={foodFav ? '#ef4444' : '#ffffff'} />
                  </button>
                </div>

                <div className="gourmet-food-body">
                  <h3 className="food-name">{food.name}</h3>
                  <p className="food-desc">{food.description || 'Freshly prepared dish made with authentic Indian spices.'}</p>

                  <div className="food-card-bottom">
                    <span className="food-price-text">{formatCurrency(food.price)}</span>

                    <div className="food-qty-actions">
                      {qty === 0 ? (
                        <button
                          className={`add-to-cart-green-btn ${isRestClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (isRestClosed) {
                              showToast('This restaurant is currently not accepting orders.', 'error');
                              return;
                            }
                            addToCart({ ...food, restaurantName: restaurant.name });
                          }}
                        >
                          + ADD
                        </button>
                      ) : (
                        <div className="qty-control-pill">
                          <button onClick={() => updateQuantity(food.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span className="qty-number">{qty}</span>
                          <button onClick={() => {
                            if (isRestClosed) {
                              showToast('This restaurant is currently not accepting orders.', 'error');
                              return;
                            }
                            addToCart({ ...food, restaurantName: restaurant.name });
                          }}>
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        onFoodAdded={(newFood) => setFoods((prev) => [...prev, newFood])}
      />
    </div>
  );
};
