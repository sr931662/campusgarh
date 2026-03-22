import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
};