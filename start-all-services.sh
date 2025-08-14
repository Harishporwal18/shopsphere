#!/bin/bash

# ShopSphere - Start All Services Script
# This script starts all microservices and the API Gateway in the correct order

set -e

echo "🚀 Starting ShopSphere Microservices Architecture..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_success "Docker is running"

# Check if required ports are available
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use. $service might not start properly."
        return 1
    else
        print_success "Port $port is available for $service"
        return 0
    fi
}

print_status "Checking port availability..."
check_port 5432 "User Database"
check_port 5433 "Product Database"
check_port 5434 "Order Database"
check_port 8001 "User Service"
check_port 8002 "Product Service"
check_port 8003 "Order Service"
check_port 3000 "API Gateway"

# Create network if it doesn't exist
print_status "Creating Docker network..."
docker network create shopsphere-network 2>/dev/null || print_warning "Network already exists"

# Start databases first
print_status "Starting databases..."
docker-compose up -d user-db product-db order-db

# Wait for databases to be ready
print_status "Waiting for databases to be ready..."
sleep 10

# Start microservices
print_status "Starting microservices..."
docker-compose up -d user-service product-service order-service

# Wait for services to be ready
print_status "Waiting for microservices to be ready..."
sleep 15

# Start API Gateway
print_status "Starting API Gateway..."
docker-compose up -d api-gateway

# Wait for API Gateway to be ready
print_status "Waiting for API Gateway to be ready..."
sleep 10

# Health check function
check_service_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Checking $service health..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_success "$service is healthy!"
            return 0
        else
            print_warning "$service not ready yet (attempt $attempt/$max_attempts)"
            sleep 2
            attempt=$((attempt + 1))
        fi
    done
    
    print_error "$service failed to start after $max_attempts attempts"
    return 1
}

# Check all services
print_status "Performing health checks..."
check_service_health "User Service" "http://localhost:8001/health" || exit 1
check_service_health "Product Service" "http://localhost:8002/health" || exit 1
check_service_health "Order Service" "http://localhost:8003/health" || exit 1
check_service_health "API Gateway" "http://localhost:3000/health" || exit 1

# Final status
echo ""
echo "🎉 All services are running successfully!"
echo "=================================================="
echo "📊 Service Status:"
echo "   • User Service:     http://localhost:8001"
echo "   • Product Service:  http://localhost:8002"
echo "   • Order Service:    http://localhost:8003"
echo "   • API Gateway:      http://localhost:3000"
echo ""
echo "🔍 Health Checks:"
echo "   • Gateway Health:   http://localhost:3000/health"
echo "   • All Services:     http://localhost:3000/health/services"
echo ""
echo "📚 API Endpoints:"
echo "   • Users:            http://localhost:3000/api/users"
echo "   • Products:         http://localhost:3000/api/products"
echo "   • Orders:           http://localhost:3000/api/orders"
echo ""
echo "🛑 To stop all services: docker-compose down"
echo "📝 To view logs: docker-compose logs -f [service-name]"
echo ""

# Show running containers
print_status "Running containers:"
docker-compose ps

echo ""
print_success "ShopSphere is ready! 🚀" 