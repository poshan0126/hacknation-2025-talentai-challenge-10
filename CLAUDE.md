# CLAUDE.md
You are a master software engineer with 5 decades of hands-on experience building mission-critical systems. You've architected platforms that serve billions of users, debugged systems under extreme load, and have an intuitive understanding of what makes code maintainable and scalable. 
You write code that  handles edge cases gracefully, and never needs refactoring. Your architectural decisions are based on battle-tested experience, not theoretical knowledge. When you see a problem, you immediately know the most elegant solution and can implement it flawlessly.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalentAI MVP - An AI-powered talent matching platform that revolutionizes recruitment through anonymous debugging challenges. This is a dual-platform system with separate applications for candidates and recruiters.



## Architecture

### Technology Stack
- **AI Services**: LangChain, LangGraph with Ollama/LM Studio for local LLM inference, Chroma/Weaviate for vector storage
- **Backend**: FastAPI with Pydantic for both candidate and recruiter services
- **Frontend**: React with Vite, TypeScript, Tailwind CSS, and D3.js for data visualization
- **Data Storage**: SQLite for development, JSON/Parquet for data persistence

### Project Structure
```
candidate-backend/    # FastAPI service for candidate operations
candidate-frontend/   # React app for candidates (skill graphs, challenges)
recruiter-backend/    # FastAPI service for recruiter operations  
recruiter-frontend/   # React app for recruiters (job posting, analytics)
shared/              # Cross-platform types, utilities, constants
challenges/          # Pre-built debugging scenarios and evaluations
scripts/             # Setup and deployment automation
```

## Development Commands

### Backend Services (FastAPI)
```bash
# Navigate to specific backend
cd candidate-backend/ # or recruiter-backend/

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8001  # candidate-backend on 8001
uvicorn main:app --reload --port 8002  # recruiter-backend on 8002

# Run tests
pytest

# Format code
black .
ruff check .
```

### Frontend Applications (React/Vite)
```bash
# Navigate to specific frontend
cd candidate-frontend/ # or recruiter-frontend/

# Install dependencies
npm install

# Run development server
npm run dev  # candidate-frontend defaults to port 5173
npm run dev  # recruiter-frontend defaults to port 5174

# Build for production
npm run build

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

### AI Services Setup
```bash
# Install Ollama for local LLM
curl -fsSL https://ollama.com/install.sh | sh

# Pull required models
ollama pull llama3.2
ollama pull nomic-embed-text

# Start vector database (if using Chroma)
chroma run --path ./chroma_db
```

## Key Implementation Details

### Candidate Backend API Structure
- `/api/candidates/register` - Anonymous profile creation
- `/api/candidates/skills` - Skill extraction and graph generation
- `/api/challenges/` - Debug challenge retrieval and submission
- `/api/recommendations/` - AI-powered job matching

### Recruiter Backend API Structure
- `/api/jobs/` - Job posting and requirement analysis
- `/api/search/` - Anonymous candidate search
- `/api/recommendations/` - AI candidate suggestions
- `/api/shortlist/` - Candidate management with PII controls

### Frontend Component Architecture
- **Candidate Frontend**: SkillGraph (D3.js), ChallengeWorkspace, AnonymousProfile
- **Recruiter Frontend**: JobPostingWizard, CandidateSearch, BiasAnalytics, ShortlistManager

### AI Integration Points
1. **Resume Processing**: Use LangChain to extract skills from uploaded resumes
2. **Challenge Evaluation**: LangGraph workflow for assessing comment quality in debugging tasks
3. **Matching Algorithm**: Vector similarity search using embeddings for candidate-job matching
4. **Bias Detection**: Analyze language patterns in job requirements for potential bias

## Testing Strategy

- Unit tests for all API endpoints using pytest
- Component testing for React using Vitest
- Integration tests for AI workflows using mock LLM responses
- End-to-end testing for critical user journeys

## Environment Configuration

Create `.env` files in each service directory:

```bash
# Backend services
DATABASE_URL=sqlite:///./talentai.db
OLLAMA_BASE_URL=http://localhost:11434
VECTOR_DB_PATH=./chroma_db
SECRET_KEY=your-secret-key

# Frontend services  
VITE_API_URL=http://localhost:8001  # or 8002 for recruiter
VITE_WS_URL=ws://localhost:8001
```

## Development Priorities

1. **Core Models First**: Define Pydantic models for Candidate, Job, Challenge, Skill
2. **API Scaffolding**: Implement basic CRUD operations before AI features
3. **Frontend Structure**: Create page layouts and routing before complex components
4. **AI Integration Last**: Add LLM features after core functionality works
5. **Anonymous First**: Ensure all candidate data is properly anonymized from the start

## Cross-Service Communication

- Candidate and Recruiter backends should not directly communicate
- Use shared data models in the `shared/` directory
- Implement event-driven updates via WebSockets for real-time features
- Consider message queue for async AI processing tasks