const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class ServiceRegistry {
  constructor() {
    this.services = {
      user: {
        url: config.services.user,
        healthy: true,
        lastCheck: Date.now(),
        retryCount: 0
      },
      product: {
        url: config.services.product,
        healthy: true,
        lastCheck: Date.now(),
        retryCount: 0
      },
      order: {
        url: config.services.order,
        healthy: true,
        lastCheck: Date.now(),
        retryCount: 0
      }
    };
    
    this.healthCheckInterval = config.healthCheck.interval;
    this.startHealthChecks();
  }

  async checkServiceHealth(serviceName) {
    const service = this.services[serviceName];
    if (!service) return false;

    try {
      const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
      service.healthy = response.status === 200;
      service.lastCheck = Date.now();
      service.retryCount = 0;
      
      logger.info(`Service ${serviceName} health check passed`, { 
        url: service.url, 
        status: response.status 
      });
      
      return service.healthy;
    } catch (error) {
      service.healthy = false;
      service.retryCount++;
      service.lastCheck = Date.now();
      
      logger.warn(`Service ${serviceName} health check failed`, { 
        url: service.url, 
        error: error.message,
        retryCount: service.retryCount
      });
      
      return false;
    }
  }

  async checkAllServices() {
    const promises = Object.keys(this.services).map(serviceName => 
      this.checkServiceHealth(serviceName)
    );
    
    await Promise.allSettled(promises);
  }

  startHealthChecks() {
    setInterval(() => {
      this.checkAllServices();
    }, this.healthCheckInterval);
    
    logger.info('Service health checks started', { interval: this.healthCheckInterval });
  }

  getService(serviceName) {
    const service = this.services[serviceName];
    if (!service || !service.healthy) {
      logger.warn(`Service ${serviceName} is not available`, { 
        healthy: service?.healthy,
        retryCount: service?.retryCount 
      });
      return null;
    }
    return service;
  }

  getAllServices() {
    return this.services;
  }

  getServiceStatus() {
    return Object.entries(this.services).map(([name, service]) => ({
      name,
      url: service.url,
      healthy: service.healthy,
      lastCheck: service.lastCheck,
      retryCount: service.retryCount
    }));
  }
}

module.exports = new ServiceRegistry(); 