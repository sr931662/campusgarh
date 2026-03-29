import api from './api';

export const userService = {
  getProfile:           ()           => api.get('/users/me'),
  updateProfile:        (data)       => api.patch('/users/me', data),
  updateAcademicDetails:(data)       => api.patch('/users/me/academic', data),
  updatePreferences:    (data)       => api.patch('/users/me/preferences', data),
  toggleSavedCollege:   (collegeId)  => api.post(`/users/saved-colleges/${collegeId}`),
  toggleSavedCourse:    (courseId)   => api.post(`/users/saved-courses/${courseId}`),
  requestRoleChange:    (data)       => api.post('/users/me/role-request', data),
  getMyRoleRequests:    ()           => api.get('/users/me/role-requests'),
  getAllRoleRequests:    (params)     => api.get('/users/role-requests', { params }),
  reviewRoleRequest:    (id, data)   => api.patch(`/users/role-requests/${id}`, data),
  getAllUsers:           (params)     => api.get('/users', { params }),
  toggleActiveStatus:   (userId, isActive) => api.patch(`/users/${userId}/toggle-active`, { isActive }),
  assignRole:           (userId, role)     => api.patch(`/users/${userId}/role`, { role }),
};
