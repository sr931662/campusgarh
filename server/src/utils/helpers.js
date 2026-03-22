const crypto = require('crypto');

// Generate random string (e.g., for OTP, tokens)
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Check if object is empty
const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

// Sanitize search query to prevent injection (basic)
const sanitizeSearch = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Extract error messages from validation result
const extractValidationErrors = (errors) => {
  return errors.array().map((err) => ({ field: err.param, message: err.msg }));
};

module.exports = {
  generateRandomString,
  isEmptyObject,
  sanitizeSearch,
  extractValidationErrors,
};