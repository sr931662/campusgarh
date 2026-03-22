const express = require('express');
const userController = require('../../controllers/userController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const {
  updateProfileValidator,
  toggleSavedCollegeValidator,
  toggleSavedCourseValidator,
  assignRoleValidator,
} = require('../../validators/userValidator');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', userController.getProfile);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               academicBackground:
 *                 type: object
 *               preferredCourses:
 *                 type: array
 *               preferredCities:
 *                 type: array
 *               budgetRange:
 *                 type: object
 *               interests:
 *                 type: array
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/me', updateProfileValidator, validate, userController.updateProfile);

/**
 * @swagger
 * /users/me/academic:
 *   patch:
 *     summary: Update academic details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Academic details updated
 */
router.patch('/me/academic', userController.updateAcademicDetails);

/**
 * @swagger
 * /users/me/preferences:
 *   patch:
 *     summary: Update preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.patch('/me/preferences', userController.updatePreferences);

/**
 * @swagger
 * /users/saved-colleges/{collegeId}:
 *   post:
 *     summary: Toggle saved college
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collegeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Toggled
 */
router.post('/saved-colleges/:collegeId', toggleSavedCollegeValidator, validate, userController.toggleSavedCollege);

/**
 * @swagger
 * /users/saved-courses/{courseId}:
 *   post:
 *     summary: Toggle saved course
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Toggled
 */
router.post('/saved-courses/:courseId', toggleSavedCourseValidator, validate, userController.toggleSavedCourse);

// Admin only routes
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', restrictTo('admin'), userController.getAllUsers);

/**
 * @swagger
 * /users/{userId}/toggle-active:
 *   patch:
 *     summary: Toggle user active status (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:userId/toggle-active', restrictTo('admin'), userController.toggleActiveStatus);

/**
 * @swagger
 * /users/{userId}/role:
 *   patch:
 *     summary: Assign role to user (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, admin, counsellor, moderator, institution_rep]
 *     responses:
 *       200:
 *         description: Role assigned
 */
router.patch('/:userId/role', restrictTo('admin'), assignRoleValidator, validate, userController.assignRole);

module.exports = router;