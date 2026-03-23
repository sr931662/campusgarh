import api from './api';

export const collegeService = {
  // Get all colleges with filters
  getColleges: (params) => api.get('/colleges', { params }),

  // Get featured colleges
  getFeatured: (params) => api.get('/colleges/featured', { params }),

  // Get colleges by course
  getCollegesByCourse: (courseId, params) => api.get(`/colleges/course/${courseId}`, { params }),

  // Get college by slug
  getCollegeBySlug: (slug) => api.get(`/colleges/slug/${slug}`),

  // Get college by ID
  getCollegeById: (id) => api.get(`/colleges/${id}`),

  // Programmatic SEO: colleges by course slug + location
  getCollegesByCourseAndLocation: (courseSlug, location, params) =>
    api.get(`/colleges/seo/${courseSlug}/${location}`, { params }),

  // Create college (admin)
  createCollege: (data) => api.post('/colleges', data),

  // Update college (admin)
  updateCollege: (id, data) => api.patch(`/colleges/${id}`, data),

  // Delete college (admin)
  deleteCollege: (id) => api.delete(`/colleges/${id}`),

  // Upload college logo (admin) — formData with field 'logo'
  uploadCollegeLogo: (id, formData) =>
    api.patch(`/colleges/${id}/logo`, formData, { headers: { 'Content-Type': undefined } }),
};