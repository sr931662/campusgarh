const express = require('express');
const mediaController = require('../../controllers/mediaController');
const { protect } = require('../../middleware/auth');
const upload = require('../../middleware/uploadMemory');

const router = express.Router();

// All media routes require authentication (admin/moderator can upload)
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: File uploads and management
 */

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload a single file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               parentId:
 *                 type: string
 *               parentModel:
 *                 type: string
 *                 enum: [College, Blog, User]
 *               type:
 *                 type: string
 *                 enum: [image, video, document]
 *               alt:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded
 */
router.post('/upload', upload.single('file'), mediaController.uploadFile);

/**
 * @swagger
 * /media/upload-multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               parentId:
 *                 type: string
 *               parentModel:
 *                 type: string
 *               type:
 *                 type: string
 *               alt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Files uploaded
 */
router.post('/upload-multiple', upload.array('files', 10), mediaController.uploadMultiple);

/**
 * @swagger
 * /media/parent/{parentModel}/{parentId}:
 *   get:
 *     summary: Get media for a parent entity
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentModel
 *         required: true
 *         schema:
 *           type: string
 *           enum: [College, Blog, User]
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of media
 */
router.get('/parent/:parentModel/:parentId', mediaController.getMediaForParent);

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Delete a media file
 *     tags: [Media]
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
 *         description: Media deleted
 */
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;