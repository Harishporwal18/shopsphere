# ShopSphere API Gateway

A centralized API Gateway for managing communication between ShopSphere microservices. This gateway provides routing, authentication, rate limiting, and service discovery for all microservices.

## Features

- **Service Routing**: Routes requests to appropriate microservices
- **Authentication**: JWT-based authentication and authorization
- **Rate Limiting**: Configurable rate limiting for different endpoints
- **Service Discovery**: Automatic health checks and service status monitoring
- **Load Balancing**: Basic load balancing capabilities
- **Security**: Helmet.js security headers and CORS configuration
- **Logging**: Structured logging with Winston
- **Health Monitoring**: Comprehensive health check endpoints
- **Error Handling**: Centralized error handling and logging

## Architecture

```
Client Request → API Gateway → Microservice
                ↓
        [Authentication, Rate Limiting, 
         Logging, Routing, Error Handling]
```

## Services

- **User Service**: Authentication, user management
- **Product Service**: Product catalog, categories
- **Order Service**: Order management, processing

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)
- Access to microservices (ports 8001, 8002, 8003)

## Installation

### Local Development

1. Clone the repository and navigate to the API Gateway directory:
```bash
cd api-gateway
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
USER_SERVICE_URL=http://localhost:8001
PRODUCT_SERVICE_URL=http://localhost:8002
ORDER_SERVICE_URL=http://localhost:8003
JWT_SECRET=your-secure-jwt-secret
```

5. Start the gateway:
```bash
npm run dev
```

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. Or build and run individually:
```bash
docker build -t shopsphere-api-gateway .
docker run -p 3000:3000 shopsphere-api-gateway
```

## API Endpoints

### Health Checks
- `GET /health` - Gateway health status
- `GET /health/services` - All services health status
- `GET /health/services/:serviceName` - Individual service health
- `POST /health/services/check` - Force health check

### User Service Routes
- `POST /api/users/auth/register` - User registration
- `POST /api/users/auth/login` - User login
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### Product Service Routes
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `GET /api/products/category/:categoryId` - Products by category
- `GET /api/products/search` - Search products

### Order Service Routes
- `GET /api/orders` - List orders (authenticated)
- `POST /api/orders` - Create order (authenticated)
- `GET /api/orders/:id` - Get order details (authenticated)
- `PATCH /api/orders/:id/status` - Update order status (authenticated)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Gateway port | 3000 |
| `USER_SERVICE_URL` | User service URL | http://localhost:8001 |
| `PRODUCT_SERVICE_URL` | Product service URL | http://localhost:8002 |
| `ORDER_SERVICE_URL` | Order service URL | http://localhost:8003 |
| `JWT_SECRET` | JWT signing secret | your-jwt-secret-key |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Rate Limiting

- **Global**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Orders**: 10 requests per minute

## Monitoring

### Health Checks
The gateway performs automatic health checks on all microservices every 30 seconds by default.

### Logging
- **File Logs**: Stored in `logs/` directory
- **Console Logs**: Available in development mode
- **Structured Logs**: JSON format with metadata

### Metrics
- Request/response logging
- Service health status
- Error tracking
- Performance monitoring

## Security

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: DDoS protection
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request validation middleware

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Project Structure
```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── services/        # Business logic
├── utils/           # Utility functions
└── server.js        # Main server file
```

## Troubleshooting

### Common Issues

1. **Service Unavailable**: Check if microservices are running
2. **Authentication Errors**: Verify JWT_SECRET configuration
3. **CORS Issues**: Check CORS_ORIGIN configuration
4. **Rate Limiting**: Monitor rate limit headers in responses

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in environment variables.

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

MIT License - see LICENSE file for details. 