const { body, param } = require('express-validator');

const importExcelValidator = [
  body('model').isIn(['College', 'Course', 'Exam', 'User', 'Blog', 'Review', 'AdmissionEnquiry']).withMessage('Invalid model'),
];

const exportExcelValidator = [
  param('model').isIn(['College', 'Course', 'Exam', 'User', 'Blog', 'Review', 'AdmissionEnquiry']).withMessage('Invalid model'),
];

module.exports = {
  importExcelValidator,
  exportExcelValidator,
};