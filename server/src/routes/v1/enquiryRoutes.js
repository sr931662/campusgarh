const express = require('express');
const enquiryController = require('../../controllers/enquiryController');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/roleCheck');
const validate = require('../../middleware/validation');
const {
  createEnquiryValidator,
  assignEnquiryValidator,
  addNoteValidator,
  updateCallStatusValidator,
  updateConversionStatusValidator,
} = require('../../validators/enquiryValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Enquiries
 *   description: Admission enquiries / leads
 */

/**
 * @swagger
 * /enquiries:
 *   post:
 *     summary: Create a new enquiry (public)
 *     tags: [Enquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentName
 *               - phone
 *               - email
 *             properties:
 *               studentName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               courseInterest:
 *                 type: string
 *               collegeInterest:
 *                 type: string
 *               preferredCity:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enquiry submitted
 */
router.post('/', createEnquiryValidator, validate, (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookie     = req.cookies?.jwt;
  if (authHeader || cookie) {
    return require('../../middleware/auth').protect(req, res, next);
  }
  next();
}, enquiryController.createEnquiry);
// Authenticated routes (counsellors, admin)
router.use(protect);

/**
 * @swagger
 * /enquiries/my:
 *   get:
 *     summary: Get enquiries assigned to current counsellor
 *     tags: [Enquiries]
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
 *         name: conversionStatus
 *         schema:
 *           type: string
 *           enum: [new, contacted, interested, not_interested, converted, lost]
 *       - in: query
 *         name: callStatus
 *         schema:
 *           type: string
 *           enum: [pending, connected, not_reachable, follow_up]
 *       - in: query
 *         name: followUp
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of enquiries
 */
router.get('/my', restrictTo('counsellor', 'admin'), enquiryController.getMyEnquiries);

// Analytics + partner-leads — must be before /:id to avoid route conflict
router.get('/analytics/counsellors', restrictTo('admin'), enquiryController.getCounsellorAnalytics);
router.get('/analytics/partner', restrictTo('admin', 'partner'), enquiryController.getPartnerAnalytics);
router.get('/partner-leads', restrictTo('admin', 'partner'), enquiryController.getPartnerLeads);

/**
 * @swagger
 * /enquiries/{enquiryId}:
 *   get:
 *     summary: Get a specific enquiry (assigned counsellor or admin)
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enquiry details
 */
router.get('/export/csv', restrictTo('admin'), enquiryController.exportEnquiries);
router.delete('/:id',     restrictTo('admin'), enquiryController.deleteEnquiry);
router.patch('/:id',      restrictTo('admin'), enquiryController.updateEnquiry);  // also add this missing route

router.get('/:id', enquiryController.getEnquiry);

/**
 * @swagger
 * /enquiries/{enquiryId}/note:
 *   post:
 *     summary: Add a note to enquiry (counsellor/admin)
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enquiryId
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
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added
 */
router.post('/:enquiryId/note', addNoteValidator, validate, enquiryController.addNote);

/**
 * @swagger
 * /enquiries/{enquiryId}/call-status:
 *   patch:
 *     summary: Update call status (counsellor/admin)
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enquiryId
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
 *               - callStatus
 *             properties:
 *               callStatus:
 *                 type: string
 *                 enum: [pending, connected, not_reachable, follow_up]
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Call status updated
 */
router.patch('/:enquiryId/call-status', updateCallStatusValidator, validate, enquiryController.updateCallStatus);

/**
 * @swagger
 * /enquiries/{enquiryId}/conversion-status:
 *   patch:
 *     summary: Update conversion status (counsellor/admin)
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enquiryId
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
 *               - conversionStatus
 *             properties:
 *               conversionStatus:
 *                 type: string
 *                 enum: [new, contacted, interested, not_interested, converted, lost]
 *     responses:
 *       200:
 *         description: Conversion status updated
 */
router.patch('/:enquiryId/conversion-status', updateConversionStatusValidator, validate, enquiryController.updateConversionStatus);

// Admin only routes
router.use(restrictTo('admin'));

/**
 * @swagger
 * /enquiries:
 *   get:
 *     summary: Get all enquiries (admin)
 *     tags: [Enquiries]
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
 *         name: assignedTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: conversionStatus
 *         schema:
 *           type: string
 *           enum: [new, contacted, interested, not_interested, converted, lost]
 *     responses:
 *       200:
 *         description: List of enquiries
 */
router.get('/', enquiryController.getAllEnquiries);

/**
 * @swagger
 * /enquiries/{enquiryId}/assign/{counsellorId}:
 *   post:
 *     summary: Assign enquiry to counsellor (admin)
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: counsellorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enquiry assigned
 */
router.post('/:enquiryId/assign/:counsellorId', assignEnquiryValidator, validate, enquiryController.assignEnquiry);

module.exports = router;