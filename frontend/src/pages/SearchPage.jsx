import React, { useState, useEffect } from 'react';
import { Search, X, Star, MapPin, Plus, Minus, Check, ArrowRight, Utensils, Tag, Truck, Sparkles, Gift } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { foodService } from '../services/foodService';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { formatCurrency } from '../utils/formatters';
import { getFoodImage, FALLBACK_FOOD_IMAGE, handleImageError } from '../utils/imageMapper';

const POPULAR_CUISINES = [
  { id: 'pizza', name: 'Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80', category: 'Pizza' },
  { id: 'rolls', name: 'Rolls', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300&q=80', category: 'Wraps & Rolls' },
  { id: 'burger', name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80', category: 'Burgers' },
  { id: 'tea', name: 'Tea & Coffee', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80', category: 'Beverages' },
  { id: 'chinese', name: 'Chinese', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&q=80', category: 'Chinese & Asian' },
  { id: 'cake', name: 'Cake', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=80', category: 'Desserts' },
  { id: 'dessert', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80', category: 'Desserts' },
  { id: 'north-indian', name: 'North Indian', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80', category: 'Indian Main Course' },
  { id: 'south-indian', name: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80', category: 'South Indian' },
  { id: 'sandwich', name: 'Sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80', category: 'Sandwiches' },
  { id: 'momos', name: 'Momos', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=300&q=80', category: 'Chinese & Asian' },
  { id: 'biryani', name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', category: 'Biryani & Rice' },
  { id: 'maharashtrian', name: 'Maharashtrian', image: '/misal-pav-authentic.png', category: 'Maharashtrian' },
];

export const SearchPage = ({ searchQuery, setSearchQuery, onSelectRestaurant, activeOfferFilter, setActiveOfferFilter }) => {
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { toggleFavouriteRestaurant, isRestaurantFavourite } = useFavourites();

  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [restoData, foodData] = await Promise.all([
          restaurantService.getAllRestaurants(),
          foodService.getAllFoodItems(),
        ]);
        setRestaurants(restoData || []);
        setFoods(foodData || []);
      } catch (err) {
        console.error('Failed to load search data:', err);
        setError('Unable to fetch search items. Please check connection.');
      } finally {
        setLoading(false);
      }
    };
    loadSearchData();
  }, []);

  const handleSearchChange = (val) => {
    setLocalSearch(val);
    if (setSearchQuery) {
      setSearchQuery(val);
    }
  };

  const handleCuisineClick = (cuisine) => {
    handleSearchChange(cuisine.name);
  };

  const getItemQty = (foodId) => {
    const found = cartItems.find((item) => item.food.id === foodId);
    return found ? found.quantity : 0;
  };

  const matchesSearchTerm = (f, q) => {
    if (!q) return true;
    const queryStr = q.toLowerCase().trim();
    const nameStr = (f.name || '').toLowerCase();
    const catStr = (f.category || '').toLowerCase();
    const descStr = (f.description || '').toLowerCase();

    if (queryStr === 'biryani') {
      return catStr.includes('biryani') || catStr.includes('rice') || nameStr.includes('biryani') || nameStr.includes('pulao');
    }
    if (queryStr === 'pizza' || queryStr === 'pizzas') {
      return catStr.includes('pizza') || nameStr.includes('pizza');
    }
    if (queryStr === 'burger' || queryStr === 'burgers') {
      return catStr.includes('burger') || nameStr.includes('burger');
    }
    if (queryStr === 'south indian') {
      return catStr.includes('south') || nameStr.includes('dosa') || nameStr.includes('idli') || nameStr.includes('vada') || nameStr.includes('uttapam');
    }
    if (queryStr === 'chinese') {
      return catStr.includes('chinese') || catStr.includes('asian') || nameStr.includes('noodle') || nameStr.includes('manchurian') || nameStr.includes('momo') || nameStr.includes('fried rice');
    }
    if (queryStr === 'north indian') {
      return catStr.includes('north') || catStr.includes('main course') || catStr.includes('indian') || nameStr.includes('paneer') || nameStr.includes('butter chicken') || nameStr.includes('dal') || nameStr.includes('curry') || nameStr.includes('naan');
    }
    if (queryStr === 'maharashtrian') {
      return catStr.includes('maharashtrian') || nameStr.includes('misal') || nameStr.includes('pav') || nameStr.includes('pitla') || nameStr.includes('poha');
    }
    if (queryStr === 'snacks') {
      return catStr.includes('snack') || catStr.includes('starter') || catStr.includes('wrap') || nameStr.includes('roll') || nameStr.includes('samosa') || nameStr.includes('sandwich') || nameStr.includes('fries');
    }
    if (queryStr === 'desserts' || queryStr === 'dessert') {
      return catStr.includes('dessert') || catStr.includes('sweet') || catStr.includes('cake') || nameStr.includes('cake') || nameStr.includes('ice cream') || nameStr.includes('gulab') || nameStr.includes('brownie') || nameStr.includes('kheer');
    }
    if (queryStr === 'beverages' || queryStr === 'tea & coffee') {
      return catStr.includes('beverage') || catStr.includes('drink') || nameStr.includes('tea') || nameStr.includes('coffee') || nameStr.includes('shake') || nameStr.includes('juice') || nameStr.includes('lassi');
    }

    return nameStr.includes(queryStr) || catStr.includes(queryStr) || descStr.includes(queryStr);
  };

  const query = localSearch.toLowerCase().trim();

  // Filter food items based on search query AND active deal offer filter
  const rawMatchedFoods = foods.filter((f) => {
    // 1. Check Search Query Match
    const matchesQuery = matchesSearchTerm(f, query);
    if (!matchesQuery) return false;

    const catStr = (f.category || '').toLowerCase();
    const nameStr = (f.name || '').toLowerCase();

    // 2. Check Offer Filter Match
    if (!activeOfferFilter) return true;

    if (activeOfferFilter === 'RESTO50') {
      return (
        catStr.includes('pizza') ||
        catStr.includes('burger') ||
        catStr.includes('biryani') ||
        catStr.includes('pasta') ||
        nameStr.includes('paneer') ||
        nameStr.includes('misal') ||
        nameStr.includes('chicken') ||
        nameStr.includes('noodle') ||
        nameStr.includes('dosa') ||
        catStr.includes('dessert') ||
        f.price <= 250
      );
    }

    if (activeOfferFilter === 'FREEDEL') {
      return true;
    }

    if (activeOfferFilter === 'GOURMET150') {
      return (
        nameStr.includes('biryani') ||
        nameStr.includes('thali') ||
        nameStr.includes('combo') ||
        nameStr.includes('kebab') ||
        nameStr.includes('tikka') ||
        nameStr.includes('mutton') ||
        nameStr.includes('special') ||
        f.price >= 140
      );
    }

    return true;
  });

  // Deduplicate items by unique food name so customer receives an exact, clean list
  const uniqueFoodMap = new Map();
  rawMatchedFoods.forEach((food) => {
    const key = food.name.toLowerCase().trim();
    if (!uniqueFoodMap.has(key)) {
      uniqueFoodMap.set(key, food);
    }
  });

  const matchedFoods = Array.from(uniqueFoodMap.values());

  const matchedRestaurants = restaurants.filter((r) => {
    if (!query && !activeOfferFilter) return true;
    if (!query) return true;
    return (
      r.name.toLowerCase().includes(query) ||
      (r.cuisineType && r.cuisineType.toLowerCase().includes(query)) ||
      (r.address && r.address.toLowerCase().includes(query)) ||
      (r.locality && r.locality.toLowerCase().includes(query))
    );
  });

  return (
    <div className="search-page-container">
      {/* 1. Centered Search Header Bar */}
      <div className="search-page-header">
        <div className="search-page-input-wrapper">
          <input
            type="text"
            placeholder="Search for restaurants and food..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-page-input"
            autoFocus={!activeOfferFilter}
          />
          {localSearch ? (
            <button className="search-clear-btn" onClick={() => handleSearchChange('')}>
              <X size={18} />
            </button>
          ) : (
            <Search size={20} className="search-page-icon" />
          )}
        </div>
      </div>

      {/* 2. Offer Filter Switcher Pills */}
      <div className="search-offer-pills-row">
        <button
          className={`search-offer-pill ${!activeOfferFilter ? 'active' : ''}`}
          onClick={() => setActiveOfferFilter && setActiveOfferFilter(null)}
        >
          All Items
        </button>
        <button
          className={`search-offer-pill offer-red ${activeOfferFilter === 'RESTO50' ? 'active' : ''}`}
          onClick={() => setActiveOfferFilter && setActiveOfferFilter('RESTO50')}
        >
          <Tag size={14} /> 50% OFF (RESTO50)
        </button>
        <button
          className={`search-offer-pill offer-purple ${activeOfferFilter === 'FREEDEL' ? 'active' : ''}`}
          onClick={() => setActiveOfferFilter && setActiveOfferFilter('FREEDEL')}
        >
          <Truck size={14} /> Free Delivery (FREEDEL)
        </button>
        <button
          className={`search-offer-pill offer-blue ${activeOfferFilter === 'GOURMET150' ? 'active' : ''}`}
          onClick={() => setActiveOfferFilter && setActiveOfferFilter('GOURMET150')}
        >
          <Sparkles size={14} /> ₹150 Cashback (GOURMET150)
        </button>
      </div>

      {/* 3. Active Offer Hero Banner */}
      {activeOfferFilter === 'RESTO50' && (
        <div className="offer-active-banner offer-banner-red">
          <div className="offer-banner-content">
            <span className="offer-banner-tag">WELCOME OFFER • CODE: RESTO50</span>
            <h2 className="offer-banner-title">50% OFF up to ₹100</h2>
            <p className="offer-banner-sub">
              Showing food items eligible for 50% instant discount. Promo code <strong>RESTO50</strong> will apply automatically at checkout!
            </p>
          </div>
          <button className="offer-banner-clear-btn" onClick={() => setActiveOfferFilter(null)}>
            Show All Items <X size={15} />
          </button>
        </div>
      )}

      {activeOfferFilter === 'FREEDEL' && (
        <div className="offer-active-banner offer-banner-purple">
          <div className="offer-banner-content">
            <span className="offer-banner-tag">FREE DELIVERY • CODE: FREEDEL</span>
            <h2 className="offer-banner-title">Zero Delivery Charge</h2>
            <p className="offer-banner-sub">
              Showing top dishes &amp; restaurants with 100% Free Home Delivery across Pune. Code <strong>FREEDEL</strong> active!
            </p>
          </div>
          <button className="offer-banner-clear-btn" onClick={() => setActiveOfferFilter(null)}>
            Show All Items <X size={15} />
          </button>
        </div>
      )}

      {activeOfferFilter === 'GOURMET150' && (
        <div className="offer-active-banner offer-banner-blue">
          <div className="offer-banner-content">
            <span className="offer-banner-tag">WEEKEND SPECIAL • CODE: GOURMET150</span>
            <h2 className="offer-banner-title">Flat ₹150 Cashback</h2>
            <p className="offer-banner-sub">
              Showing gourmet biryanis, royal thalis &amp; premium combos eligible for ₹150 cashback. Code <strong>GOURMET150</strong> active!
            </p>
          </div>
          <button className="offer-banner-clear-btn" onClick={() => setActiveOfferFilter(null)}>
            Show All Items <X size={15} />
          </button>
        </div>
      )}

      {/* 4. Popular Cuisines Section (hidden when deal filter is active) */}
      {!activeOfferFilter && (
        <div className="search-popular-section">
          <h2 className="search-section-title">Popular Cuisines</h2>
          <div className="popular-cuisines-row">
            {POPULAR_CUISINES.map((item) => (
              <div
                key={item.id}
                className={`cuisine-chip-card ${query === item.name.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleCuisineClick(item)}
              >
                <div className="cuisine-icon-bubble">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cuisine-real-photo"
                    onError={(e) => handleImageError(e, item.image)}
                  />
                </div>
                <span className="cuisine-name-text">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Search / Deal Results Content */}
      {loading ? (
        <div className="search-state-box">
          <div className="resto-loader-spinner"></div>
          <p>Loading food items &amp; deals...</p>
        </div>
      ) : error ? (
        <div className="search-state-box error">
          <p>{error}</p>
        </div>
      ) : (query === '' && !activeOfferFilter) ? (
        /* Blank state when user hasn't typed anything and no offer filter is selected */
        <div className="search-initial-suggestions">
          <h3 className="sub-heading">Trending Right Now</h3>
          <div className="trending-chips-group">
            {['Paneer Butter Masala', 'Chicken Dum Biryani', 'Misal Pav', 'Margherita Pizza', 'Cold Coffee', 'Chicken Wrap', 'Veg Hakka Noodles', 'Masala Dosa'].map((term) => (
              <button key={term} className="trending-chip-btn" onClick={() => handleSearchChange(term)}>
                <Search size={14} /> {term}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Results Display */
        <div className="search-results-content">
          {/* Matched Food Items */}
          {matchedFoods.length > 0 && (
            <div className="search-result-group">
              <h3 className="results-group-title">
                {activeOfferFilter ? 'Eligible Food Dishes' : 'Dishes'} ({matchedFoods.length})
              </h3>
              <div className="search-foods-grid">
                {matchedFoods.map((food) => {
                  const qty = getItemQty(food.id);
                  const foodImg = food.imageUrl || getFoodImage(food);

                  return (
                    <div key={food.id} className="search-food-card-rich">
                      <div className="search-food-thumb">
                        <img
                          src={foodImg}
                          alt={food.name}
                          className="search-food-img"
                          onError={(e) => handleImageError(e, FALLBACK_FOOD_IMAGE)}
                        />
                        {activeOfferFilter === 'RESTO50' && (
                          <span className="search-deal-tag red">🏷️ 50% OFF</span>
                        )}
                        {activeOfferFilter === 'FREEDEL' && (
                          <span className="search-deal-tag purple">🚚 FREE DEL</span>
                        )}
                        {activeOfferFilter === 'GOURMET150' && (
                          <span className="search-deal-tag blue">✨ ₹150 CASHBACK</span>
                        )}
                      </div>

                      <div className="search-food-body">
                        <h4 className="food-card-name">{food.name}</h4>
                        {food.restaurantName && (
                          <div
                            className="food-restaurant-tag"
                            onClick={() => onSelectRestaurant && onSelectRestaurant(food.restaurantId)}
                          >
                            <Utensils size={12} /> {food.restaurantName}
                          </div>
                        )}
                        <p className="food-card-desc">{food.description || 'Delicious dish cooked with authentic ingredients.'}</p>
                        
                        <div className="search-food-footer">
                          <span className="food-card-price">{formatCurrency(food.price)}</span>
                          
                          {qty === 0 ? (
                            <button className="add-food-btn" onClick={() => addToCart(food)}>
                              <Plus size={14} />
                              <span>ADD</span>
                            </button>
                          ) : (
                            <div className="qty-control-badge">
                              <button className="qty-stepper-btn" onClick={() => updateQuantity(food.id, -1)} aria-label="Decrease quantity">
                                <Minus size={14} />
                              </button>
                              <span className="qty-count-text">{qty}</span>
                              <button className="qty-stepper-btn" onClick={() => addToCart(food)} aria-label="Increase quantity">
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Restaurants (if no deal filter active or query matching) */}
          {matchedRestaurants.length > 0 && !activeOfferFilter && (
            <div className="search-result-group">
              <h3 className="results-group-title">
                Restaurants ({matchedRestaurants.length})
              </h3>
              <div className="search-restaurants-grid">
                {matchedRestaurants.map((resto) => (
                  <div key={resto.id} className="search-resto-card" onClick={() => onSelectRestaurant && onSelectRestaurant(resto.id)}>
                    <div className="resto-card-icon-box">
                      <Utensils size={24} color="#fc8019" />
                    </div>
                    <div className="resto-card-details">
                      <div className="resto-card-header">
                        <h4 className="resto-name">{resto.name}</h4>
                        <div className="resto-rating-pill">
                          <Star size={12} fill="#ffffff" /> {resto.rating || 4.5}
                        </div>
                      </div>
                      <p className="resto-cuisine">{resto.cuisineType || 'Multi-Cuisine, Fast Food'}</p>
                      <p className="resto-address">
                        <MapPin size={12} /> {resto.locality || resto.address || 'Pune'}
                      </p>
                      <button className="resto-view-btn">
                        View Menu <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedFoods.length === 0 && matchedRestaurants.length === 0 && (
            <div className="search-empty-box">
              <Utensils size={48} className="empty-icon" />
              <h3>No food items found matching this filter</h3>
              <p>Try clearing the deal filter or search for "Biryani", "Pizza", "Paneer", or "Burger"</p>
              {activeOfferFilter && (
                <button className="offer-banner-clear-btn" onClick={() => setActiveOfferFilter(null)} style={{ marginTop: '1rem' }}>
                  Show All Items
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
