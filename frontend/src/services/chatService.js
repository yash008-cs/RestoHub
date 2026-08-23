import apiClient from './api';

export const chatService = {
  /**
   * Sends a user message prompt to Spring Boot backend endpoint POST /api/chat
   * @param {string} message - User message text
   * @returns {Promise<{response: string}>} - Backend AI response payload
   */
  async sendMessage(message) {
    const response = await apiClient.post('/api/chat', { message });
    return response.data;
  },
};
