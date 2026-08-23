import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, ArrowRight, Plus, Minus, Heart, Clock, Utensils } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { foodService } from '../services/foodService';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { OfferBanner } from '../components/common/OfferBanner';
import { CategoryBar } from '../components/common/CategoryBar';
import { RealisticFire } from '../components/common/RealisticFire';
import { formatCurrency } from '../utils/formatters';
import { getRestaurantImage, getFoodImage, handleImageError, FALLBACK_RESTAURANT_IMAGE, FALLBACK_FOOD_IMAGE } from '../utils/imageMapper';

export const Home = ({ onSelectRestaurant, onNavigateRestaurants, onNavigateSearch, onSelectOffer, searchQuery, setSearchQuery }) => {
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { toggleFavouriteRestaurant, isRestaurantFavourite } = useFavourites();

  const [restaurants, setRestaurants] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [restoData, foodData] = await Promise.all([
          restaurantService.getAllRestaurants(),
          foodService.getAllFoodItems(),
        ]);
        setRestaurants(restoData || []);
        setPopularFoods(foodData || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setError(err.message || 'Unable to connect to RestoHub backend server.');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const getItemQty = (foodId) => {
    const found = cartItems.find((item) => item.food.id === foodId);
    return found ? found.quantity : 0;
  };

  const query = localSearch.toLowerCase().trim();

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      !query ||
      r.name.toLowerCase().includes(query) ||
      (r.address && r.address.toLowerCase().includes(query)) ||
      (r.city && r.city.toLowerCase().includes(query)) ||
      (r.locality && r.locality.toLowerCase().includes(query)) ||
      (r.cuisineType && r.cuisineType.toLowerCase().includes(query));
    return matchesSearch;
  });

  const handleCategorySelect = (catName) => {
    const targetQuery = catName === 'ALL' ? '' : catName;
    if (setSearchQuery) {
      setSearchQuery(targetQuery);
    }
    if (onNavigateSearch) {
      onNavigateSearch();
    }
  };

  return (
    <div className="zepto-home-page">
      {/* 1. Welcome / Hero Section */}
      <section className="compact-welcome-hero">
        <div className="hero-text-container">
          <span className="hero-location-tag">📍 PUNE, MAHARASHTRA</span>
          <h1 className="hero-main-title">Craving Something Delicious?</h1>
          <p className="hero-subtext">
            Explore Pune's top-rated restaurants & signature gourmet dishes delivered in minutes.
          </p>

          <div
            className="hero-search-box"
            onClick={() => onNavigateSearch && onNavigateSearch()}
          >
            <Search size={20} className="hero-search-icon" />
            <input
              type="text"
              placeholder="Search for food, biryani, burgers, or restaurants..."
              value={localSearch}
              onFocus={() => onNavigateSearch && onNavigateSearch()}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (onNavigateSearch) onNavigateSearch();
              }}
              className="hero-search-input"
            />
          </div>
        </div>
      </section>

      <div className="home-content-container">
        {/* 2. Special Offers Section */}
        <OfferBanner onSelectOffer={onSelectOffer} />

        {/* 3. Explore Categories Section */}
        <CategoryBar
          selectedCategory=""
          onSelectCategory={handleCategorySelect}
        />

        {/* 4. Popular Restaurants Section */}
        <section className="popular-restaurants-section">
          <div className="section-header-flex">
            <div>
              <h2 className="section-main-title">⭐ Top Restaurants in Pune</h2>
              <p className="section-subtitle">Handpicked partner eateries near your location</p>
            </div>
            <button className="view-all-link-btn" onClick={onNavigateRestaurants}>
              <span>View All ({restaurants.length})</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="simple-loader">Loading top restaurants...</div>
          ) : error ? (
            <div className="simple-error">{error}</div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="simple-empty">No restaurants match your search query.</div>
          ) : (
            <div className="restaurants-clean-grid">
              {filteredRestaurants.slice(0, 6).map((r) => {
                const isFav = isRestaurantFavourite(r.id);
                const isClosed = r.acceptingOrders === false;
                const coverImgUrl = getRestaurantImage(r);

                return (
                  <div
                    key={r.id}
                    className={`clean-restaurant-card ${isClosed ? 'opacity-85' : ''}`}
                    onClick={() => onSelectRestaurant(r.id)}
                  >
                    <div className="card-thumb-header">
                      <img
                        src={coverImgUrl}
                        alt={r.name}
                        className="resto-cover-img"
                        onError={(e) => handleImageError(e, FALLBACK_RESTAURANT_IMAGE)}
                        loading="lazy"
                      />
                      <div className="card-top-badges">
                        <span className="rating-badge">
                          <Star size={13} fill="#F59E0B" stroke="none" />
                          {r.rating ? r.rating.toFixed(1) : '4.5'}
                        </span>
                        <button
                          className={`fav-heart-btn ${isFav ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavouriteRestaurant(r);
                          }}
                          title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                        >
                          <Heart size={16} fill={isFav ? '#EF4444' : 'none'} color={isFav ? '#EF4444' : '#ffffff'} />
                        </button>
                      </div>
                    </div>

                    <div className="card-info-body">
                      <h3 className="resto-title-name">{r.name}</h3>
                      {isClosed && (
                        <div className="closed-status-tag">
                          🔴 Not accepting orders right now
                        </div>
                      )}
                      <p className="resto-cuisine-text">{r.cuisineType || 'North Indian • Biryani • Fast Food'}</p>
                      <p className="resto-location-text">
                        <MapPin size={13} /> {r.locality || r.address || 'Pune'}, {r.city || 'Pune'}
                      </p>
                      <div className="resto-delivery-meta">
                        <span className="del-time"><Clock size={13} /> 25-30 min</span>
                        <span className="del-fee">₹30 Delivery Fee</span>
                        <span className="del-cost">₹300 for two</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. Popular Dishes Section */}
        <section className="popular-dishes-section">
          <div className="section-header-flex">
            <div>
              <h2 className="section-main-title">
                <RealisticFire size={28} />
                <span>Popular Dishes in Pune</span>
              </h2>
              <p className="section-subtitle">Most ordered gourmet items &amp; specialties right now</p>
            </div>
            <button className="view-all-link-btn" onClick={onNavigateSearch}>
              <span>Explore All Dishes ({popularFoods.length})</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="simple-loader">Loading popular dishes...</div>
          ) : popularFoods.length === 0 ? (
            <div className="simple-empty">No popular dishes available right now.</div>
          ) : (
            <div className="dishes-clean-grid">
              {popularFoods.slice(0, 8).map((dish) => {
                const qty = getItemQty(dish.id);
                const dishImgUrl = getFoodImage(dish);

                return (
                  <div key={dish.id} className="clean-dish-card">
                    <div className="dish-thumb-box">
                      <img
                        src={dishImgUrl}
                        alt={dish.name}
                        className="dish-cover-img"
                        onError={(e) => handleImageError(e, FALLBACK_FOOD_IMAGE)}
                        loading="lazy"
                      />
                    </div>

                    <div className="dish-info-box">
                      <h3 className="dish-title">{dish.name}</h3>
                      <p className="dish-resto-sub">{dish.description || 'Delicious freshly prepared specialty'}</p>
                      <div className="dish-price-rating-row">
                        <span className="dish-price-text">{formatCurrency(dish.price)}</span>
                        <span className="dish-rating"><Star size={12} fill="#F59E0B" stroke="none" /> 4.6</span>
                      </div>
                    </div>

                    <div className="dish-add-action-box">
                      {qty === 0 ? (
                        <button
                          className="dish-add-orange-btn"
                          onClick={() => addToCart(dish)}
                        >
                          + ADD
                        </button>
                      ) : (
                        <div className="dish-qty-stepper">
                          <button onClick={() => updateQuantity(dish.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span>{qty}</span>
                          <button onClick={() => addToCart(dish)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
