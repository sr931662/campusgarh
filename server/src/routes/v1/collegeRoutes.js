const express = require('express');
const collegeController = require('../../controllers/collegeController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const upload = require('../../middleware/upload');
const {
  createCollegeValidator,
  updateCollegeValidator,
  getCollegeBySlugValidator,
  getCollegesByCourseValidator,
} = require('../../validators/collegeValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Colleges
 *   description: College management
 */

/**
 * @swagger
 * /colleges:
 *   get:
 *     summary: Get all colleges with filters
 *     tags: [Colleges]
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
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Private, Government, Public-Private]
 *       - in: query
 *         name: ranking
 *         schema:
 *           type: integer
 *       - in: query
 *         name: feesMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: feesMax
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of colleges
 */
router.get('/', collegeController.getAllColleges);

/**
 * @swagger
 * /colleges/featured:
 *   get:
 *     summary: Get featured colleges
 *     tags: [Colleges]
 *     parameters:
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
 *         description: Featured colleges
 */
router.get('/featured', collegeController.getFeaturedColleges);

router.get('/online', collegeController.getOnlineColleges);


/**
 * @swagger
 * /colleges/seo/{courseSlug}/{location}:
 *   get:
 *     summary: Programmatic SEO - get colleges by course slug and location (city/state)
 *     tags: [Colleges]
 *     description: Powers pages like /btech-colleges-in-delhi
 *     parameters:
 *       - in: path
 *         name: courseSlug
 *         required: true
 *         schema:
 *           type: string
 *         example: btech
 *       - in: path
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         example: delhi
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
 *         description: Colleges offering the course in that location
 */
router.get('/seo/:courseSlug/:location', collegeController.getCollegesByCourseAndLocation);

/**
 * @swagger
 * /colleges/course/{courseId}:
 *   get:
 *     summary: Get colleges offering a specific course
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *         description: Colleges offering the course
 */
router.get('/course/:courseId', getCollegesByCourseValidator, validate, collegeController.getCollegesByCourse);

/**
 * @swagger
 * /colleges/slug/{slug}:
 *   get:
 *     summary: Get college by slug (SEO)
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College details
 */
router.get('/slug/:slug', getCollegeBySlugValidator, validate, collegeController.getCollegeBySlug);

/**
 * @swagger
 * /colleges/{id}:
 *   get:
 *     summary: Get college by ID
 *     tags: [Colleges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College details
 */
router.get('/:id', collegeController.getCollegeById);

// Admin only routes
router.use(protect, restrictTo('admin', 'moderator'));

/**
 * @swagger
 * /colleges:
 *   post:
 *     summary: Create a new college (admin)
 *     tags: [Colleges]
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
 *               - description
 *               - collegeType
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               collegeType:
 *                 type: string
 *                 enum: [Private, Government, Public-Private]
 *               contact:
 *                 type: object
 *               rankings:
 *                 type: array
 *               placementStats:
 *                 type: object
 *     responses:
 *       201:
 *         description: College created
 */
router.post('/', createCollegeValidator, validate, collegeController.createCollege);

/**
 * @swagger
 * /colleges/{id}:
 *   patch:
 *     summary: Update a college (admin)
 *     tags: [Colleges]
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
 *         description: College updated
 */
router.patch('/:id', updateCollegeValidator, validate, collegeController.updateCollege);
router.patch('/:id/logo', upload.single('logo'), collegeController.uploadLogo);

/**
 * @swagger
 * /colleges/{id}:
 *   delete:
 *     summary: Delete a college (admin)
 *     tags: [Colleges]
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
 *         description: College deleted
 */
router.delete('/:id', collegeController.deleteCollege);

module.exports = router;