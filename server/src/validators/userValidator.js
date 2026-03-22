const { body, param } = require('express-validator');
const { isMongoId, isEmail, isPhone } = require('./common');

const updateProfileValidator = [
  body('name').optional().trim(),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('academicBackground').optional().isObject(),
  body('preferredCourses').optional().isArray(),
  body('preferredCities').optional().isArray(),
];

const toggleSavedCollegeValidator = [
  isMongoId('collegeId'),
];

const toggleSavedCourseValidator = [
  isMongoId('courseId'),
];

const assignRoleValidator = [
  isMongoId('userId'),
  body('role').isIn(['student', 'admin', 'counsellor', 'moderator', 'institution_rep']).withMessage('Invalid role'),
];

module.exports = {
  updateProfileValidator,
  toggleSavedCollegeValidator,
  toggleSavedCourseValidator,
  assignRoleValidator,
};