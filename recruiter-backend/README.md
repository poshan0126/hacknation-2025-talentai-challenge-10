# TalentAI Recruiter Backend

AI-powered candidate recommendation API for recruiters. This service provides semantic matching between job descriptions and candidate profiles using machine learning.

## Architecture

```
recruiter-backend/
├── candidate_recommendation/          # Main API module
│   ├── api/
│   │   └── recommendations.py        # FastAPI routes
│   ├── database/
│   │   ├── connection.py            # Database setup
│   │   └── models.py                # SQLAlchemy models
│   ├── models/
│   │   └── recommendation.py        # Pydantic models
│   ├── services/
│   │   └── matcher_service.py       # Business logic
│   └── semantic_matcher.py          # ML matching engine
├── main.py                          # FastAPI application
├── requirements.txt                 # Python dependencies
└── start_server.sh                 # Startup script
```

## Features

### Core Endpoints

- **POST `/api/recommendations/search`** - Basic candidate search (fetches from API)
- **POST `/api/recommendations/search/advanced`** - Advanced search with filters  
- **GET `/api/recommendations/jobs/{job_id}`** - Get job details
- **POST `/api/recommendations/jobs`** - Create new job posting
- **GET `/api/recommendations/jobs`** - List all jobs
- **GET `/api/recommendations/health`** - Health check

### Matching Algorithm

The system uses a **real-time API-based approach** with hybrid matching:

1. **API Data Retrieval** - Fetches live candidate data from candidate backend
2. **Semantic Similarity** - Sentence-BERT embeddings for contextual matching  
3. **Skills Matching** - Jaccard similarity for exact skill overlap
4. **Title Alignment** - Role title compatibility scoring
5. **Advanced Filters** - Experience, location, required skills filtering

### Data Sources

- **Primary**: Live candidate profiles from candidate backend API (`/debug/api/users/*`)
- **Enhanced**: Challenge statistics and performance metrics
- **Inferred**: Skills and experience levels from debugging challenge activity

### Key Models

- **JobDescription** - Job posting with requirements and preferences
- **CandidateMatch** - Matched candidate with score and matching skills
- **RecommendationRequest** - Search parameters
- **AdvancedRecommendationRequest** - Search with filters and skill boosts

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export DATABASE_URL="sqlite:///./recruiter_talentai.db"
export CANDIDATE_BACKEND_URL="http://localhost:8001"  # Candidate backend API
export RESUME_DATA_PATH="/path/to/parsed/resume/data"  # Fallback only
```

### 3. Start Server

```bash
# Using the startup script
./start_server.sh

# Or directly with uvicorn
uvicorn main:app --reload --port 8002
```

## Usage Examples

### Basic Candidate Search

```python
import requests

# Create job description
job_data = {
    "title": "Senior Python Developer",
    "company": "TechCorp",
    "description": "Looking for experienced Python developer...",
    "requirements": ["5+ years Python", "FastAPI", "SQL"],
    "preferred_skills": ["React", "Docker", "AWS"]
}

# Search for candidates
search_request = {
    "job": job_data,
    "top_n": 10,
    "include_summary": True
}

response = requests.post(
    "http://localhost:8002/api/recommendations/search",
    json=search_request
)

results = response.json()
print(f"Found {len(results['candidates'])} candidates")
```

### Advanced Search with Filters

```python
advanced_request = {
    "job": job_data,
    "filters": {
        "min_experience": 3,
        "max_experience": 10,
        "required_skills": ["Python", "FastAPI"],
        "location": "San Francisco"
    },
    "boost_skills": ["Machine Learning", "AWS"],
    "penalty_skills": ["PHP"],
    "top_n": 5
}

response = requests.post(
    "http://localhost:8002/api/recommendations/search/advanced", 
    json=advanced_request
)
```

## Testing

### Basic API Test
```bash
python test_api.py
```

### Full Integration Test
```bash
python test_integration.py
```

The integration test will:
1. ✅ Check candidate backend connectivity  
2. ✅ Verify recruiter backend health
3. ✅ Test real-time candidate data fetching
4. ✅ Validate semantic matching with API data
5. ✅ Test both basic and advanced search features

**Prerequisites**: Both candidate backend (port 8001) and recruiter backend (port 8002) must be running.

## Data Sources

### Primary: Candidate Backend API
The system now fetches **real-time candidate data** directly from the candidate backend:

- **User Profiles**: `/debug/api/users/all` and `/debug/api/users/{id}/profile`
- **Challenge Statistics**: Performance metrics from debugging challenges
- **Skill Inference**: Automatically infers skills from challenge activity
- **Dynamic Summaries**: Generates professional summaries from user data

### Data Structure
API-fetched candidate profiles include:
- `user_id` - Unique candidate identifier
- `display_name` - Candidate name (anonymizable)
- `title` - Inferred from challenge performance
- `skills` - Extracted/inferred technical and soft skills
- `summary` - AI-generated professional summary
- `statistics` - Challenge completion metrics and scores

## Configuration

### Matching Parameters

- `blend_alpha` (0.25) - Weight for skills vs semantic similarity
- `title_weight` (0.10) - Bonus for title alignment
- `sbert_model` - Sentence transformer model name

### Database

Uses SQLite by default, configurable via `DATABASE_URL`:
- Jobs storage
- Search history logging
- Candidate caching (future)

## Integration

This API integrates with:
- **Candidate Backend** - Resume parsing and skill extraction
- **Recruiter Frontend** - Job posting and candidate browsing UI
- **Vector Databases** - For large-scale semantic search (future)

## Performance

- Handles 100+ resumes efficiently
- Sub-second search response times
- Scalable to thousands of candidates with proper indexing