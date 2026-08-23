import apiClient from './api';

export const foodService = {
  async getAllFoodItems() {
    const response = await apiClient.get('/api/foods');
    return response.data;
  },

  async getFoodById(id) {
    const response = await apiClient.get(`/api/foods/${id}`);
    return response.data;
  },

  async getFoodsByRestaurantId(restaurantId) {
    const response = await apiClient.get(`/api/restaurants/${restaurantId}/foods`);
    return response.data;
  },

  async addFoodItem(foodData) {
    const response = await apiClient.post('/api/foods', foodData);
    return response.data;
  },

  async updateFood(id, foodData) {
    const response = await apiClient.put(`/api/foods/${id}`, foodData);
    return response.data;
  },

  async deleteFood(id) {
    await apiClient.delete(`/api/foods/${id}`);
  },
};
