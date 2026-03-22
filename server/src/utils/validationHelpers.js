const { body, param, query } = require('express-validator');

// Common validation rules
const validateObjectId = (field, name = 'ID') =>
  param(field).isMongoId().withMessage(`Invalid ${name}`);

const validateEmail = () =>
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail();

const validatePassword = (field = 'password') =>
  body(field)
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .withMessage('Password must contain at least one letter and one number');

const validatePhone = () =>
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number');

const validatePagination = () => [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  validateObjectId,
  validateEmail,
  validatePassword,
  validatePhone,
  validatePagination,
};