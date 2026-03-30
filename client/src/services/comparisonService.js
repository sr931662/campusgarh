import api from './api';

export const comparisonService = {
  // Create a comparison
  createComparison: (data) => api.post('/comparisons', data),

  // Get user comparisons
  getUserComparisons: () => api.get('/comparisons'),

  // Get comparison by ID
  getComparison: (id) => api.get(`/comparisons/${id}`),

  // Update comparison (add/remove colleges)
  updateComparison: (id, data) => api.patch(`/comparisons/${id}`, data),

  // Delete comparison
  deleteComparison: (id) => api.delete(`/comparisons/${id}`),
};