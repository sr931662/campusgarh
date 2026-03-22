import api from './api';

export const authService = {
  // Register user
  register: (data) => api.post('/auth/register', data),

  // Login user
  login: (data) => api.post('/auth/login', data),

  // Logout
  logout: () => api.post('/auth/logout'),

  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),

  // Change password
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};