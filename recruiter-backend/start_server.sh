#!/bin/bash

# Start the TalentAI Recruiter Backend
echo "Starting TalentAI Recruiter Backend..."

# Set environment variables
export DATABASE_URL="sqlite:///./recruiter_talentai.db"
export CANDIDATE_BACKEND_URL="http://localhost:8001"
export RESUME_DATA_PATH="/Users/poshan/Documents/hacknation-2025-talentai-challenge-10/candidate-backend/resume_generator_parser/example_output/parsed"

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the FastAPI server
echo "Starting server on port 8002..."
uvicorn main:app --reload --port 8002 --host 0.0.0.0