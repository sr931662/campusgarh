const express = require('express');
const blogController = require('../../controllers/blogController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const {
  createBlogValidator,
  updateBlogValidator,
  getBlogBySlugValidator,
} = require('../../validators/blogValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog articles
 */

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs (public)
 *     tags: [Blogs]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of blogs
 */
router.get('/', blogController.getAllBlogs);

/**
 * @swagger
 * /blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 */
router.get('/slug/:slug', getBlogBySlugValidator, validate, blogController.getBlogBySlug);

/**
 * @swagger
 * /blogs/tag/{tag}:
 *   get:
 *     summary: Get blogs by tag
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: tag
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
 *         description: List of blogs
 */
router.get('/tag/:tag', blogController.getBlogsByTag);

// Add this new route for categories
router.get('/categories', blogController.getCategories);

router.get('/featured', blogController.getFeaturedBlogs);


/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 */
router.get('/:id', blogController.getBlogById);

// Authenticated routes (admin, author)
router.use(protect, restrictTo('admin', 'moderator'));

// Admin-only: returns ALL blogs regardless of status
router.get('/admin/all', blogController.getAllBlogsAdmin);


router.patch('/:id/featured', blogController.toggleFeatured);

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a blog post (admin/moderator)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               categories:
 *                 type: array
 *               tags:
 *                 type: array
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               seo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Blog created
 */
router.post('/', createBlogValidator, validate, blogController.createBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   patch:
 *     summary: Update a blog post (admin/moderator)
 *     tags: [Blogs]
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
 *         description: Blog updated
 */
router.patch('/:id', updateBlogValidator, validate, blogController.updateBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog post (admin/moderator)
 *     tags: [Blogs]
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
 *         description: Blog deleted
 */
router.delete('/:id', blogController.deleteBlog);

module.exports = router;