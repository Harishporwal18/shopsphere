const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const logger = require('../utils/logger');

const createRateLimiter = (windowMs, max, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        limit: max,
        windowMs
      });
      res.status(429).json({ error: message });
    }
  });
};

const globalRateLimiter = createRateLimiter(
  config.security.rateLimitWindowMs,
  config.security.rateLimitMaxRequests,
  'Too many requests from this IP'
);

const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts'
);

const orderRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 attempts
  'Too many order requests'
);

module.exports = {
  globalRateLimiter,
  authRateLimiter,
  orderRateLimiter
}; 