const express = require('express');
const multer = require('multer');
const importExportController = require('../../controllers/importExportController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const {
  importExcelValidator,
  exportExcelValidator,
} = require('../../validators/importExportValidator');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// All import/export routes require admin authentication
router.use(protect, restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: ImportExport
 *   description: Bulk import/export of data
 */

/**
 * @swagger
 * /import-export/import:
 *   post:
 *     summary: Import data from Excel file
 *     tags: [ImportExport]
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
 *               model:
 *                 type: string
 *                 enum: [College, Course, Exam, User, Blog, Review, AdmissionEnquiry]
 *     responses:
 *       200:
 *         description: Import completed
 */
// multer MUST run first so req.body is populated before the validator reads it
router.post('/import', upload.single('file'), importExcelValidator, validate, importExportController.importExcel);

/**
 * @swagger
 * /import-export/export/{model}:
 *   get:
 *     summary: Export data to Excel
 *     tags: [ImportExport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *           enum: [College, Course, Exam, User, Blog, Review, AdmissionEnquiry]
 *       - in: query
 *         name: ... filters
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/:model', exportExcelValidator, validate, importExportController.exportExcel);

/**
 * @swagger
 * /import-export/logs:
 *   get:
 *     summary: Get import logs
 *     tags: [ImportExport]
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
 *         name: model
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processing, completed, failed, partial]
 *     responses:
 *       200:
 *         description: List of import logs
 */
router.get('/logs', importExportController.getImportLogs);

router.get('/template/:model', importExportController.downloadTemplate);

module.exports = router;