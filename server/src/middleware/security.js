const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const noSqlSanitize = (req, res, next) => {
  if (req.body)   req.body   = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
};

const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'", "'unsafe-inline'", "'unsafe-eval'",
                         "https://accounts.google.com",
                         "https://apis.google.com"],
        styleSrc:       ["'self'", "'unsafe-inline'",
                         "https://fonts.googleapis.com"],
        fontSrc:        ["'self'", "data:",
                         "https://fonts.googleapis.com",
                         "https://fonts.gstatic.com"],
        imgSrc:         ["'self'", "data:", "blob:",
                         "https://res.cloudinary.com",
                         "https://lh3.googleusercontent.com",
                         "https://*.googleusercontent.com",
                         "https://campusgarh.com",
                         "https://www.campusgarh.com",
                         "*"],               // images can come from any college website
        connectSrc:     ["'self'",
                         "https://campusgarh-252666950431.asia-south2.run.app",
                         "https://campusgarh.com",
                         "https://www.campusgarh.com",
                         "https://accounts.google.com"],
        frameSrc:       ["'self'",
                         "https://accounts.google.com"],
        objectSrc:      ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,    // needed for Cloudinary embeds
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
  compression(),
  noSqlSanitize,
];

module.exports = securityMiddleware;
