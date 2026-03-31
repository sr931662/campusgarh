import api from './api';

export const accreditationService = {
  getAll:  (params) => api.get('/accreditation', { params }),
  create:  (data)   => api.post('/accreditation', data),
  update:  (id, data) => api.patch(`/accreditation/${id}`, data),
  remove:  (id)     => api.delete(`/accreditation/${id}`),
};
