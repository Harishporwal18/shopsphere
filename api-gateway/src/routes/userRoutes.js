const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const serviceRegistry = require('../services/serviceRegistry');
const logger = require('../utils/logger');

const router = express.Router();

// Proxy middleware for user service
const userServiceProxy = createProxyMiddleware({
  target: serviceRegistry.getService('user')?.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info('Proxying to user service', {
      method: req.method,
      path: req.path,
      userId: req.user?.userId
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info('User service response received', {
      statusCode: proxyRes.statusCode,
      path: req.path
    });
  },
  onError: (err, req, res) => {
    logger.error('User service proxy error', {
      error: err.message,
      path: req.path
    });
    res.status(503).json({ error: 'User service temporarily unavailable' });
  }
});

// Authentication routes (no auth required)
router.post('/auth/register', authRateLimiter, userServiceProxy);
router.post('/auth/login', authRateLimiter, userServiceProxy);
router.post('/auth/refresh', userServiceProxy);

// User profile routes (auth required)
router.get('/profile', authenticateToken, userServiceProxy);
router.put('/profile', authenticateToken, userServiceProxy);
router.delete('/profile', authenticateToken, userServiceProxy);

// User management routes (optional auth for public profiles)
router.get('/:id', optionalAuth, userServiceProxy);
router.get('/:id/products', optionalAuth, userServiceProxy);

// Admin routes (auth required)
router.get('/', authenticateToken, userServiceProxy);
router.put('/:id', authenticateToken, userServiceProxy);
router.delete('/:id', authenticateToken, userServiceProxy);

module.exports = router; 