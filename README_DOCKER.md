# 🐳 Docker Setup for TalentAI Debugging Challenge

This guide will help you run the TalentAI Debugging Challenge backend using Docker and share it with friends via ngrok.

## Prerequisites

1. **Docker & Docker Compose**: Install from [docker.com](https://www.docker.com/get-started)
2. **Ngrok Account**: Sign up at [ngrok.com](https://ngrok.com) (free tier is sufficient)

## Quick Start

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd hacknation-2025-talentai-challenge-10

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file and add:

```env
# Required for ngrok
NGROK_AUTHTOKEN=your_ngrok_auth_token_here

# Optional: Add if you want to use Claude/OpenAI instead of Ollama
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

Get your ngrok auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Start Everything with One Command

```bash
./start-with-ngrok.sh
```

This script will:
- Create necessary directories
- Start Docker containers
- Pull required Ollama models
- Initialize the database
- Set up ngrok tunnel
- Display your public URL

## Manual Setup (Alternative)

If you prefer manual control:

```bash
# Create data directory
mkdir -p data

# Start services
docker-compose up -d

# Pull Ollama models (first time only)
docker-compose exec ollama ollama pull llama3.2
docker-compose exec ollama ollama pull nomic-embed-text

# Initialize database
docker-compose exec candidate-backend python -m debugging_challenge.init_db

# Check ngrok URL
open http://localhost:4040
```

## Accessing the API

### Local Access
- API: http://localhost:8001
- Documentation: http://localhost:8001/docs
- Ngrok Dashboard: http://localhost:4040

### Remote Access (Share with Friends)
- Your ngrok URL will be displayed after running the startup script
- Share this URL with friends: `https://your-domain.ngrok-free.app`
- They can access API docs at: `https://your-domain.ngrok-free.app/docs`

## API Endpoints

### Core Endpoints

```bash
# Get all challenges
curl https://your-domain.ngrok-free.app/api/challenges

# Get specific challenge
curl https://your-domain.ngrok-free.app/api/challenges/{challenge_id}

# Submit solution
curl -X POST https://your-domain.ngrok-free.app/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "challenge_id": "...",
    "candidate_id": "anon_123",
    "analysis": "Line 3: Off-by-one error..."
  }'
```

## Docker Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f candidate-backend
```

### Database Management

```bash
# Initialize/Reset database
docker-compose exec candidate-backend python -m debugging_challenge.init_db

# Access database shell (SQLite)
docker-compose exec candidate-backend sqlite3 /app/data/talentai.db

# Backup database
docker cp talentai-candidate-backend:/app/data/talentai.db ./backup.db
```

### Ollama Model Management

```bash
# List installed models
docker-compose exec ollama ollama list

# Pull a new model
docker-compose exec ollama ollama pull codellama

# Remove a model
docker-compose exec ollama ollama rm model_name
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8001
lsof -i :8001

# Change port in docker-compose.yml
# Edit the ports section: "8002:8001"
```

### Ngrok Not Working

1. Check auth token in `.env`
2. Check ngrok dashboard: http://localhost:4040
3. Restart ngrok service:
   ```bash
   docker-compose restart ngrok
   ```

### Database Issues

```bash
# Reset database
docker-compose exec candidate-backend python -m debugging_challenge.init_db

# Check database file
ls -la data/talentai.db
```

### Ollama Issues

```bash
# Check Ollama status
docker-compose logs ollama

# Restart Ollama
docker-compose restart ollama

# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello"
}'
```

## Security Notes

⚠️ **Important for Production**:
1. Change `SECRET_KEY` in `.env`
2. Use proper authentication for production
3. Configure CORS appropriately
4. Use HTTPS in production
5. Don't commit `.env` file to git

## Resource Requirements

- **Minimum**: 4GB RAM, 10GB disk space
- **Recommended**: 8GB RAM, 20GB disk space
- **GPU**: Optional, improves Ollama performance

## Stopping Everything

```bash
# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v

# Remove all data
rm -rf data/
```

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Ensure all prerequisites are installed
3. Verify `.env` configuration
4. Check system resources

Happy debugging! 🚀