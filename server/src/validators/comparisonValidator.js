const { body } = require('express-validator');
const { isMongoId } = require('./common');

const createComparisonValidator = [
  body('type').optional().isIn(['college', 'course', 'exam']).withMessage('type must be college, course, or exam'),
  body('name').optional().trim(),
  body('collegeIds').optional().isArray({ min: 2 }),
  body('collegeIds.*').optional().isMongoId(),
  body('courseIds').optional().isArray({ min: 2 }),
  body('courseIds.*').optional().isMongoId(),
  body('examIds').optional().isArray({ min: 2 }),
  body('examIds.*').optional().isMongoId(),
];

const updateComparisonValidator = [
  isMongoId('id'),
  body('type').optional().isIn(['college', 'course', 'exam']),
  body('collegeIds').optional().isArray({ min: 2 }),
  body('collegeIds.*').optional().isMongoId(),
  body('courseIds').optional().isArray({ min: 2 }),
  body('courseIds.*').optional().isMongoId(),
  body('examIds').optional().isArray({ min: 2 }),
  body('examIds.*').optional().isMongoId(),
];

module.exports = { createComparisonValidator, updateComparisonValidator };
