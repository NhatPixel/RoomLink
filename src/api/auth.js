import { apiRequest } from './config';

/**
 * Auth API
 */
export const authAPI = {
  /**
   * Đăng nhập
   * @param {string} identification - Số CCCD (12 số)
   * @param {string} password - Mật khẩu
   * @returns {Promise<{success: boolean, data: {userId: string, access_token: string}}>}
   */
  login: async (identification, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { identification, password },
    });
  },
  
  /**
   * Đăng ký
   * @param {object} registerData - Dữ liệu đăng ký
   * @returns {Promise<object>}
   */
  register: async (registerData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: registerData,
    });
  },

  /**
   * Đổi mật khẩu
   * @param {string} oldPassword - Mật khẩu cũ
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<object>}
   */
  changePassword: async (oldPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: { oldPassword, newPassword },
    });
  },

  /**
   * Quên mật khẩu
   * @param {string} email - Email
   * @returns {Promise<object>}
   */
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  /**
   * Reset mật khẩu
   * @param {string} token - Token reset
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<object>}
   */
  resetPassword: async (token, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    });
  },
};

