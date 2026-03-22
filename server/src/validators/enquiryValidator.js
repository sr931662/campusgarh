const { body, param, query } = require('express-validator');
const { isMongoId, isEmail, isPhone } = require('./common');

const createEnquiryValidator = [
  body('studentName').notEmpty().withMessage('Name is required'),
  isPhone('phone'),
  isEmail(),
  body('courseInterest').optional().isMongoId().withMessage('Invalid course ID'),
  body('collegeInterest').optional().isMongoId().withMessage('Invalid college ID'),
  body('message').optional().trim(),
];

const assignEnquiryValidator = [
  isMongoId('enquiryId'),
  isMongoId('counsellorId', 'Counsellor ID'),
];

const addNoteValidator = [
  isMongoId('enquiryId'),
  body('note').notEmpty().withMessage('Note text is required'),
];

const updateCallStatusValidator = [
  isMongoId('enquiryId'),
  body('callStatus').isIn(['pending', 'connected', 'not_reachable', 'follow_up']).withMessage('Invalid call status'),
  body('followUpDate').optional().isISO8601().toDate(),
];

const updateConversionStatusValidator = [
  isMongoId('enquiryId'),
  body('conversionStatus').isIn(['new', 'contacted', 'interested', 'not_interested', 'converted', 'lost']),
];

module.exports = {
  createEnquiryValidator,
  assignEnquiryValidator,
  addNoteValidator,
  updateCallStatusValidator,
  updateConversionStatusValidator,
};