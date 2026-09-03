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
  Sun,
  UserCheck,
  Users,
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
        const [restoResult, foodResult] = await Promise.allSettled([
          restaurantService.getAllRestaurants(),
          foodService.getAllFoodItems(),
        ]);
        if (restoResult.status === 'fulfilled') {
          setRestaurants(restoResult.value || []);
        } else {
          console.error('Failed to load restaurants:', restoResult.reason);
          setError(restoResult.reason?.message || 'Unable to fetch restaurants catalog.');
        }
        if (foodResult.status === 'fulfilled') {
          const allFoods = foodResult.value || [];
          // Prioritize signature Pune dishes with authentic photography
          const FEATURED_POPULAR_NAMES = [
            'Butter Chicken',
            'Misal Pav',
            'Dal Tadka',
            'Paratha',
            'Puran Poli',
            'Chicken Dum Biryani',
            'Vada Pav',
            'Thalipeeth',
          ];
          const prioritized = [];
          const seen = new Set();
          for (const target of FEATURED_POPULAR_NAMES) {
            const found = allFoods.find(
              (f) => f.name.toLowerCase() === target.toLowerCase() && !seen.has(f.id)
            );
            if (found) {
              prioritized.push(found);
              seen.add(found.id);
            }
          }
          const remaining = allFoods.filter((f) => !seen.has(f.id));
          setPopularFoods([...prioritized, ...remaining]);
        } else {
          console.error('Failed to load foods:', foodResult.reason);
        }
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
          {/* Left Column: Top Badge, Headline, Description, CTA, and 3 Feature Cards */}
          <div className="ref-hero-left-column">
            <div className="ref-hero-text-group">
              {/* Top Badge matching reference */}
              <div className="ref-hero-top-badge">
                <Sun size={15} className="ref-badge-icon" />
                <span>Pune's Premium Food Hub</span>
              </div>

              <h1 className="ref-hero-headline">
                <span className="ref-headline-line line-1">
                  Delicious <span className="ref-orange-text">Food</span>,
                </span>
                <span className="ref-headline-line line-2">
                  Delivered <span className="ref-orange-text">Fast</span>
                </span>
              </h1>

              <p className="ref-hero-paragraph">
                Order your favorite dishes from top restaurants in town.
                We deliver deliciousness to your doorstep.
                Hungry for convenience? <strong>Let's get started!</strong>
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

            {/* 3 Feature Cards (Below hero text) */}
            <div className="ref-feature-cards-container">
              {/* Card 1: Fast Delivery */}
              <div className="ref-feature-card card-1">
                <div className="ref-feature-icon-box">
                  <Bike size={24} color="#FC8019" />
                </div>
                <div className="ref-feature-text-box">
                  <h3 className="ref-feature-title">FAST DELIVERY</h3>
                  <p className="ref-feature-desc">On-time delivery at your doorstep</p>
                </div>
              </div>

              {/* Card 2: Exclusive Menus */}
              <div className="ref-feature-card card-2">
                <div className="ref-feature-icon-box">
                  <UtensilsCrossed size={24} color="#FC8019" />
                </div>
                <div className="ref-feature-text-box">
                  <h3 className="ref-feature-title">EXCLUSIVE MENUS</h3>
                  <p className="ref-feature-desc">Special dishes &amp; exclusive offers</p>
                </div>
              </div>

              {/* Card 3: Loyalty Rewards */}
              <div className="ref-feature-card card-3">
                <div className="ref-feature-icon-box">
                  <Gift size={24} color="#FC8019" />
                </div>
                <div className="ref-feature-text-box">
                  <h3 className="ref-feature-title">LOYALTY REWARDS</h3>
                  <p className="ref-feature-desc">Earn points &amp; enjoy exciting rewards</p>
                </div>
              </div>
            </div>
          </div>

          {/* Master Gourmet Food Composition (Large Pizza + Complementary Food Elements) */}
          <img
            src={`${import.meta.env.BASE_URL}images/hero-food-composition.png`}
            alt="Artisan Gourmet Pizza & Delicious Sides Composition"
            className="ref-hero-food-composition"
            loading="eager"
            onError={(e) => {
              if (!e.currentTarget.dataset.fallbackTried) {
                e.currentTarget.dataset.fallbackTried = 'true';
                e.currentTarget.src = '/images/hero-food-composition.png';
                return;
              }
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* 5. Statistics Bar (Below hero section) */}
        <div className="ref-stats-bar-wrapper">
          <div className="ref-stats-bar-card">
            <div className="ref-stat-item">
              <div className="ref-stat-icon-wrap">
                <Clock size={22} className="ref-stat-icon" />
              </div>
              <div className="ref-stat-text-wrap">
                <span className="ref-stat-val">25–30 min</span>
                <span className="ref-stat-lbl">Average Delivery</span>
              </div>
            </div>

            <div className="ref-stat-divider" />

            <div className="ref-stat-item">
              <div className="ref-stat-icon-wrap">
                <UserCheck size={22} className="ref-stat-icon" />
              </div>
              <div className="ref-stat-text-wrap">
                <span className="ref-stat-val">500+</span>
                <span className="ref-stat-lbl">Top Restaurants</span>
              </div>
            </div>

            <div className="ref-stat-divider" />

            <div className="ref-stat-item">
              <div className="ref-stat-icon-wrap">
                <Star size={22} className="ref-stat-icon" />
              </div>
              <div className="ref-stat-text-wrap">
                <span className="ref-stat-val">4.6</span>
                <span className="ref-stat-lbl">Average Rating</span>
              </div>
            </div>

            <div className="ref-stat-divider" />

            <div className="ref-stat-item">
              <div className="ref-stat-icon-wrap">
                <Users size={22} className="ref-stat-icon" />
              </div>
              <div className="ref-stat-text-wrap">
                <span className="ref-stat-val">50K+</span>
                <span className="ref-stat-lbl">Happy Customers</span>
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
                        alt={dish.name === 'Paratha' ? 'Butter Naan' : dish.name}
                        className="dish-cover-img"
                        onError={(e) => handleImageError(e, FALLBACK_FOOD_IMAGE)}
                        loading="lazy"
                      />
                    </div>

                    <div className="dish-info-box">
                      <h3 className="dish-title">{dish.name === 'Paratha' ? 'Butter Naan' : dish.name}</h3>
                      <p className="dish-resto-sub">{dish.name === 'Paratha' ? 'Authentic charred golden butter naan brushed with butter' : (dish.description || 'Delicious freshly prepared specialty')}</p>
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
