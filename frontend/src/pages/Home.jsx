import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  MapPin,
  ArrowRight,
  Plus,
  Minus,
  Heart,
  Clock,
  Bike,
  UtensilsCrossed,
  Gift,
} from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { foodService } from '../services/foodService';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { OfferBanner } from '../components/common/OfferBanner';
import { CategoryBar } from '../components/common/CategoryBar';
import { RealisticFire } from '../components/common/RealisticFire';
import { formatCurrency } from '../utils/formatters';
import {
  getRestaurantImage,
  getFoodImage,
  handleImageError,
  FALLBACK_RESTAURANT_IMAGE,
  FALLBACK_FOOD_IMAGE,
} from '../utils/imageMapper';

export const Home = ({
  onSelectRestaurant,
  onNavigateRestaurants,
  onNavigateSearch,
  onSelectOffer,
  searchQuery,
  setSearchQuery,
}) => {
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
    <div className="ref-full-page-wrapper">
      {/* 1. Main Reference Hero Card Showcase */}
      <section className="ref-hero-card-section">
        <div className="ref-hero-main-card">
          <div className="ref-hero-two-col-grid">
            {/* Left Column: Headline, Description, CTA, and 3 Floating Cards */}
            <div className="ref-hero-left-column">
              <div className="ref-hero-text-group">
                <h1 className="ref-hero-headline">
                  Delicious <span className="ref-orange-text">Food</span>,<br />
                  Delivered <span className="ref-orange-text">Fast</span>
                </h1>

                <p className="ref-hero-paragraph">
                  Order your favorite dishes from top restaurants in town. We deliver deliciousness to your doorstep. Hungry for convenience? <strong>Let's get started!</strong>
                </p>

                <div className="ref-hero-cta-wrapper">
                  <button
                    className="ref-hero-cta-button"
                    onClick={onNavigateRestaurants}
                  >
                    <span>Explore Restaurants</span>
                    <ArrowRight size={18} className="ref-cta-arrow" />
                  </button>
                </div>
              </div>

              {/* 3 Floating Feature Cards (Bottom-Left) */}
              <div className="ref-feature-cards-container">
                {/* Card 1: Fast Delivery */}
                <div className="ref-feature-card card-1">
                  <div className="ref-feature-icon-box">
                    <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
                      {/* Delivery Scooter SVG matching reference style */}
                      <circle cx="14" cy="34" r="6" stroke="#FC8019" strokeWidth="3.5" fill="#FFEFE5" />
                      <circle cx="34" cy="34" r="6" stroke="#FC8019" strokeWidth="3.5" fill="#FFEFE5" />
                      <path d="M14 34 H24 L30 22 H36" stroke="#FC8019" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M22 22 H14 V16 H22 Z" fill="#FC8019" />
                      <path d="M30 22 L33 14 H37" stroke="#FC8019" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="ref-feature-text-box">
                    <h3 className="ref-feature-title">Fast Delivery</h3>
                    <p className="ref-feature-desc">On-time delivery at your doorstep</p>
                  </div>
                </div>

                {/* Card 2: Exclusive Menus */}
                <div className="ref-feature-card card-2">
                  <div className="ref-feature-icon-box">
                    <svg viewBox="0 0 48 48" width="26" height="26" fill="none">
                      {/* Fork and Knife SVG */}
                      <path d="M16 10 V22 C16 26 22 26 22 22 V10" stroke="#FC8019" strokeWidth="3.5" strokeLinecap="round" />
                      <line x1="19" y1="10" x2="19" y2="38" stroke="#FC8019" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M29 10 C29 10 35 12 35 24 V38 H29 V10 Z" fill="#FC8019" />
                    </svg>
                  </div>
                  <div className="ref-feature-text-box">
                    <h3 className="ref-feature-title">Exclusive Menus</h3>
                    <p className="ref-feature-desc">Special dishes & exclusive offers</p>
                  </div>
                </div>

                {/* Card 3: Loyalty Rewards */}
                <div className="ref-feature-card card-3">
                  <div className="ref-feature-icon-box">
                    <svg viewBox="0 0 48 48" width="26" height="26" fill="none">
                      {/* Gift Box SVG */}
                      <rect x="10" y="20" width="28" height="20" rx="3" fill="#FC8019" />
                      <rect x="8" y="14" width="32" height="6" rx="2" fill="#FA631C" />
                      <line x1="24" y1="14" x2="24" y2="40" stroke="#FFEFE5" strokeWidth="3.5" />
                      <path d="M24 14 C20 8 14 10 17 14 Z M24 14 C28 8 34 10 31 14 Z" fill="#FA631C" stroke="#FA631C" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="ref-feature-text-box">
                    <h3 className="ref-feature-title">Loyalty Rewards</h3>
                    <p className="ref-feature-desc">Earn points & enjoy exciting rewards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Photorealistic Food Composition */}
            <div className="ref-hero-right-column">
              <div className="ref-hero-food-stage">
                <img
                  src="/hero-3d-food.jpg"
                  alt="Delicious 3D Cheeseburger, French Fries, Pizza, and Sushi"
                  className="ref-hero-food-image"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Downstream Content Sections */}
      <div className="ref-downstream-content-wrapper">
        {/* 2. Special Offers Section */}
        <OfferBanner onSelectOffer={onSelectOffer} />

        {/* 3. Explore Categories Section */}
        <CategoryBar
          selectedCategory=""
          onSelectCategory={handleCategorySelect}
        />

        {/* 4. Top Restaurants Section */}
        <section className="popular-restaurants-section" id="top-restaurants">
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
