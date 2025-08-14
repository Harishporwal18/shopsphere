#!/bin/bash

# ShopSphere API Gateway Startup Script

echo "🚀 Starting ShopSphere API Gateway..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration before starting the service."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🔧 Starting API Gateway in development mode..."
echo "📡 Gateway will be available at: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/health"
echo "📊 Service status: http://localhost:3000/health/services"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Start the service
npm run dev 