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
    const page  = parseInt(pagination.page)  || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip  = (page - 1) * limit;

    const query = { college: collegeId, status: 'approved', deletedAt: null };

    const [data, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name role academicBackground profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    return {
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
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

  // Mark helpful (toggle — one user one vote)
  async markHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    const alreadyMarked = review.helpfulBy.some(id => id.toString() === userId.toString());
    if (alreadyMarked) {
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId.toString());
    } else {
      review.helpfulBy.push(userId);
    }
    review.helpfulCount = review.helpfulBy.length;
    await review.save();
    return { helpful: !alreadyMarked, helpfulCount: review.helpfulCount };
  }
}

module.exports = new ReviewService();