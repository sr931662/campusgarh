class ResponseHandler {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, error, statusCode = 500) {
    let message = 'Internal server error';
    let details = null;
    if (error.isOperational) {
      message = error.message;
      statusCode = error.statusCode;
    } else if (error.name === 'ValidationError') {
      message = 'Validation error';
      details = Object.values(error.errors).map((e) => e.message);
      statusCode = 400;
    } else if (error.name === 'CastError') {
      message = 'Invalid ID format';
      statusCode = 400;
    } else if (error.code === 11000) {
      message = 'Duplicate field value';
      statusCode = 400;
    }
    return res.status(statusCode).json({
      success: false,
      message,
      details,
    });
  }
}

module.exports = ResponseHandler;