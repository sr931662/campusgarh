import api from './api';

export const mediaService = {
  // Upload single file
  uploadFile: (formData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Upload multiple files
  uploadMultiple: (formData) => api.post('/media/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Get media for parent
  getMediaForParent: (parentModel, parentId) =>
    api.get(`/media/parent/${parentModel}/${parentId}`),

  // Delete media
  deleteMedia: (id) => api.delete(`/media/${id}`),
};