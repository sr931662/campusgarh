import api from './api';

export const adminService = {
  getStats:       () => api.get('/admin/stats'),
  getAnalytics:   () => api.get('/admin/analytics'),
  getCounsellors: () => api.get('/admin/counsellors'),
};
