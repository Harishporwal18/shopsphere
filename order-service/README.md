# ShopSphere - Laravel Microservices E-commerce Platform

A modern e-commerce platform built with Laravel microservices architecture, featuring separate services for user management, product catalog, and order processing.

## 🏗️ Architecture Overview

This application consists of three independent microservices:

- **User Service** (Port 8001) - Handles authentication, user registration, profile management
- **Product Service** (Port 8002) - Manages products, categories, inventory
- **Order Service** (Port 8003) - Processes orders, manages order status

## 🛠️ Technology Stack

- **Backend**: Laravel 10.x
- **Database**: PostgreSQL
- **Authentication**: Laravel Passport

## 📋 Prerequisites

- PHP 8.1 or higher
- Composer
- PostgreSQL 14+
- Node.js & NPM
- Git

## 🚀 Quick Setup

### Option 1: Docker Setup (Recommended)

Since `docker-compose.yml` is already present in the repository:

```bash
# Clone and start with Docker
git clone https://github.com/Harishporwal18/shopsphere.git
cd shopsphere

# Start all services with Docker
docker-compose up -d

# Run migrations and seeders
docker-compose exec user-service php artisan migrate:fresh --seed
docker-compose exec user-service php artisan passport:install --force
docker-compose exec product-service php artisan migrate:fresh --seed  
docker-compose exec order-service php artisan migrate:fresh --seed
```

### Option 2: Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Harishporwal18/shopsphere.git
cd shopsphere
```

### 2. Database Setup (For Local Development Only)

*Skip this section if using Docker - databases are configured automatically*

Create three PostgreSQL databases with different ports:

```sql
-- Database 1 (Port 5432)
CREATE DATABASE user_service;
CREATE USER user_admin WITH PASSWORD 'rgvfcr';
GRANT ALL PRIVILEGES ON DATABASE user_service TO user_admin;

-- Database 2 (Port 5433) 
CREATE DATABASE product_service;
CREATE USER product_admin WITH PASSWORD 'fvfd';
GRANT ALL PRIVILEGES ON DATABASE product_service TO product_admin;

-- Database 3 (Port 5434)
CREATE DATABASE order_service;
CREATE USER order_admin WITH PASSWORD 'dvf';
GRANT ALL PRIVILEGES ON DATABASE order_service TO order_admin;
```

### 3. Service Configuration

#### User Service Configuration
```bash
cd user-service
cp .env.example .env
```

Edit `user-service/.env`:
```env
APP_NAME="User Service"
APP_ENV=local
APP_KEY=base64:/I9t+llqR+rvcrf=
APP_DEBUG=true
APP_URL=http://localhost:8001

DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=user_service
DB_USERNAME=user_admin
DB_PASSWORD=rgvfcr

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

PASSPORT_PERSONAL_ACCESS_CLIENT_ID=1
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET=your_secret_here
```

#### Product Service Configuration
```bash
cd ../product-service
cp .env.example .env
```

Edit `product-service/.env`:
```env
APP_NAME="Product Service"
APP_ENV=local
APP_KEY=base64:generate_new_key_here
APP_DEBUG=true
APP_URL=http://localhost:8002

DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5433
DB_DATABASE=product_service
DB_USERNAME=product_admin
DB_PASSWORD=fvfd

USER_SERVICE_URL=http://localhost:8001
ORDER_SERVICE_URL=http://localhost:8003
```

#### Order Service Configuration
```bash
cd ../order-service
cp .env.example .env
```

Edit `order-service/.env`:
```env
APP_NAME="Order Service"
APP_ENV=local
APP_KEY=base64:generate_new_key_here
APP_DEBUG=true
APP_URL=http://localhost:8003

DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5434
DB_DATABASE=order_service
DB_USERNAME=order_admin
DB_PASSWORD=dvf

USER_SERVICE_URL=http://localhost:8001
PRODUCT_SERVICE_URL=http://localhost:8002
```

### 4. Install Dependencies & Setup

Run this script to setup all services at once:

```bash
#!/bin/bash
# setup.sh - One command setup for all microservices

echo "🚀 Setting up ShopSphere Microservices..."

# User Service Setup
echo "📝 Setting up User Service..."
cd user-service
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan passport:install --force
cd ..

# Product Service Setup
echo "📦 Setting up Product Service..."
cd product-service
composer install
php artisan key:generate
php artisan migrate:fresh --seed
cd ..

# Order Service Setup
echo "📋 Setting up Order Service..."
cd order-service
composer install
php artisan key:generate
php artisan migrate:fresh --seed
cd ..

echo "✅ All services setup complete!"
echo "📍 Use 'npm run dev' to start all services"
```

Make it executable and run:
```bash
chmod +x setup.sh
./setup.sh
```

### 5. Start All Services

Create a `package.json` in the root directory for easy service management:

```json
{
  "name": "shopsphere-microservices",
  "scripts": {
    "dev": "concurrently \"php user-service/artisan serve --port=8001\" \"php product-service/artisan serve --port=8002\" \"php order-service/artisan serve --port=8003\"",
    "user": "php user-service/artisan serve --port=8001",
    "product": "php product-service/artisan serve --port=8002", 
    "order": "php order-service/artisan serve --port=8003"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

Install concurrently and start all services:
```bash
npm install
npm run dev
```

## 📚 API Documentation

### Service Endpoints

| Service | Base URL | Port |
|---------|----------|------|
| User Service | http://localhost:8001 | 8001 |
| Product Service | http://localhost:8002 | 8002 |
| Order Service | http://localhost:8003 | 8003 |

### Key API Endpoints

#### Authentication (User Service - Port 8001)
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get user profile
- `POST /api/refresh` - Refresh token

#### Products (Product Service - Port 8002)
- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/{id}` - Get product details
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

#### Orders (Order Service - Port 8003)
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{id}` - Get order details
- `PATCH /api/v1/orders/{id}/status` - Update order status

## 🧪 Testing with Postman

Import the provided Postman collection (`laravel_postman_collection.json`) to test all endpoints:

1. Open Postman
2. Import the collection file
3. Set environment variables:
    - `base_url`: http://localhost
    - `user_service_port`: 8001
    - `product_service_port`: 8002
    - `order_service_port`: 8003

## 🔧 Database Migrations & Seeders

Each service manages its own database migrations and seeders:

```bash
# User Service
cd user-service
php artisan migrate:fresh --seed

# Product Service  
cd product-service
php artisan migrate:fresh --seed

# Order Service
cd order-service
php artisan migrate:fresh --seed
```

## 🛡️ Authentication

The platform uses **Laravel Passport** for API authentication:

- User Service handles authentication and issues access tokens
- Other services validate tokens via User Service internal endpoints
- Inter-service communication uses service tokens for security

### Setup Passport (if not done automatically)

```bash
cd user-service
php artisan passport:install
php artisan passport:client --personal
```

## 🐳 Docker Usage

The repository includes `docker-compose.yml` for easy containerized deployment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services  
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Docker Commands for Development

```bash
# Access service containers
docker-compose exec user-service bash
docker-compose exec product-service bash
docker-compose exec order-service bash

# Run artisan commands
docker-compose exec user-service php artisan migrate
docker-compose exec product-service php artisan cache:clear
docker-compose exec order-service php artisan queue:work
```

## 📝 Project Structure

```
shopsphere/
├── user-service/          # User management & authentication
├── product-service/       # Product catalog & inventory
├── order-service/         # Order processing
├── docker-compose.yml     # Docker configuration
├── laravel_postman_collection.json
├── setup.sh
├── package.json
└── README.md
```

## 🔍 Health Checks

Each service provides health check endpoints:
- User Service: `GET http://localhost:8001/api/health`
- Product Service: `GET http://localhost:8002/api/health`
- Order Service: `GET http://localhost:8003/api/health`

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 8001-8003 are available
2. **Database connections**: Verify PostgreSQL is running (for local setup)
3. **Passport keys**: Run `php artisan passport:install` if authentication fails
4. **Docker issues**: Run `docker-compose down && docker-compose up -d --build`
5. **Permissions**: Ensure storage and cache directories are writable

### Debug Commands

```bash
# Check service status
curl http://localhost:8001/api/health
curl http://localhost:8002/api/health  
curl http://localhost:8003/api/health

# View logs
tail -f user-service/storage/logs/laravel.log
tail -f product-service/storage/logs/laravel.log
tail -f order-service/storage/logs/laravel.log
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## 👨‍💻 Author

Created by [Harish Porwal](https://github.com/Harishporwal18)

---

**Happy Coding! 🚀**
