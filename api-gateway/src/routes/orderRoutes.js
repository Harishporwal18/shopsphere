const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateToken } = require('../middleware/auth');
const { orderRateLimiter } = require('../middleware/rateLimiter');
const serviceRegistry = require('../services/serviceRegistry');
const logger = require('../utils/logger');

const router = express.Router();

// Proxy middleware for order service
const orderServiceProxy = createProxyMiddleware({
  target: serviceRegistry.getService('order')?.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info('Proxying to order service', {
      method: req.method,
      path: req.path,
      userId: req.user?.userId
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info('Order service response received', {
      statusCode: proxyRes.statusCode,
      path: req.path
    });
  },
  onError: (err, req, res) => {
    logger.error('Order service proxy error', {
      error: err.message,
      path: req.path
    });
    res.status(503).json({ error: 'Order service temporarily unavailable' });
  }
});

// Order routes (all require authentication)
router.get('/', authenticateToken, orderServiceProxy);
router.get('/:id', authenticateToken, orderServiceProxy);
router.get('/user/:userId', authenticateToken, orderServiceProxy);

// Order creation and management (with rate limiting)
router.post('/', authenticateToken, orderRateLimiter, orderServiceProxy);
router.put('/:id', authenticateToken, orderServiceProxy);
router.delete('/:id', authenticateToken, orderServiceProxy);

// Order status updates
router.patch('/:id/status', authenticateToken, orderServiceProxy);
router.patch('/:id/cancel', authenticateToken, orderServiceProxy);

// Order items
router.get('/:id/items', authenticateToken, orderServiceProxy);
router.post('/:id/items', authenticateToken, orderServiceProxy);
router.put('/:id/items/:itemId', authenticateToken, orderServiceProxy);
router.delete('/:id/items/:itemId', authenticateToken, orderServiceProxy);

module.exports = router; 