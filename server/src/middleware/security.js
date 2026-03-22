const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

// Custom NoSQL injection protection compatible with Express 5
// express-mongo-sanitize tries to assign req.query which is read-only in Express 5
// So we manually sanitize only body and params
const noSqlSanitize = (req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
};

const securityMiddleware = [
  helmet(),
  compression(),
  noSqlSanitize,
];

module.exports = securityMiddleware;