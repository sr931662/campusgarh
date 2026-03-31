import api from './api';

export const enquiryService = {
  // Create enquiry (public)
  createEnquiry: (data) => api.post('/enquiries', data),

  // Get assigned enquiries (counsellor)
  getMyEnquiries: (params) => api.get('/enquiries/my', { params }),

  // Get all enquiries (admin)
  getAllEnquiries: (params) => api.get('/enquiries', { params }),

  // Get single enquiry
  getEnquiry: (id) => api.get(`/enquiries/${id}`),

  // Add note
  addNote: (enquiryId, note) => api.post(`/enquiries/${enquiryId}/note`, { note }),

  // Update call status
  updateCallStatus: (enquiryId, callStatus, followUpDate) =>
    api.patch(`/enquiries/${enquiryId}/call-status`, { callStatus, followUpDate }),

  // Update conversion status
  updateConversionStatus: (enquiryId, conversionStatus) =>
    api.patch(`/enquiries/${enquiryId}/conversion-status`, { conversionStatus }),

  // Assign enquiry (admin)
  assignEnquiry: (enquiryId, counsellorId) =>
    api.post(`/enquiries/${enquiryId}/assign/${counsellorId}`),

  // Partner: get own leads (paginated)
  getPartnerLeads: (params) => api.get('/enquiries/partner-leads', { params }),

  deleteEnquiry: (id) => api.delete(`/enquiries/${id}`),

  // Analytics
  getCounsellorAnalytics: () => api.get('/enquiries/analytics/counsellors'),
  getPartnerAnalytics: (partnerId) =>
    api.get('/enquiries/analytics/partner', { params: partnerId ? { partnerId } : {} }),
};