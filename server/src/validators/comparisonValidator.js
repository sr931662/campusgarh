const { body, param } = require('express-validator');
const { isMongoId } = require('./common');

const createComparisonValidator = [
  body('collegeIds').isArray({ min: 2 }).withMessage('At least two colleges are required'),
  body('collegeIds.*').isMongoId().withMessage('Invalid college ID'),
  body('name').optional().trim(),
];

const updateComparisonValidator = [
  isMongoId('id'),
  body('collegeIds').isArray({ min: 2 }).withMessage('At least two colleges are required'),
  body('collegeIds.*').isMongoId().withMessage('Invalid college ID'),
];

module.exports = {
  createComparisonValidator,
  updateComparisonValidator,
};