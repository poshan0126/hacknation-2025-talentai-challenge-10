# Job-Candidate Matching System Guide

## Overview

Yes! The system **can absolutely send a job description and match it with candidates**. This is the core functionality of the Candidate Recommendation System.

## How It Works

### 1. **Job Description Input**
You provide a job description with:
- **Title**: Job title (e.g., "Senior Data Engineer")
- **Company**: Company name
- **Description**: Detailed job description
- **Requirements**: List of required skills/qualifications
- **Preferred Skills**: Optional preferred skills

### 2. **Candidate Matching Process**
The system uses **semantic matching** to find the best candidates:

1. **Text Embedding**: Converts job description and candidate resumes to vector representations
2. **Semantic Similarity**: Calculates cosine similarity between job and candidate vectors
3. **Skills Matching**: Uses Jaccard similarity for skills overlap
4. **Title Alignment**: Considers job title relevance
5. **Blended Scoring**: Combines all factors for final ranking

### 3. **Output Results**
Returns ranked list of candidates with:
- **Match Score**: Overall compatibility (0.0 to 1.0)
- **Candidate Details**: Name, current title, skills
- **Skills Match**: Specific skills that align with the job
- **Summary**: Candidate background summary

## Usage Examples

### Option 1: Python Script
```python
from models import JobDescription
from semantic_matcher import SemanticMatcher

# Create job description
job = JobDescription(
    title="Python Developer",
    company="TechCorp",
    description="Build web applications using Python",
    requirements=["Python", "Web frameworks", "Database"],
    preferred_skills=["Django", "FastAPI"]
)

# Initialize matcher
matcher = SemanticMatcher()

# Find matches
matches = matcher.match_candidates(job, "path/to/resumes", top_n=5)

# View results
for match in matches:
    print(f"{match.name}: {match.match_score:.3f}")
```

### Option 2: REST API
```bash
# Start the API server
python start_api.py

# Send POST request
curl -X POST http://localhost:5000/match \
  -H "Content-Type: application/json" \
  -d '{
    "job": {
      "title": "Data Scientist",
      "company": "DataCorp",
      "description": "Build ML models and analyze data",
      "requirements": ["Python", "Machine Learning", "Statistics"],
      "preferred_skills": ["TensorFlow", "SQL"]
    },
    "resumes_dir": "../resume_generator_parser/example_output/parsed",
    "top_n": 10
  }'
```

### Option 3: Integration Service
```python
from integration_example import CandidateRecommendationService

service = CandidateRecommendationService()
matches = service.find_candidates(job_data, resumes_path, top_n=10)
```

## Available Models

The system supports multiple sentence transformer models:
- `sentence-transformers/all-mpnet-base-v2` (default, best quality)
- `sentence-transformers/all-MiniLM-L6-v2` (faster, smaller)
- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (multilingual)

## Scoring Algorithm

The final match score combines:
- **Semantic Similarity** (75%): Text embedding similarity
- **Skills Overlap** (20%): Jaccard similarity of skills
- **Title Alignment** (5%): Job title relevance

## Sample Job Descriptions

### Data Engineer
```json
{
  "title": "Senior Data Engineer",
  "company": "TechCorp Inc.",
  "description": "Design and build scalable data pipelines",
  "requirements": [
    "5+ years data engineering experience",
    "Python programming skills",
    "SQL and NoSQL databases",
    "Big data technologies (Spark, Hadoop)",
    "Cloud platforms (AWS, Azure, GCP)"
  ],
  "preferred_skills": [
    "Machine Learning",
    "Docker and Kubernetes",
    "Real-time streaming (Kafka)"
  ]
}
```

### Software Engineer
```json
{
  "title": "Full Stack Developer",
  "company": "StartupXYZ",
  "description": "Build modern web applications",
  "requirements": [
    "3+ years software development",
    "JavaScript/TypeScript",
    "React or Vue.js",
    "Node.js or Python backend",
    "Database experience"
  ],
  "preferred_skills": [
    "AWS/Azure",
    "Docker",
    "CI/CD pipelines"
  ]
}
```

## Testing the System

### Quick Test
```bash
cd candidate_recommendation
python main.py --resumes-dir ../resume_generator_parser/example_output/parsed
```

### Comprehensive Test
```bash
python example_usage.py
```

### API Test
```bash
python start_api.py
# Then send requests to http://localhost:5000/match
```

## File Structure

```
candidate_recommendation/
├── models.py              # Data models (JobDescription, CandidateMatch)
├── semantic_matcher.py    # Core matching algorithm
├── start_api.py          # REST API server
├── integration_example.py # Integration service
├── example_usage.py      # Comprehensive examples
├── example_usage.py      # Comprehensive examples
└── integration_example.py # Integration service
```

## Requirements

```bash
pip install -r requirements.txt
```

Core dependencies:
- `sentence-transformers` - For semantic embeddings
- `torch` - PyTorch backend
- `numpy` - Numerical operations
- `scikit-learn` - Additional ML utilities

## Key Features

✅ **Semantic Understanding**: Goes beyond keyword matching  
✅ **Skills Analysis**: Identifies relevant skill overlaps  
✅ **Flexible Input**: Accepts various job description formats  
✅ **REST API**: HTTP interface for easy integration  
✅ **Multiple Models**: Choose quality vs. speed trade-offs  
✅ **Comprehensive Scoring**: Multi-factor ranking algorithm  
✅ **Easy Integration**: Simple Python API and service classes  

## Conclusion

The system is **fully functional** and ready to match job descriptions with candidates. It provides:

1. **High-quality semantic matching** using state-of-the-art language models
2. **Multiple integration options** (Python API, REST API, service classes)
3. **Comprehensive scoring** that considers multiple factors
4. **Easy-to-use interface** with clear examples and documentation

You can start using it immediately with the provided examples and test scripts!
