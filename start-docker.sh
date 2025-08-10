#!/bin/bash

echo "🚀 TalentAI Debugging Challenge - Docker Setup"
echo "====================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with:"
    echo "   - GROQ_API_KEY (get from https://console.groq.com)"
    echo "   - NGROK_AUTHTOKEN (optional, for sharing)"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

# Create data directory for SQLite
mkdir -p data

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down

# Start services
echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d --build

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check if backend is running
if docker-compose ps | grep -q "candidate-backend.*Up"; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend failed to start. Check logs with: docker-compose logs candidate-backend"
    exit 1
fi

# Initialize database
echo ""
echo "🗄️ Initializing database..."
docker-compose exec candidate-backend python -m debugging_challenge.init_db

echo ""
echo "====================================================="
echo "✅ Setup Complete!"
echo ""
echo "📍 Access Points:"
echo "   - API: http://localhost:8001"
echo "   - API Docs: http://localhost:8001/docs"
echo ""

# Check if ngrok is configured
if docker-compose ps | grep -q "ngrok.*Up"; then
    echo "   - Ngrok Dashboard: http://localhost:4040"
    echo "   - Check ngrok URL at: http://localhost:4040/status"
fi

echo ""
echo "📝 Useful Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Reset database: docker-compose exec candidate-backend python -m debugging_challenge.init_db"
echo "====================================================="