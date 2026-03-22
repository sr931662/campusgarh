const express = require('express');
const courseController = require('../../controllers/courseController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const {
  createCourseValidator,
  updateCourseValidator,
  getCourseBySlugValidator,
} = require('../../validators/courseValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [UG, PG, Diploma, Doctorate, Certificate]
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [Full-time, Part-time, Online, Distance]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /courses/slug/{slug}:
 *   get:
 *     summary: Get course by slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 */
router.get('/slug/:slug', getCourseBySlugValidator, validate, courseController.getCourseBySlug);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 */
router.get('/:id', courseController.getCourseById);

// Admin only routes
router.use(protect, restrictTo('admin', 'moderator'));

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course (admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [UG, PG, Diploma, Doctorate, Certificate]
 *               duration:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               entranceExamRequirements:
 *                 type: array
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 */
router.post('/', createCourseValidator, validate, courseController.createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   patch:
 *     summary: Update a course (admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Course updated
 */
router.patch('/:id', updateCourseValidator, validate, courseController.updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course (admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 */
router.delete('/:id', courseController.deleteCourse);

module.exports = router;