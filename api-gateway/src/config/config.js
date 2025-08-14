require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  services: {
    user: process.env.USER_SERVICE_URL || 'http://localhost:8001',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:8002',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:8003'
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
  }
};

module.exports = config; 