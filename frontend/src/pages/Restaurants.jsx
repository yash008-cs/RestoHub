import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ArrowRight, Store, Heart, Clock } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { useFavourites } from '../context/FavouritesContext';
import { getRestaurantImage, handleImageError, FALLBACK_RESTAURANT_IMAGE } from '../utils/imageMapper';

export const Restaurants = ({ onSelectRestaurant, searchQuery }) => {
  const { toggleFavouriteRestaurant, isRestaurantFavourite } = useFavourites();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');

  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantService.getAllRestaurants();
      setRestaurants(data || []);
    } catch (err) {
      setError(err.message || 'Could not load restaurants catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter((r) => {
    const query = searchTerm.toLowerCase().trim();
    return (
      !query ||
      r.name.toLowerCase().includes(query) ||
      (r.address && r.address.toLowerCase().includes(query)) ||
      (r.city && r.city.toLowerCase().includes(query)) ||
      (r.locality && r.locality.toLowerCase().includes(query)) ||
      (r.cuisineType && r.cuisineType.toLowerCase().includes(query))
    );
  });

  return (
    <div className="restaurants-page-wrapper">
      {/* Page Header */}
      <div className="section-header search-upper-flex">
        <div>
          <h1 className="section-title">All Partner Restaurants ({filtered.length})</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Discover authentic dining spots and food hubs delivering near you
          </p>
        </div>

        <div className="search-input-wrapper animated-search slid-upper">
          <Search size={18} className="search-icon-animated" />
          <input
            type="text"
            className="search-field"
            placeholder="Search restaurant by name or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading restaurants catalog...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-restaurants-box">
          <Store size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <h3>No Restaurants Found</h3>
          <p>Try searching for a different cuisine or location in Pune.</p>
        </div>
      ) : (
        <div className="grid-restaurants">
          {filtered.map((restaurant) => {
            const isFav = isRestaurantFavourite(restaurant.id);
            const isClosed = restaurant.acceptingOrders === false;
            const coverImg = getRestaurantImage(restaurant);

            return (
              <div
                key={restaurant.id}
                className={`clean-restaurant-card ${isClosed ? 'opacity-85' : ''}`}
                onClick={() => onSelectRestaurant(restaurant.id)}
              >
                <div className="card-thumb-header">
                  <img
                    src={coverImg}
                    alt={restaurant.name}
                    className="resto-cover-img"
                    onError={(e) => handleImageError(e, FALLBACK_RESTAURANT_IMAGE)}
                    loading="lazy"
                  />
                  <div className="card-top-badges">
                    <span className="rating-badge">
                      <Star size={13} fill="#F59E0B" stroke="none" />
                      {restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}
                    </span>
                    <button
                      className={`fav-heart-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavouriteRestaurant(restaurant);
                      }}
                      title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                    >
                      <Heart size={16} fill={isFav ? '#EF4444' : 'none'} color={isFav ? '#EF4444' : '#ffffff'} />
                    </button>
                  </div>
                </div>

                <div className="card-info-body">
                  <h3 className="resto-title-name">{restaurant.name}</h3>
                  {isClosed && (
                    <div className="closed-status-tag">
                      🔴 Not accepting orders right now
                    </div>
                  )}
                  <p className="resto-cuisine-text">{restaurant.cuisineType || 'North Indian • Biryani • Fast Food'}</p>
                  <p className="resto-location-text">
                    <MapPin size={13} /> {restaurant.locality || restaurant.address || 'Pune'}, {restaurant.city || 'Pune'}
                  </p>
                  <div className="resto-delivery-meta">
                    <span className="del-time"><Clock size={13} /> 25-30 min</span>
                    <span className="del-fee">₹30 Delivery</span>
                    <span className="del-cost">₹300 for two</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
