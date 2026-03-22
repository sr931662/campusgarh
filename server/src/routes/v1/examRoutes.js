const express = require('express');
const examController = require('../../controllers/examController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const {
  createExamValidator,
  updateExamValidator,
} = require('../../validators/examValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Entrance exam management
 */

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [UG, PG, PhD, Diploma]
 *     responses:
 *       200:
 *         description: List of exams
 */
router.get('/', examController.getAllExams);

/**
 * @swagger
 * /exams/upcoming:
 *   get:
 *     summary: Get upcoming exams
 *     tags: [Exams]
 *     responses:
 *       200:
 *         description: List of upcoming exams
 */
router.get('/upcoming', examController.getUpcomingExams);

/**
 * @swagger
 * /exams/slug/{slug}:
 *   get:
 *     summary: Get exam by slug
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam details
 */
router.get('/slug/:slug', examController.getExamBySlug);

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam details
 */
router.get('/:id', examController.getExamById);

// Admin only routes
router.use(protect, restrictTo('admin', 'moderator'));

/**
 * @swagger
 * /exams:
 *   post:
 *     summary: Create a new exam (admin)
 *     tags: [Exams]
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
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               overview:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               examPattern:
 *                 type: object
 *               importantDates:
 *                 type: array
 *     responses:
 *       201:
 *         description: Exam created
 */
router.post('/', createExamValidator, validate, examController.createExam);

/**
 * @swagger
 * /exams/{id}:
 *   patch:
 *     summary: Update an exam (admin)
 *     tags: [Exams]
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
 *         description: Exam updated
 */
router.patch('/:id', updateExamValidator, validate, examController.updateExam);

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     summary: Delete an exam (admin)
 *     tags: [Exams]
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
 *         description: Exam deleted
 */
router.delete('/:id', examController.deleteExam);

module.exports = router;