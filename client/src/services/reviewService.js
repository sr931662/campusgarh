import api from './api';

export const reviewService = {
  // Get reviews for a college
  getCollegeReviews: (collegeId, params) => api.get(`/reviews/college/${collegeId}`, { params }),

  // Get average rating for a college
  getAverageRating: (collegeId) => api.get(`/reviews/college/${collegeId}/rating`),

  // Create a review (authenticated)
  createReview: (data) => api.post('/reviews', data),

  // Mark review helpful
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),

  // Flag review
  flagReview: (reviewId) => api.post(`/reviews/${reviewId}/flag`),

  // Get current user's own reviews
  getUserReviews: () => api.get('/reviews/mine'),

  // Admin: get all reviews (filterable by status)
  getAllReviews: (params) => api.get('/reviews', { params }),

  // Moderate review (admin/moderator)
  moderateReview: (reviewId, status, moderationNotes) =>
    api.patch(`/reviews/${reviewId}/moderate`, { status, moderationNotes }),
};