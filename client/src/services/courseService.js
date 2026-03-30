import api from './api';

export const courseService = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourseBySlug: (slug) => api.get(`/courses/slug/${slug}`),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.patch(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
};
