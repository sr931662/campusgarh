import api from './api';

export const courseService = {
  // Get all courses
  // In getCourses method, if examId is provided, filter by entranceExamRequirements
  getCourses: (params) => {
    let url = '/courses';
    if (params.examId) {
      url += `?examId=${params.examId}`;
    }
    return api.get(url, { params });
  },

  // Get course by slug
  getCourseBySlug: (slug) => api.get(`/courses/slug/${slug}`),

  // Get course by ID
  getCourseById: (id) => api.get(`/courses/${id}`),

  // Create course (admin)
  createCourse: (data) => api.post('/courses', data),

  // Update course (admin)
  updateCourse: (id, data) => api.patch(`/courses/${id}`, data),

  // Delete course (admin)
  deleteCourse: (id) => api.delete(`/courses/${id}`),
};