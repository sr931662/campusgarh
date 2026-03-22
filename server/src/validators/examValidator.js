const { body, param } = require('express-validator');
const { isMongoId } = require('./common');

const createExamValidator = [
  body('name').notEmpty().withMessage('Exam name is required'),
  body('category').optional().isIn(['UG', 'PG', 'PhD', 'Diploma']),
];

const updateExamValidator = [
  isMongoId('id'),
  ...createExamValidator.map(rule => rule.optional()),
];

module.exports = {
  createExamValidator,
  updateExamValidator,
};