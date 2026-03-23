const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const reviewService = require('../services/reviewService');

class ReviewController {
  // Create a review
  createReview = catchAsync(async (req, res) => {
    const review = await reviewService.createReview(req.user.id, req.body);
    ResponseHandler.success(res, review, 'Review submitted, awaiting moderation', 201);
  });

  // Get reviews for a college (public)
  getCollegeReviews = catchAsync(async (req, res) => {
    const { collegeId } = req.params;
    const { page, limit } = req.query;
    const result = await reviewService.getCollegeReviews(collegeId, { page, limit });
    ResponseHandler.success(res, result);
  });

  // Get average rating for a college
  getAverageRating = catchAsync(async (req, res) => {
    const { collegeId } = req.params;
    const stats = await reviewService.getAverageRating(collegeId);
    ResponseHandler.success(res, stats);
  });

  // Admin: moderate review
  moderateReview = catchAsync(async (req, res) => {
    const { reviewId } = req.params;
    const { status, moderationNotes } = req.body;
    const review = await reviewService.moderateReview(reviewId, status, moderationNotes);
    ResponseHandler.success(res, review, 'Review moderated');
  });

  // Admin: get all reviews with optional status filter
  getAllReviews = catchAsync(async (req, res) => {
    const Review = require('../models/Review');
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { deletedAt: null };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email')
        .populate('college', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);
    ResponseHandler.success(res, { data: reviews, total, page: Number(page), limit: Number(limit) });
  });

  // Get current user's own reviews
  getMyReviews = catchAsync(async (req, res) => {
    const Review = require('../models/Review');
    const reviews = await Review.find({ user: req.user.id, deletedAt: null })
      .populate('college', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    ResponseHandler.success(res, reviews);
  });

  // Flag review (user)
  flagReview = catchAsync(async (req, res) => {
    const { reviewId } = req.params;
    const review = await reviewService.flagReview(reviewId);
    ResponseHandler.success(res, review);
  });

  // Mark review as helpful (toggle)
  markHelpful = catchAsync(async (req, res) => {
    const { reviewId } = req.params;
    const result = await reviewService.markHelpful(reviewId, req.user.id);
    ResponseHandler.success(res, result);
  });
}

module.exports = new ReviewController();