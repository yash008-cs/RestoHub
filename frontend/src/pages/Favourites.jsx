import React, { useState } from 'react';
import { Heart, Utensils, Trash2, ArrowRight, Store, Plus, Star, MapPin, Sparkles, Clock, Compass, LogIn } from 'lucide-react';
import { useFavourites } from '../context/FavouritesContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { getRestaurantImage, getFoodImage, handleImageError, FALLBACK_RESTAURANT_IMAGE, FALLBACK_FOOD_IMAGE } from '../utils/imageMapper';

export const Favourites = ({ onSelectRestaurant, onNavigateRestaurants }) => {
  const { isAuthenticated, openLogin } = useAuth();
  const {
    favouriteRestaurants,
    favouriteFoods,
    toggleFavouriteRestaurant,
    toggleFavouriteFood,
  } = useFavourites();

  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' | 'foods'

  const handleExploreClick = () => {
    if (onNavigateRestaurants) {
      onNavigateRestaurants();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="favourites-page-container">
        {/* Hero / Header Section */}
        <div className="fav-hero-header">
          <div className="fav-header-content">
            <div className="fav-title-row">
              <div className="fav-heart-badge">
                <Heart size={26} className="fav-heart-icon" fill="#ea580c" color="#ea580c" />
              </div>
              <div>
                <h1 className="fav-page-title">My Favourites</h1>
                <p className="fav-page-subtitle">Quick access to your saved restaurants and dishes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="fav-content-body" style={{ marginTop: '2rem' }}>
          <div className="fav-empty-card">
            <div className="fav-empty-icon-glow">
              <Heart size={44} className="fav-empty-icon" fill="#ea580c" color="#ea580c" />
            </div>
            <h3 className="fav-empty-title">Please login to view your favourites</h3>
            <p className="fav-empty-desc">
              Your saved favourite restaurants and dishes are linked to your personal account. Login to view them!
            </p>
            <button className="fav-empty-cta-btn" onClick={() => openLogin && openLogin('login')}>
              <LogIn size={18} />
              <span>Login to Account</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favourites-page-container">
      {/* Hero / Header Section */}
      <div className="fav-hero-header">
        <div className="fav-header-content">
          <div className="fav-title-row">
            <div className="fav-heart-badge">
              <Heart size={26} className="fav-heart-icon" fill="#ea580c" color="#ea580c" />
            </div>
            <div>
              <h1 className="fav-page-title">My Favourites</h1>
              <p className="fav-page-subtitle">Quick access to your saved restaurants and dishes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher Segmented Control */}
      <div className="fav-tab-wrapper">
        <div className="fav-tab-segmented">
          <button
            className={`fav-tab-pill ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            <Store size={18} />
            <span>Restaurants</span>
            <span className="fav-count-pill">{favouriteRestaurants.length}</span>
          </button>
          <button
            className={`fav-tab-pill ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            <Utensils size={18} />
            <span>Food Dishes</span>
            <span className="fav-count-pill">{favouriteFoods.length}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="fav-content-body">
        {activeTab === 'restaurants' ? (
          favouriteRestaurants.length === 0 ? (
            <div className="fav-empty-card">
              <div className="fav-empty-icon-glow">
                <Store size={44} className="fav-empty-icon" />
              </div>
              <h3 className="fav-empty-title">No favourite restaurants saved yet</h3>
              <p className="fav-empty-desc">
                Explore top-rated restaurants in Pune and tap the heart icon on any venue to save it here!
              </p>
              
              <button className="fav-empty-cta-btn" onClick={handleExploreClick}>
                <Compass size={18} />
                <span>Explore Top Restaurants</span>
                <ArrowRight size={16} />
              </button>

              <div className="fav-empty-features">
                <div className="fav-feature-item">
                  <Sparkles size={16} className="feature-icon" />
                  <span>Instant Access</span>
                </div>
                <div className="fav-feature-item">
                  <Star size={16} className="feature-icon" />
                  <span>Top Rated Spots</span>
                </div>
                <div className="fav-feature-item">
                  <Clock size={16} className="feature-icon" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="fav-grid-container">
              {favouriteRestaurants.map((resto) => {
                const imgUrl = resto.imageUrl || getRestaurantImage(resto);
                return (
                  <div key={resto.id} className="fav-resto-card">
                    <div className="fav-resto-thumb-wrapper">
                      <img
                        src={imgUrl}
                        alt={resto.name}
                        className="fav-resto-img"
                        onError={(e) => handleImageError(e, FALLBACK_RESTAURANT_IMAGE)}
                      />
                      <div className="fav-resto-rating-badge">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{resto.rating || 4.5}</span>
                      </div>
                      <button
                        className="fav-card-remove-badge"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavouriteRestaurant(resto);
                        }}
                        title="Remove from favourites"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="fav-resto-info">
                      <h3 className="fav-resto-title">{resto.name}</h3>
                      <p className="fav-resto-address">
                        <MapPin size={14} />
                        <span>{resto.address || resto.locality || 'Pune'}</span>
                      </p>
                      {resto.cuisineType && (
                        <div className="fav-resto-cuisine-tag">{resto.cuisineType}</div>
                      )}
                    </div>

                    <div className="fav-resto-footer">
                      <button
                        className="fav-view-menu-btn"
                        onClick={() => onSelectRestaurant && onSelectRestaurant(resto.id)}
                      >
                        <span>View Menu</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : favouriteFoods.length === 0 ? (
          <div className="fav-empty-card">
            <div className="fav-empty-icon-glow">
              <Utensils size={44} className="fav-empty-icon" />
            </div>
            <h3 className="fav-empty-title">No favourite food dishes saved yet</h3>
            <p className="fav-empty-desc">
              Save your favorite dishes from restaurant menus so you can quickly reorder them anytime.
            </p>
            
            <button className="fav-empty-cta-btn" onClick={handleExploreClick}>
              <Compass size={18} />
              <span>Browse Restaurant Menus</span>
              <ArrowRight size={16} />
            </button>

            <div className="fav-empty-features">
              <div className="fav-feature-item">
                <Sparkles size={16} className="feature-icon" />
                <span>Quick Reorder</span>
              </div>
              <div className="fav-feature-item">
                <Star size={16} className="feature-icon" />
                <span>Delicious Options</span>
              </div>
              <div className="fav-feature-item">
                <Clock size={16} className="feature-icon" />
                <span>Hot & Fresh</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="fav-grid-container">
            {favouriteFoods.map((food) => {
              const foodImg = food.imageUrl || getFoodImage(food);
              const isVeg = food.isVeg !== undefined ? food.isVeg : food.category === 'Veg';
              return (
                <div key={food.id} className="fav-food-card">
                  <div className="fav-food-thumb-wrapper">
                    <img
                      src={foodImg}
                      alt={food.name}
                      className="fav-food-img"
                      onError={(e) => handleImageError(e, FALLBACK_FOOD_IMAGE)}
                    />
                    <button
                      className="fav-card-remove-badge"
                      onClick={() => toggleFavouriteFood(food)}
                      title="Remove from favourites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="fav-food-info">
                    <h4 className="fav-food-name">{food.name}</h4>
                    {food.restaurantName && (
                      <p className="fav-food-resto-name">by {food.restaurantName}</p>
                    )}
                    <p className="fav-food-desc">{food.description || 'Delicious dish made with fresh ingredients.'}</p>
                  </div>

                  <div className="fav-food-footer">
                    <span className="fav-food-price">{formatCurrency(food.price)}</span>
                    <button
                      className="fav-add-cart-btn"
                      onClick={() => addToCart(food)}
                    >
                      <Plus size={16} />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
