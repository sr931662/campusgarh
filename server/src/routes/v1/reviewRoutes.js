const express = require('express');
const reviewController = require('../../controllers/reviewController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const {
  createReviewValidator,
  moderateReviewValidator,
} = require('../../validators/reviewValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: College reviews
 */

/**
 * @swagger
 * /reviews/college/{collegeId}:
 *   get:
 *     summary: Get reviews for a college
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: collegeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/college/:collegeId', reviewController.getCollegeReviews);

/**
 * @swagger
 * /reviews/college/{collegeId}/rating:
 *   get:
 *     summary: Get average rating for a college
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: collegeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Average rating
 */
router.get('/college/:collegeId/rating', reviewController.getAverageRating);

/**
 * @swagger
 * /reviews/{reviewId}/helpful:
 *   post:
 *     summary: Mark a review as helpful
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review marked helpful
 */
// Authenticated routes
router.use(protect);

router.post('/:reviewId/helpful', reviewController.markHelpful);
router.post('/:reviewId/flag', reviewController.flagReview);

router.get('/mine', reviewController.getMyReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review (authenticated)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - college
 *               - rating
 *               - title
 *               - content
 *             properties:
 *               college:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               courseStudied:
 *                 type: string
 *               graduationYear:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Review submitted
 */
router.post('/', createReviewValidator, validate, reviewController.createReview);

// Admin/Moderator routes
router.use(restrictTo('admin', 'moderator'));

router.get('/', reviewController.getAllReviews);

/**
 * @swagger
 * /reviews/{reviewId}/moderate:
 *   patch:
 *     summary: Moderate a review (admin/moderator)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, flagged]
 *               moderationNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review moderated
 */
router.patch('/:reviewId/moderate', moderateReviewValidator, validate, reviewController.moderateReview);

module.exports = router;