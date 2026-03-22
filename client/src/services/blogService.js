import api from './api';

export const blogService = {
  // Get all blogs
  getBlogs: (params) => api.get('/blogs', { params }),

  // Get blog by slug
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`),

  // Get blog categories
  getCategories: () => api.get('/blogs/categories'),

  // Get blogs by tag
  getBlogsByTag: (tag, params) => api.get(`/blogs/tag/${tag}`, { params }),

  // Get blog by ID
  getBlogById: (id) => api.get(`/blogs/${id}`),

  // Create blog (admin/moderator)
  createBlog: (data) => api.post('/blogs', data),

  // Update blog (admin/moderator)
  updateBlog: (id, data) => api.patch(`/blogs/${id}`, data),

  // Delete blog (admin/moderator)
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
};