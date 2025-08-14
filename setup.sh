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
