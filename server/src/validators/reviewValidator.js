const { body, param } = require('express-validator');
const { isMongoId } = require('./common');

const createReviewValidator = [
  body('college').isMongoId().withMessage('Invalid college ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('content').notEmpty().withMessage('Content is required'),
  body('courseStudied').optional({ checkFalsy: true }).isString().trim(),
  body('graduationYear').optional({ checkFalsy: true }).isInt({ min: 1900, max: new Date().getFullYear() }),
];

const moderateReviewValidator = [
  isMongoId('reviewId'),
  body('status').isIn(['approved', 'rejected', 'flagged']).withMessage('Invalid status'),
];

module.exports = {
  createReviewValidator,
  moderateReviewValidator,
};