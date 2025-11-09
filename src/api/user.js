import { apiRequest } from './config';

/**
 * User API
 */
export const userAPI = {
  /**
   * Lấy thông tin user hiện tại
   * @returns {Promise<object>} Thông tin user
   */
  getUser: async () => {
    return apiRequest('/user', {
      method: 'GET',
    });
  },
};

