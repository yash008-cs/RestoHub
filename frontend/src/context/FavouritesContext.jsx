import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
  const { activeUser, isAuthenticated, openLogin, showToast } = useAuth();

  const [favouriteRestaurants, setFavouriteRestaurants] = useState([]);
  const [favouriteFoods, setFavouriteFoods] = useState([]);

  // Clean up legacy un-scoped localStorage keys if present
  useEffect(() => {
    try {
      localStorage.removeItem('restohub_fav_restaurants');
      localStorage.removeItem('restohub_fav_foods');
    } catch (e) {
      // Ignore
    }
  }, []);

  // Synchronize user-specific favourites when activeUser changes (login, logout, account switch)
  useEffect(() => {
    if (activeUser && activeUser.id) {
      try {
        const savedRestos = localStorage.getItem(`restohub_fav_restaurants_${activeUser.id}`);
        setFavouriteRestaurants(savedRestos ? JSON.parse(savedRestos) : []);
      } catch (e) {
        setFavouriteRestaurants([]);
      }

      try {
        const savedFoods = localStorage.getItem(`restohub_fav_foods_${activeUser.id}`);
        setFavouriteFoods(savedFoods ? JSON.parse(savedFoods) : []);
      } catch (e) {
        setFavouriteFoods([]);
      }
    } else {
      // WIPE memory state when user is logged out so no favourites are visible
      setFavouriteRestaurants([]);
      setFavouriteFoods([]);
    }
  }, [activeUser]);

  // Save favourite restaurants under user-scoped localStorage key
  useEffect(() => {
    if (activeUser && activeUser.id) {
      localStorage.setItem(`restohub_fav_restaurants_${activeUser.id}`, JSON.stringify(favouriteRestaurants));
    }
  }, [favouriteRestaurants, activeUser]);

  // Save favourite foods under user-scoped localStorage key
  useEffect(() => {
    if (activeUser && activeUser.id) {
      localStorage.setItem(`restohub_fav_foods_${activeUser.id}`, JSON.stringify(favouriteFoods));
    }
  }, [favouriteFoods, activeUser]);

  const toggleFavouriteRestaurant = (restaurant) => {
    if (!isAuthenticated || !activeUser) {
      if (showToast) showToast('Please login to save favourite restaurants', 'info');
      if (openLogin) openLogin('login');
      return;
    }

    setFavouriteRestaurants((prev) => {
      const exists = prev.some((r) => r.id === restaurant.id);
      if (exists) {
        return prev.filter((r) => r.id !== restaurant.id);
      }
      return [...prev, restaurant];
    });
  };

  const isRestaurantFavourite = (restaurantId) => {
    if (!isAuthenticated || !activeUser) return false;
    return favouriteRestaurants.some((r) => r.id === restaurantId);
  };

  const toggleFavouriteFood = (food) => {
    if (!isAuthenticated || !activeUser) {
      if (showToast) showToast('Please login to save favourite dishes', 'info');
      if (openLogin) openLogin('login');
      return;
    }

    setFavouriteFoods((prev) => {
      const exists = prev.some((f) => f.id === food.id);
      if (exists) {
        return prev.filter((f) => f.id !== food.id);
      }
      return [...prev, food];
    });
  };

  const isFoodFavourite = (foodId) => {
    if (!isAuthenticated || !activeUser) return false;
    return favouriteFoods.some((f) => f.id === foodId);
  };

  return (
    <FavouritesContext.Provider
      value={{
        favouriteRestaurants,
        favouriteFoods,
        toggleFavouriteRestaurant,
        isRestaurantFavourite,
        toggleFavouriteFood,
        isFoodFavourite,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
