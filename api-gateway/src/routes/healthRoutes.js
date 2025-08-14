const express = require('express');
const serviceRegistry = require('../services/serviceRegistry');
const logger = require('../utils/logger');

const router = express.Router();

// Gateway health check
router.get('/gateway', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// All services health status
router.get('/services', (req, res) => {
  const services = serviceRegistry.getServiceStatus();
  const allHealthy = services.every(service => service.healthy);
  
  res.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: services,
    summary: {
      total: services.length,
      healthy: services.filter(s => s.healthy).length,
      unhealthy: services.filter(s => !s.healthy).length
    }
  });
});

// Individual service health check
router.get('/services/:serviceName', (req, res) => {
  const { serviceName } = req.params;
  const service = serviceRegistry.getService(serviceName);
  
  if (!service) {
    return res.status(404).json({
      error: 'Service not found',
      serviceName
    });
  }
  
  res.json({
    service: serviceName,
    status: service.healthy ? 'healthy' : 'unhealthy',
    url: service.url,
    lastCheck: new Date(service.lastCheck).toISOString(),
    retryCount: service.retryCount
  });
});

// Force health check for all services
router.post('/services/check', async (req, res) => {
  try {
    logger.info('Manual health check triggered');
    await serviceRegistry.checkAllServices();
    
    const services = serviceRegistry.getServiceStatus();
    res.json({
      message: 'Health check completed',
      timestamp: new Date().toISOString(),
      services: services
    });
  } catch (error) {
    logger.error('Manual health check failed', { error: error.message });
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
});

module.exports = router; 