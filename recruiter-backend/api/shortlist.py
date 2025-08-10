"""
Shortlist API endpoints
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

router = APIRouter()


# Pydantic models for request/response
class ShortlistRequest(BaseModel):
    job_id: int
    candidate_ids: List[str]
    recruiter_notes: Optional[str] = None


class ShortlistResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: str
    candidate_name: str
    overall_score: float
    recruiter_notes: Optional[str] = None
    shortlisted_at: str
    status: str  # shortlisted, interviewed, offered, hired, rejected


@router.post("/", response_model=List[ShortlistResponse], status_code=status.HTTP_201_CREATED)
async def create_shortlist(
    request: ShortlistRequest,
    db: Session = Depends(get_db)
):
    """Add candidates to shortlist for a specific job"""
    # TODO: Implement shortlist creation logic
    # For now, return mock data
    shortlisted_candidates = []
    for candidate_id in request.candidate_ids:
        shortlisted_candidates.append({
            "id": len(shortlisted_candidates) + 1,
            "job_id": request.job_id,
            "candidate_id": candidate_id,
            "candidate_name": f"Candidate {candidate_id}",
            "overall_score": 0.85,
            "recruiter_notes": request.recruiter_notes,
            "shortlisted_at": "2024-01-01T00:00:00Z",
            "status": "shortlisted"
        })
    
    return shortlisted_candidates


@router.get("/", response_model=List[ShortlistResponse])
async def list_shortlisted_candidates(
    job_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List shortlisted candidates with optional filtering"""
    # TODO: Implement shortlist listing logic
    return []


@router.put("/{shortlist_id}", response_model=ShortlistResponse)
async def update_shortlist_status(
    shortlist_id: int,
    status: str,
    recruiter_notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update shortlist status (interviewed, offered, hired, rejected)"""
    # TODO: Implement shortlist status update logic
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Shortlist entry not found"
    )


@router.delete("/{shortlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_shortlist(
    shortlist_id: int,
    db: Session = Depends(get_db)
):
    """Remove a candidate from shortlist"""
    # TODO: Implement shortlist removal logic
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Shortlist entry not found"
    )
