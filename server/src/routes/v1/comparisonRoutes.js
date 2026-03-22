const express = require('express');
const comparisonController = require('../../controllers/comparisonController');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const {
  createComparisonValidator,
  updateComparisonValidator,
} = require('../../validators/comparisonValidator');

const router = express.Router();

// All comparison routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Comparisons
 *   description: College comparisons
 */

/**
 * @swagger
 * /comparisons:
 *   post:
 *     summary: Create a new comparison
 *     tags: [Comparisons]
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
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comparison created
 */
router.post('/', createComparisonValidator, validate, comparisonController.createComparison);

/**
 * @swagger
 * /comparisons:
 *   get:
 *     summary: Get all comparisons for current user
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of comparisons
 */
router.get('/', comparisonController.getUserComparisons);

/**
 * @swagger
 * /comparisons/{id}:
 *   get:
 *     summary: Get a comparison by ID
 *     tags: [Comparisons]
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
 *         description: Comparison details
 */
router.get('/:id', comparisonController.getComparison);

/**
 * @swagger
 * /comparisons/{id}:
 *   patch:
 *     summary: Update a comparison (add/remove colleges)
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - collegeIds
 *             properties:
 *               collegeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Comparison updated
 */
router.patch('/:id', updateComparisonValidator, validate, comparisonController.updateComparison);

/**
 * @swagger
 * /comparisons/{id}:
 *   delete:
 *     summary: Delete a comparison
 *     tags: [Comparisons]
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
 *         description: Comparison deleted
 */
router.delete('/:id', comparisonController.deleteComparison);

module.exports = router;