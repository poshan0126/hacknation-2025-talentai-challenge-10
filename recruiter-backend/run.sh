#!/bin/bash

# Recruiter Backend Startup Script

echo "🚀 Starting Recruiter Backend..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

# Check if requirements are installed
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found"
    exit 1
fi

# Install requirements if needed
echo "📦 Installing/updating requirements..."
pip3 install -r requirements.txt

# Check if .env file exists, create from example if not
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration values"
fi

# Start the API server
echo "🌐 Starting FastAPI server on port 8002..."
python3 main.py
