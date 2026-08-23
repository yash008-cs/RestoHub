import api from './api';

export const restaurantService = {
  /**
   * Fetch all active restaurants catalog
   */
  getAllRestaurants: async () => {
    try {
      const response = await api.get('/api/restaurants');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to fetch restaurants catalog.');
    }
  },

  /**
   * Fetch restaurant details by ID
   */
  getRestaurantById: async (id) => {
    try {
      const response = await api.get(`/api/restaurants/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Restaurant details not found.');
    }
  },
};
