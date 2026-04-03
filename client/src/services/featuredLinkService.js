import api from './api';

export const featuredLinkService = {
  getAll:  (params) => api.get('/featured-links', { params }),
  create:  (data)   => api.post('/featured-links', data),
  update:  (id, data) => api.patch(`/featured-links/${id}`, data),
  remove:  (id)     => api.delete(`/featured-links/${id}`),
};
