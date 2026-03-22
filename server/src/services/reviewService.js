const mongoose = require('mongoose');
const Review = require('../models/Review');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');

class ReviewService extends BaseService {
  constructor() {
    super(Review);
  }

  // Create a review (pending moderation)
  async createReview(userId, data) {
    const existing = await Review.findOne({ user: userId, college: data.college });
    if (existing) throw new AppError('You have already reviewed this college', 400);
    const review = await this.create({ ...data, user: userId });
    return review;
  }

  // Moderate review (admin)
  async moderateReview(reviewId, status, moderationNotes) {
    const review = await this.updateById(reviewId, { status, moderationNotes });
    return review;
  }

  // Get reviews for a college (approved only)
  async getCollegeReviews(collegeId, pagination = {}) {
    const query = { college: collegeId, status: 'approved', deletedAt: null };
    return this.findAll(query, pagination, { createdAt: -1 });
  }

  // Get average rating for a college
  async getAverageRating(collegeId) {
    const result = await Review.aggregate([
      {
        $match: {
          college: new mongoose.Types.ObjectId(collegeId),
          status: 'approved',
          deletedAt: null,
        },
      },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return result[0] || { avgRating: 0, count: 0 };
  }

  // Flag a review (user)
  async flagReview(reviewId) {
    const review = await Review.findByIdAndUpdate(reviewId, { $inc: { reportedCount: 1 } }, { new: true });
    if (!review) throw new AppError('Review not found', 404);
    return review;
  }

  // Mark helpful
  async markHelpful(reviewId) {
    const review = await Review.findByIdAndUpdate(reviewId, { $inc: { helpfulCount: 1 } }, { new: true });
    if (!review) throw new AppError('Review not found', 404);
    return review;
  }
}

module.exports = new ReviewService();