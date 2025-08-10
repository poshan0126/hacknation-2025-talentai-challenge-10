#!/bin/bash

echo "🚀 TalentAI Debugging Challenge - Docker Setup with Ngrok"
echo "========================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration:"
    echo "   - Add your NGROK_AUTHTOKEN"
    echo "   - Add API keys if you want to use Claude/OpenAI"
    echo ""
    echo "Get your ngrok auth token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

# Create data directory for SQLite
mkdir -p data

# Pull Ollama models
echo ""
echo "📦 Setting up Ollama models..."
docker-compose run --rm ollama ollama pull llama3.2
docker-compose run --rm ollama ollama pull nomic-embed-text

# Start services
echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Initialize database
echo ""
echo "🗄️ Initializing database..."
docker-compose exec candidate-backend python -m debugging_challenge.init_db

# Get ngrok URL
echo ""
echo "🌐 Getting ngrok URL..."
sleep 5
NGROK_URL=$(curl -s localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo "⚠️  Could not get ngrok URL automatically."
    echo "   Check ngrok dashboard at: http://localhost:4040"
else
    echo "✅ Your API is accessible at: $NGROK_URL"
fi

echo ""
echo "========================================================="
echo "✅ Setup Complete!"
echo ""
echo "📍 Access Points:"
echo "   - Local API: http://localhost:8001"
echo "   - Ngrok URL: ${NGROK_URL:-Check http://localhost:4040}"
echo "   - Ngrok Dashboard: http://localhost:4040"
echo "   - API Docs: ${NGROK_URL:-http://localhost:8001}/docs"
echo ""
echo "📝 Useful Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Reset database: docker-compose exec candidate-backend python -m debugging_challenge.init_db"
echo ""
echo "Share the ngrok URL with your friends to let them access the API!"
echo "========================================================="