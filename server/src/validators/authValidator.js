const { body } = require('express-validator');
const { isEmail, isPassword } = require('./common');

// Add role field to registerValidator
const registerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  isEmail(),
  isPassword(),
  body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('role').optional().isIn(['student', 'institution_rep', 'counsellor']).withMessage('Invalid role'),
];

const loginValidator = [
  isEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  isEmail(),
];

const resetPasswordValidator = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // body('confirmPassword').custom((value, { req }) => value === req.body.password)
  //   .withMessage('Passwords do not match'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  isPassword('newPassword'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};