import api from './api';

const BASE = '/video-testimonials';

export const videoTestimonialService = {
  getAll: () => api.get(BASE),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.patch(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
};
