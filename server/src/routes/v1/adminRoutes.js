const express = require('express');
const adminController = require('../../controllers/adminController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');

const router = express.Router();

// All admin routes require admin authentication
router.use(protect, restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and operations
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/stats', adminController.getDashboardStats);

router.get('/analytics', adminController.getAnalytics);
router.get('/counsellors', adminController.getCounsellors);

/**
 * @swagger
 * /admin/bulk-delete-colleges:
 *   post:
 *     summary: Bulk delete colleges
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collegeIds
 *             properties:
 *               collegeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Colleges deleted
 */
router.post('/bulk-delete-colleges', adminController.bulkDeleteColleges);

// Additional admin routes can be added here

module.exports = router;