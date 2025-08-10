# Debugging Challenge Arena - Implementation Guide

## Overview
The Debugging Challenge Arena is a fully functional MVP that allows candidates to practice identifying bugs in code, receive AI-powered feedback, and compete on a global leaderboard.

## Architecture

### Backend (FastAPI)
- **Models**: Pydantic models for challenges, submissions, and leaderboard
- **AI Services**: 
  - Bug Generator: Uses LangChain/Ollama to inject realistic bugs
  - Comment Evaluator: Analyzes candidate comments and scores accuracy
- **API Endpoints**:
  - `/api/challenges` - List and retrieve challenges
  - `/api/submissions` - Submit solutions and get evaluations
  - `/api/submissions/leaderboard/global` - Global rankings

### Frontend (React + Vite)
- **Components**:
  - CodeEditor: Monaco editor for annotating buggy code
  - ChallengeList: Browse available challenges
  - LeaderboardTable: Real-time rankings
  - ResultsModal: Detailed feedback on submissions

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- Ollama (for AI evaluation)

### 1. Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull required model
ollama pull llama3.2
```

### 2. Backend Setup
```bash
cd candidate-backend/debugging-challenge
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Initialize database with sample challenges
python seed_database.py

# Start server
uvicorn main:app --reload --port 8001

# OR use the startup script:
./start_backend.sh
```

### 3. Frontend Setup
```bash
cd candidate-frontend/debugging-challenge
npm install
npm run dev

# OR from backend directory:
cd candidate-backend/debugging-challenge
./start_frontend.sh
```

### 4. Access Application
- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8001/docs

## How It Works

### Challenge Flow
1. **Select Challenge**: Browse available debugging challenges
2. **Annotate Code**: Add comments with "BUG:" prefix to identify issues
3. **Submit Solution**: AI evaluates your bug identifications
4. **Get Feedback**: Receive score, accuracy metrics, and AI feedback
5. **Climb Leaderboard**: Track your progress against other debuggers

### Scoring System
- **Bugs Found**: Points for correctly identified bugs
- **Bugs Missed**: Penalty for unidentified bugs
- **False Positives**: Penalty for incorrect identifications
- **Accuracy Rate**: Overall percentage of correct identifications

## Sample Challenges Included
1. **Array Sum Calculator** (Easy) - Logic and syntax errors
2. **Palindrome Checker** (Medium) - Multiple logic errors
3. **Fibonacci Generator** (Easy) - Type and logic errors

## API Examples

### Get Challenges
```bash
curl http://localhost:8001/api/challenges
```

### Submit Solution
```bash
curl -X POST http://localhost:8001/api/submissions/ \
  -H "Content-Type: application/json" \
  -d '{
    "challenge_id": "challenge-uuid",
    "annotated_code": "def sum(arr):\\n    # BUG: Off-by-one error\\n    for i in range(len(arr)-1):"
  }'
```

### Get Leaderboard
```bash
curl http://localhost:8001/api/submissions/leaderboard/global
```

## Development Tips

### Adding New Challenges
1. Add to `challenges/sample_challenges.json`
2. Run `python seed_database.py`

### Testing AI Evaluation
The evaluator looks for comments in these formats:
- Python: `# BUG: description`
- JavaScript: `// BUG: description`
- Multi-line: `/* BUG: description */`

### Customizing Difficulty
Modify bug injection parameters in `services/ai_generator.py`:
- Easy: 1-2 simple bugs
- Medium: 3-4 mixed bugs
- Hard: 5+ complex bugs

## Troubleshooting

### Ollama Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Database Issues
```bash
# Reset database
rm candidate-backend/talentai.db
python candidate-backend/seed_database.py
```

### Port Conflicts
- Backend: Change port in `start_backend.sh`
- Frontend: Change port in `vite.config.ts`

## Next Steps
- Add more programming languages
- Implement real-time WebSocket updates
- Add AI-generated challenges
- Create difficulty progression system
- Add detailed code explanations
- Implement team challenges