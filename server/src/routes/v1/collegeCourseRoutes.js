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
router.get('/course/:courseId', collegeCourseController.getCollegesForCourse);
router.get('/exam/:examId', collegeCourseController.getCollegesForExam);

// Admin only routes
router.use(protect, restrictTo('admin', 'moderator'));

router.post('/', collegeCourseController.createMapping);
router.patch('/:mappingId', collegeCourseController.updateMapping);
router.delete('/:mappingId', collegeCourseController.deleteMapping);

module.exports = router;