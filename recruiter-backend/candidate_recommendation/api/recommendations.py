from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from ..database.connection import get_db
from ..database.models import JobDB, RecommendationHistoryDB
from ..models.recommendation import (
    JobDescription, RecommendationRequest, RecommendationResponse,
    AdvancedRecommendationRequest, CandidateMatch
)
from ..services.api_matcher_service import APICandidateMatcherService

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])
logger = logging.getLogger(__name__)

# Initialize the API-based matcher service
matcher_service = APICandidateMatcherService()

@router.post("/search", response_model=RecommendationResponse)
async def search_candidates(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Search for candidates matching a job description.
    Fetches candidates from candidate backend API and uses semantic matching.
    """
    try:
        response = await matcher_service.find_candidates(request, db)
        return response
    except Exception as e:
        logger.error(f"Error in candidate search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/search/advanced", response_model=RecommendationResponse) 
async def advanced_search_candidates(
    request: AdvancedRecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Advanced candidate search with filters, skill boosts, and penalties.
    Fetches candidates from API and supports experience range, required skills filtering.
    """
    try:
        response = await matcher_service.find_candidates_advanced(request, db)
        return response
    except Exception as e:
        logger.error(f"Error in advanced candidate search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Advanced search failed: {str(e)}")

@router.get("/jobs/{job_id}", response_model=JobDescription)
async def get_job(job_id: str, db: Session = Depends(get_db)):
    """Get job details by ID."""
    job = db.query(JobDB).filter(JobDB.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobDescription(
        id=job.id,
        title=job.title,
        company=job.company,
        description=job.description,
        requirements=job.requirements or [],
        preferred_skills=job.preferred_skills or [],
        location=job.location,
        salary_range=job.salary_range,
        priority=job.priority,
        status=job.status
    )

@router.get("/jobs/{job_id}/history")
async def get_search_history(
    job_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get search history for a job."""
    history = (
        db.query(RecommendationHistoryDB)
        .filter(RecommendationHistoryDB.job_id == job_id)
        .order_by(RecommendationHistoryDB.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {
        "job_id": job_id,
        "searches": [
            {
                "id": h.id,
                "search_query": h.search_query,
                "total_candidates": h.total_candidates,
                "created_at": h.created_at,
                "results_count": len(h.results) if h.results else 0
            }
            for h in history
        ]
    }

@router.get("/jobs", response_model=List[JobDescription])
async def list_jobs(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List all jobs with optional status filtering."""
    query = db.query(JobDB).order_by(JobDB.created_at.desc())
    
    if status:
        query = query.filter(JobDB.status == status)
    
    jobs = query.offset(skip).limit(limit).all()
    
    return [
        JobDescription(
            id=job.id,
            title=job.title,
            company=job.company,
            description=job.description,
            requirements=job.requirements or [],
            preferred_skills=job.preferred_skills or [],
            location=job.location,
            salary_range=job.salary_range,
            priority=job.priority,
            status=job.status
        )
        for job in jobs
    ]

@router.post("/jobs", response_model=JobDescription)
async def create_job(job: JobDescription, db: Session = Depends(get_db)):
    """Create a new job posting."""
    try:
        job_db = JobDB(
            id=job.id,
            title=job.title,
            company=job.company,
            description=job.description,
            requirements=job.requirements,
            preferred_skills=job.preferred_skills,
            location=job.location,
            salary_range=job.salary_range,
            priority=job.priority.value,
            status=job.status.value
        )
        
        db.add(job_db)
        db.commit()
        db.refresh(job_db)
        
        return job
    except Exception as e:
        logger.error(f"Error creating job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "candidate_recommendation",
        "matcher_model": matcher_service.model_name,
        "data_source": "candidate_backend_api",
        "api_client": "active"
    }

@router.post("/test/sample-job")
async def create_sample_job(db: Session = Depends(get_db)):
    """Create a sample job for testing purposes."""
    sample_job = JobDescription(
        title="Senior Python Developer",
        company="TechCorp Inc",
        description="We are looking for an experienced Python developer to join our team...",
        requirements=[
            "5+ years Python experience",
            "FastAPI or Django experience", 
            "SQL database knowledge",
            "Git version control"
        ],
        preferred_skills=[
            "React.js",
            "Docker",
            "AWS",
            "Machine Learning"
        ],
        location="San Francisco, CA"
    )
    
    return await create_job(sample_job, db)