const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const serviceRegistry = require('../services/serviceRegistry');
const logger = require('../utils/logger');

const router = express.Router();

// Proxy middleware for product service
const productServiceProxy = createProxyMiddleware({
  target: serviceRegistry.getService('product')?.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/api/products'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info('Proxying to product service', {
      method: req.method,
      path: req.path,
      userId: req.user?.userId
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info('Product service response received', {
      statusCode: proxyRes.statusCode,
      path: req.path
    });
  },
  onError: (err, req, res) => {
    logger.error('Product service proxy error', {
      error: err.message,
      path: req.path
    });
    res.status(503).json({ error: 'Product service temporarily unavailable' });
  }
});

// Public product routes (no auth required)
router.get('/', optionalAuth, productServiceProxy);
router.get('/:id', optionalAuth, productServiceProxy);
router.get('/category/:categoryId', optionalAuth, productServiceProxy);
router.get('/search', optionalAuth, productServiceProxy);

// Category routes (public)
router.get('/categories', optionalAuth, productServiceProxy);
router.get('/categories/:id', optionalAuth, productServiceProxy);

// Admin product management routes (auth required)
router.post('/', authenticateToken, productServiceProxy);
router.put('/:id', authenticateToken, productServiceProxy);
router.delete('/:id', authenticateToken, productServiceProxy);

// Admin category management routes (auth required)
router.post('/categories', authenticateToken, productServiceProxy);
router.put('/categories/:id', authenticateToken, productServiceProxy);
router.delete('/categories/:id', authenticateToken, productServiceProxy);

module.exports = router; 