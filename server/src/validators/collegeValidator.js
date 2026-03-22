const { body, param } = require('express-validator');
const { isMongoId, isPagination } = require('./common');

const COLLEGE_TYPES = [
  'Engineering & Technology', 'Medical & Health Sciences', 'Management & Business',
  'Law', 'Arts & Science', 'Architecture & Planning', 'Pharmacy', 'Agriculture',
  'Education & Teaching', 'Design & Fine Arts', 'Commerce & Finance', 'Technical',
  'Multi-Disciplinary',
];

const FUNDING_TYPES = [
  'Government', 'Private', 'Semi-Government', 'Public-Private Partnership',
  'Deemed University', 'Private University', 'Central University', 'State University',
  'Autonomous', 'Minority Institution',
];

const createCollegeValidator = [
  body('name').notEmpty().withMessage('College name is required').trim(),
  body('collegeType').optional().isIn(COLLEGE_TYPES).withMessage('Invalid college type'),
  body('fundingType').optional().isIn(FUNDING_TYPES).withMessage('Invalid funding type'),
  body('contact.email').optional().isEmail().withMessage('Invalid email'),
  body('contact.phone').optional().isMobilePhone('any').withMessage('Invalid phone'),
];

const updateCollegeValidator = [
  isMongoId('id'),
  ...createCollegeValidator.map(rule => rule.optional()),
];

const getCollegeBySlugValidator = [
  param('slug').notEmpty().withMessage('Slug is required'),
];

const getCollegesByCourseValidator = [
  isMongoId('courseId', 'Course ID'),
  ...isPagination(),
];

module.exports = {
  createCollegeValidator,
  updateCollegeValidator,
  getCollegeBySlugValidator,
  getCollegesByCourseValidator,
};