const express = require('express');
const collegeCourseController = require('../../controllers/collegeCourseController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CollegeCourse
 *   description: College-Course mapping
 */

/**
 * @swagger
 * /college-courses/college/{collegeId}:
 *   get:
 *     summary: Get courses for a college
 *     tags: [CollegeCourse]
 *     parameters:
 *       - in: path
 *         name: collegeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of courses with mapping details
 */
router.get('/college/:collegeId', collegeCourseController.getCoursesForCollege);

/**
 * @swagger
 * /college-courses/course/{courseId}:
 *   get:
 *     summary: Get colleges offering a course
 *     tags: [CollegeCourse]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of colleges with mapping details
 */
router.get('/course/:courseId', collegeCourseController.getCollegesForCourse);

// Admin only routes
router.use(protect, restrictTo('admin', 'moderator'));

/**
 * @swagger
 * /college-courses/{mappingId}:
 *   patch:
 *     summary: Update college-course mapping (admin/moderator)
 *     tags: [CollegeCourse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mappingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fees:
 *                 type: number
 *               seatIntake:
 *                 type: integer
 *               eligibility:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Mapping updated
 */
router.patch('/:mappingId', collegeCourseController.updateMapping);

module.exports = router;