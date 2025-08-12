#!/bin/bash

echo "🚀 Starting TalentAI Backend with Debugging Challenge..."

# Navigate to parent directory
cd ..

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🗄️ Setting up database..."
cd debugging-challenge
python seed_database.py
cd ..

echo "🏃 Starting FastAPI server..."
uvicorn main:app --reload --port 8001