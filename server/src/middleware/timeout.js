const timeout = require('connect-timeout');

const timeoutMiddleware = timeout('30s'); // 30 seconds

const haltOnTimeout = (req, res, next) => {
  if (!req.timedout) next();
};

module.exports = { timeoutMiddleware, haltOnTimeout };