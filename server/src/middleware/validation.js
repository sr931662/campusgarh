const { validationResult } = require('express-validator');
const ResponseHandler = require('../utils/responseHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseHandler.error(res, { message: 'Validation failed', details: errors.array() }, 400);
  }
  next();
};

module.exports = validate;