"""
Jobs API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

# Use absolute imports to avoid relative import issues
try:
    from config.database import get_db
except ImportError:
    # Fallback for when running as standalone script
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    from config.database import get_db
from models.job_posting import JobPosting
from models.company import Company

router = APIRouter()


# Pydantic models for request/response
class JobPostingBase(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    preferred_skills: Optional[str] = None
    responsibilities: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    location_type: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    min_experience_years: Optional[int] = None
    education_level: Optional[str] = None


class JobPostingCreate(JobPostingBase):
    company_id: int


class JobPostingUpdate(JobPostingBase):
    pass


class JobPostingResponse(JobPostingBase):
    id: int
    company_id: int
    is_active: bool
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


@router.post("/", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
async def create_job_posting(
    job: JobPostingCreate,
    db: Session = Depends(get_db)
):
    """Create a new job posting"""
    # Verify company exists
    company = db.query(Company).filter(Company.id == job.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Create job posting
    db_job = JobPosting(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    return db_job


@router.get("/", response_model=List[JobPostingResponse])
async def list_job_postings(
    skip: int = 0,
    limit: int = 100,
    company_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List job postings with optional filtering"""
    query = db.query(JobPosting)
    
    if company_id:
        query = query.filter(JobPosting.company_id == company_id)
    
    if is_active is not None:
        query = query.filter(JobPosting.is_active == is_active)
    
    jobs = query.offset(skip).limit(limit).all()
    return jobs


@router.get("/{job_id}", response_model=JobPostingResponse)
async def get_job_posting(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific job posting by ID"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    return job


@router.put("/{job_id}", response_model=JobPostingResponse)
async def update_job_posting(
    job_id: int,
    job_update: JobPostingUpdate,
    db: Session = Depends(get_db)
):
    """Update a job posting"""
    db_job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    
    # Update fields
    for field, value in job_update.dict(exclude_unset=True).items():
        setattr(db_job, field, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_posting(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Delete a job posting"""
    db_job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    
    db.delete(db_job)
    db.commit()
    return None
