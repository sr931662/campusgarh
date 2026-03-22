const { body, param } = require('express-validator');
const { isMongoId } = require('./common');

const createCourseValidator = [
  body('name').notEmpty().withMessage('Course name is required'),
  body('category').isIn(['UG', 'PG', 'Diploma', 'Doctorate', 'Certificate']).withMessage('Invalid category'),
  body('duration').notEmpty().withMessage('Duration is required'),
];

const updateCourseValidator = [
  isMongoId('id'),
  ...createCourseValidator.map(rule => rule.optional()),
];

const getCourseBySlugValidator = [
  param('slug').notEmpty().withMessage('Slug is required'),
];

module.exports = {
  createCourseValidator,
  updateCourseValidator,
  getCourseBySlugValidator,
};