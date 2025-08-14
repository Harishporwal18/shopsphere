const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Access attempt without token', { ip: req.ip, path: req.path });
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.security.jwtSecret);
    req.user = decoded;
    logger.info('Token validated successfully', { userId: decoded.userId, path: req.path });
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { ip: req.ip, path: req.path, error: error.message });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.security.jwtSecret);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without authentication
      logger.debug('Invalid token in optional auth', { path: req.path });
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
}; 