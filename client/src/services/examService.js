import api from './api';

export const examService = {
  // Get all exams
  getExams: (params) => api.get('/exams', { params }),

  // Get upcoming exams
  getUpcomingExams: () => api.get('/exams/upcoming'),

  // Get exam by slug
  getExamBySlug: (slug) => api.get(`/exams/slug/${slug}`),

  // Get exam by ID
  getExamById: (id) => api.get(`/exams/${id}`),

  // Create exam (admin)
  createExam: (data) => api.post('/exams', data),

  // Update exam (admin)
  updateExam: (id, data) => api.patch(`/exams/${id}`, data),

  // Delete exam (admin)
  deleteExam: (id) => api.delete(`/exams/${id}`),
};