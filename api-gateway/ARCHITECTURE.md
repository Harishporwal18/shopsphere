# API Gateway Architecture Deep Dive

## Overview

The ShopSphere API Gateway is a **reverse proxy** that sits between clients and microservices. It handles cross-cutting concerns like authentication, rate limiting, logging, and service discovery.

## Request Flow

```
Client Request → API Gateway → Microservice → Response
                ↓
        [Middleware Chain]
```

### Example: `/api/users/auth/register`

1. **Client sends POST** to `http://localhost:3000/api/users/auth/register`
2. **API Gateway receives** the request
3. **Middleware processes** the request:
   - Rate limiting check
   - Request logging
   - CORS validation
4. **Route matching** finds `/api/users` → `userRoutes.js`
5. **Proxy forwards** to `http://localhost:8001/api/users/auth/register`
6. **User Service (Laravel)** processes the registration
7. **Response flows back** through the gateway to the client

## Security Architecture

### 1. **Authentication Middleware** (`src/middleware/auth.js`)

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, config.security.jwtSecret);
    req.user = decoded; // Attaches user info to request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

**What it does:**
- Extracts JWT token from Authorization header
- Validates token signature
- Attaches decoded user info to `req.user`
- Protects routes that require authentication

### 2. **Rate Limiting** (`src/middleware/rateLimiter.js`)

```javascript
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,               // 5 attempts
  'Too many authentication attempts'
);
```

**Protection levels:**
- **Global**: 100 requests per 15 minutes per IP
- **Auth**: 5 attempts per 15 minutes per IP
- **Orders**: 10 requests per minute per IP

### 3. **Security Headers** (Helmet.js)

```javascript
app.use(helmet()); // Adds security headers
```

**Headers added:**
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: XSS protection
- `Strict-Transport-Security`: HTTPS enforcement

## Service Communication

### 1. **Service Registry** (`src/services/serviceRegistry.js`)

```javascript
class ServiceRegistry {
  constructor() {
    this.services = {
      user: { url: 'http://localhost:8001', healthy: true },
      product: { url: 'http://localhost:8002', healthy: true },
      order: { url: 'http://localhost:8003', healthy: true }
    };
  }
  
  async checkServiceHealth(serviceName) {
    // HTTP GET to /health endpoint
    const response = await axios.get(`${service.url}/health`);
    service.healthy = response.status === 200;
  }
}
```

**Features:**
- **Service Discovery**: Knows where each service is located
- **Health Monitoring**: Checks service availability every 30 seconds
- **Failover**: Can detect and report unhealthy services

### 2. **Proxy Middleware** (`src/routes/userRoutes.js`)

```javascript
const userServiceProxy = createProxyMiddleware({
  target: serviceRegistry.getService('user')?.url,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Logs the proxied request
    logger.info('Proxying to user service', {
      method: req.method,
      path: req.path,
      userId: req.user?.userId
    });
  }
});
```

**What happens:**
- **Target Resolution**: Gets service URL from registry
- **Request Forwarding**: Forwards request with original headers
- **Response Handling**: Streams response back to client
- **Error Handling**: Returns 503 if service is unavailable

## Metrics & Monitoring

### 1. **Request Logging**

```javascript
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});
```

**Logged data:**
- HTTP method and path
- Client IP address
- User agent
- Timestamp
- Request ID (for tracing)

### 2. **Health Monitoring**

```javascript
// Gateway health
GET /health → {
  status: 'healthy',
  uptime: 12345,
  memory: { rss: 123456, heapUsed: 78901 }
}

// All services health
GET /health/services → {
  status: 'healthy',
  services: [
    { name: 'user', healthy: true, lastCheck: '2024-01-01T00:00:00Z' },
    { name: 'product', healthy: true, lastCheck: '2024-01-01T00:00:00Z' }
  ]
}
```

### 3. **Performance Metrics**

```javascript
// Response time logging
onProxyRes: (proxyRes, req, res) => {
  const responseTime = Date.now() - req.startTime;
  logger.info('Service response', {
    service: 'user',
    statusCode: proxyRes.statusCode,
    responseTime: `${responseTime}ms`
  });
}
```

## Error Handling

### 1. **Service Unavailable**

```javascript
onError: (err, req, res) => {
  logger.error('Service proxy error', {
    error: err.message,
    path: req.path
  });
  res.status(503).json({ 
    error: 'User service temporarily unavailable' 
  });
}
```

### 2. **Global Error Handler**

```javascript
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    path: req.path
  });
  
  res.status(500).json({
    error: 'Internal server error',
    message: config.env === 'development' ? error.message : 'Something went wrong'
  });
});
```

## Configuration Management

### 1. **Environment Variables** (`src/config/config.js`)

```javascript
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  services: {
    user: process.env.USER_SERVICE_URL || 'http://localhost:8001',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:8002',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:8003'
  }
};
```

### 2. **Service URLs**

- **Development**: `http://localhost:8001`
- **Docker**: `http://user-service:80`
- **Production**: `https://user-service.example.com`

## Running the System

### 1. **Start All Services**

```bash
# Make script executable
chmod +x start-all-services.sh

# Run the startup script
./start-all-services.sh
```

### 2. **Individual Service Management**

```bash
# Start specific service
docker-compose up -d user-service

# View logs
docker-compose logs -f api-gateway

# Stop all services
docker-compose down
```

### 3. **Health Checks**

```bash
# Check gateway health
curl http://localhost:3000/health

# Check all services
curl http://localhost:3000/health/services

# Check specific service
curl http://localhost:3000/health/services/user
```

## Testing the Flow

### 1. **User Registration Flow**

```bash
# 1. Register a user (goes through gateway to user service)
curl -X POST http://localhost:3000/api/users/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# 2. Login (goes through gateway to user service)
curl -X POST http://localhost:3000/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### 2. **Product Catalog Flow**

```bash
# Get products (goes through gateway to product service)
curl http://localhost:3000/api/products

# Get categories (goes through gateway to product service)
curl http://localhost:3000/api/products/categories
```

### 3. **Order Creation Flow**

```bash
# Create order (requires authentication, goes through gateway to order service)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"products":[{"id":1,"quantity":2}]}'
```

## Key Benefits

1. **Centralized Security**: All authentication and rate limiting in one place
2. **Service Discovery**: Automatic health monitoring and failover
3. **Unified API**: Single entry point for all microservices
4. **Monitoring**: Centralized logging and metrics
5. **Scalability**: Easy to add new services or scale existing ones
6. **Load Balancing**: Can distribute requests across multiple instances

## Troubleshooting

### Common Issues

1. **Service Unavailable (503)**
   - Check if microservice is running
   - Verify service URL in configuration
   - Check service health endpoint

2. **Authentication Errors (401/403)**
   - Verify JWT_SECRET configuration
   - Check token format in Authorization header
   - Ensure token hasn't expired

3. **Rate Limiting (429)**
   - Check rate limit configuration
   - Monitor request frequency
   - Consider increasing limits for development

4. **CORS Issues**
   - Verify CORS_ORIGIN configuration
   - Check if client origin matches allowed origins
   - Ensure credentials are properly handled 