const AppError = require('../utils/AppError');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// For fine-grained permissions (if using permissions map)
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Not authenticated', 401));
    // Assuming user role has permissions stored in Role model
    // This is simplified; you may need to fetch role permissions
    const Role = require('../models/Role');
    Role.findOne({ name: req.user.role }).then(role => {
      if (role && role.permissions.get(permission) === true) {
        next();
      } else {
        next(new AppError('Insufficient permissions', 403));
      }
    }).catch(() => next(new AppError('Error checking permissions', 500)));
  };
};

module.exports = { restrictTo, hasPermission };