import api from './api';

export const partnerService = {
  apply: (data) => api.post('/partners/apply', data),
  getAll: (params) => api.get('/partners', { params }),
  updateStatus: (id, data) => api.patch(`/partners/${id}/status`, data),
};
