import api from './api';

export const userService = {
  // Get current user profile
  getProfile: () => api.get('/users/me'),

  // Update profile
  updateProfile: (data) => api.patch('/users/me', data),

  // Update academic details
  updateAcademicDetails: (data) => api.patch('/users/me/academic', data),

  // Update preferences
  updatePreferences: (data) => api.patch('/users/me/preferences', data),

  // Toggle saved college
  toggleSavedCollege: (collegeId) => api.post(`/users/saved-colleges/${collegeId}`),

  // Toggle saved course
  toggleSavedCourse: (courseId) => api.post(`/users/saved-courses/${courseId}`),

  // Admin: get all users
  getAllUsers: (params) => api.get('/users', { params }),

  // Admin: toggle user active status
  toggleActiveStatus: (userId, isActive) => api.patch(`/users/${userId}/toggle-active`, { isActive }),

  // Admin: assign role
  assignRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
};