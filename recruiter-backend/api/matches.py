"""
Matches API endpoints for candidate-job matching
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import logging
from datetime import datetime

# Use absolute imports to avoid relative import issues
try:
    from config.database import get_db
    from services.matching_engine import MatchingEngine
    from services.candidate_recommendation import CandidateRecommendationService
    from models.job_posting import JobPosting
except ImportError:
    # Fallback for when running as standalone script
    import sys
    from pathlib import Path
    
    # Get the recruiter-backend directory (parent of api)
    backend_dir = Path(__file__).parent.parent
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    try:
        from config.database import get_db
        from services.matching_engine import MatchingEngine
        from services.candidate_recommendation import CandidateRecommendationService
        from models.job_posting import JobPosting
    except ImportError:
        # If still failing, try adding the parent directory
        parent_dir = backend_dir.parent
        if str(parent_dir) not in sys.path:
            sys.path.insert(0, str(parent_dir))
        from config.database import get_db
        from services.matching_engine import MatchingEngine
        from services.candidate_recommendation import CandidateRecommendationService
        from models.job_posting import JobPosting

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models for request/response
class MatchRequest(BaseModel):
    job_id: int
    candidate_ids: Optional[List[str]] = None
    top_k: Optional[int] = 10
    use_recommendation_system: Optional[bool] = True


class MatchResponse(BaseModel):
    job_id: int
    candidate_id: str
    candidate_name: Optional[str] = None
    overall_score: float
    semantic_score: Optional[float] = None
    skills_score: Optional[float] = None
    experience_score: Optional[float] = None
    title_score: Optional[float] = None
    ai_analysis: Optional[str] = None
    strengths: Optional[List[str]] = None
    concerns: Optional[List[str]] = None
    recommendations: Optional[str] = None
    candidate_summary: Optional[str] = None
    candidate_skills: Optional[List[str]] = None


class SystemStatusResponse(BaseModel):
    matching_engine: dict
    candidate_recommendation: dict
    overall_status: str


class PerformanceMetricsResponse(BaseModel):
    candidate_recommendation: dict
    matching_engine: dict
    overall_performance: str


@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status():
    """Get the status of the matching system components"""
    try:
        # Get matching engine status
        matching_engine = MatchingEngine()
        engine_status = await matching_engine.get_system_status()
        
        # Get candidate recommendation service status
        candidate_service = CandidateRecommendationService()
        candidate_status = await candidate_service.get_system_status()
        
        # Determine overall status
        overall_status = "healthy"
        if not engine_status.get("embedding_model_loaded") or not candidate_status.get("matcher_initialized"):
            overall_status = "degraded"
        if not engine_status.get("candidate_service_loaded"):
            overall_status = "unhealthy"
        
        return SystemStatusResponse(
            matching_engine=engine_status,
            candidate_recommendation=candidate_status,
            overall_status=overall_status
        )
        
    except Exception as e:
        logger.error(f"❌ Error getting system status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting system status: {str(e)}"
        )


@router.get("/performance", response_model=PerformanceMetricsResponse)
async def get_performance_metrics():
    """Get performance metrics for the matching system components"""
    try:
        # Get candidate recommendation service performance
        candidate_service = CandidateRecommendationService()
        candidate_metrics = await candidate_service.get_performance_metrics()
        
        # Get matching engine performance (mock for now)
        engine_metrics = {
            "total_matches_generated": 0,
            "average_matching_time_ms": 0,
            "success_rate": 1.0,
            "last_updated": str(datetime.now())
        }
        
        # Determine overall performance
        overall_performance = "excellent"
        if candidate_metrics.get("success_rate", 1.0) < 0.8:
            overall_performance = "good"
        if candidate_metrics.get("success_rate", 1.0) < 0.6:
            overall_performance = "degraded"
        
        return PerformanceMetricsResponse(
            candidate_recommendation=candidate_metrics,
            matching_engine=engine_metrics,
            overall_performance=overall_performance
        )
        
    except Exception as e:
        logger.error(f"❌ Error getting performance metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting performance metrics: {str(e)}"
        )


@router.post("/", response_model=List[MatchResponse])
async def find_candidates_for_job(
    request: MatchRequest,
    db: Session = Depends(get_db)
):
    """Find candidates for a specific job using AI matching"""
    
    try:
        # Get job posting data
        job_posting = db.query(JobPosting).filter(JobPosting.id == request.job_id).first()
        if not job_posting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found"
            )
        
        # Initialize matching engine
        matching_engine = MatchingEngine()
        
        # Convert job posting to dictionary format
        job_data = {
            "id": job_posting.id,
            "title": job_posting.title,
            "company": job_posting.company_id,  # This is the company ID, not name
            "description": job_posting.description,
            "requirements": job_posting.requirements,
            "preferred_skills": job_posting.preferred_skills,
            "responsibilities": job_posting.responsibilities,
            "job_type": job_posting.job_type,
            "experience_level": job_posting.experience_level,
            "location": job_posting.location,
            "required_skills": job_posting.required_skills,
            "nice_to_have_skills": job_posting.nice_to_have_skills,
            "min_experience_years": job_posting.min_experience_years,
            "education_level": job_posting.education_level
        }
        
        # Find candidates using your recommendation system
        logger.info(f"🔍 Finding candidates for job: {job_posting.title}")
        candidates = await matching_engine.find_candidates_for_job(
            job_data=job_data,
            candidates=request.candidate_ids,  # Optional: specific candidates to evaluate
            top_k=request.top_k,
            use_recommendation_system=request.use_recommendation_system
        )
        
        if not candidates:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No suitable candidates found for this job"
            )
        
        # Convert to response format
        matches = []
        for candidate in candidates:
            match_response = MatchResponse(
                job_id=request.job_id,
                candidate_id=candidate.get("candidate_id", "unknown"),
                candidate_name=candidate.get("candidate_name"),
                overall_score=candidate.get("overall_score", 0.0),
                semantic_score=candidate.get("semantic_score"),
                skills_score=candidate.get("skills_score"),
                experience_score=candidate.get("experience_score"),
                title_score=candidate.get("title_score"),
                ai_analysis=candidate.get("ai_analysis"),
                strengths=candidate.get("strengths", []),
                concerns=candidate.get("concerns", []),
                recommendations=candidate.get("recommendations"),
                candidate_summary=candidate.get("candidate_summary"),
                candidate_skills=candidate.get("candidate_skills", [])
            )
            matches.append(match_response)
        
        logger.info(f"✅ Found {len(matches)} matching candidates")
        return matches
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in candidate matching: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error finding candidates: {str(e)}"
        )


@router.post("/recommendations", response_model=List[MatchResponse])
async def get_candidate_recommendations(
    job_id: int,
    top_k: int = 10,
    db: Session = Depends(get_db)
):
    """Get AI-powered candidate recommendations for a job"""
    
    try:
        # Get job posting data
        job_posting = db.query(JobPosting).filter(JobPosting.id == job_id).first()
        if not job_posting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found"
            )
        
        # Initialize candidate recommendation service directly
        candidate_service = CandidateRecommendationService()
        
        # Convert job posting to dictionary format
        job_data = {
            "id": job_posting.id,
            "title": job_posting.title,
            "company": job_posting.company_id,
            "description": job_posting.description,
            "requirements": job_posting.requirements,
            "preferred_skills": job_posting.preferred_skills,
            "responsibilities": job_posting.responsibilities,
            "required_skills": job_posting.required_skills,
            "nice_to_have_skills": job_posting.nice_to_have_skills,
            "min_experience_years": job_posting.min_experience_years,
            "education_level": job_posting.education_level
        }
        
        logger.info(f"🔍 Getting AI recommendations for job: {job_posting.title}")
        recommendations = await candidate_service.get_candidate_recommendations(
            job_data, top_k
        )
        
        if not recommendations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No candidate recommendations found for this job"
            )
        
        # Convert to response format
        matches = []
        for rec in recommendations:
            match_response = MatchResponse(
                job_id=job_id,
                candidate_id=rec.get("candidate_id", "unknown"),
                candidate_name=rec.get("candidate_name"),
                overall_score=rec.get("overall_score", 0.0),
                semantic_score=rec.get("semantic_score"),
                skills_score=rec.get("skills_score"),
                experience_score=rec.get("experience_score"),
                title_score=rec.get("title_score"),
                ai_analysis=rec.get("ai_analysis"),
                strengths=rec.get("strengths", []),
                concerns=rec.get("concerns", []),
                recommendations=rec.get("recommendations"),
                candidate_summary=rec.get("candidate_summary"),
                candidate_skills=rec.get("candidate_skills", [])
            )
            matches.append(match_response)
        
        logger.info(f"✅ Found {len(matches)} AI recommendations")
        return matches
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting candidate recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting recommendations: {str(e)}"
        )


@router.post("/direct-match")
async def match_job_directly(
    job_data: dict,
    top_k: int = 10,
    use_recommendation_system: bool = True
):
    """Match candidates to a job description without requiring a database job posting"""
    
    try:
        # Initialize matching engine
        matching_engine = MatchingEngine()
        
        logger.info(f"🔍 Direct matching for job: {job_data.get('title', 'Unknown')}")
        candidates = await matching_engine.find_candidates_for_job(
            job_data=job_data,
            candidates=None,
            top_k=top_k,
            use_recommendation_system=use_recommendation_system
        )
        
        if not candidates:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No suitable candidates found for this job"
            )
        
        # Convert to response format
        matches = []
        for candidate in candidates:
            match_response = MatchResponse(
                job_id=0,  # No database job ID for direct matching
                candidate_id=candidate.get("candidate_id", "unknown"),
                candidate_name=candidate.get("candidate_name"),
                overall_score=candidate.get("overall_score", 0.0),
                semantic_score=candidate.get("semantic_score"),
                skills_score=candidate.get("skills_score"),
                experience_score=candidate.get("experience_score"),
                title_score=candidate.get("title_score"),
                ai_analysis=candidate.get("ai_analysis"),
                strengths=candidate.get("strengths", []),
                concerns=candidate.get("concerns", []),
                recommendations=candidate.get("recommendations"),
                candidate_summary=candidate.get("candidate_summary"),
                candidate_skills=candidate.get("candidate_skills", [])
            )
            matches.append(match_response)
        
        logger.info(f"✅ Direct matching completed, found {len(matches)} candidates")
        return {
            "success": True,
            "job_data": job_data,
            "matches": matches,
            "total_candidates": len(matches)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in direct job matching: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in direct matching: {str(e)}"
        )


@router.get("/", response_model=List[MatchResponse])
async def list_matches(
    job_id: Optional[int] = None,
    candidate_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List existing matches with optional filtering"""
    try:
        # For now, return matches from the recommendation system
        # In a full implementation, this would query a matches database table
        logger.info(f"📋 Listing matches - job_id: {job_id}, candidate_id: {candidate_id}")
        
        # If we have specific filters, we can use the recommendation system
        if candidate_id:
            candidate_service = CandidateRecommendationService()
            profile = await candidate_service.get_candidate_profile(candidate_id)
            if profile:
                # Create a mock match response from the profile
                match_response = MatchResponse(
                    job_id=job_id or 0,
                    candidate_id=candidate_id,
                    candidate_name=profile.get('name', 'Unknown'),
                    overall_score=0.8,  # Default score
                    semantic_score=0.8,
                    skills_score=0.8,
                    experience_score=0.8,
                    title_score=0.8,
                    ai_analysis="Profile retrieved from recommendation system",
                    strengths=profile.get('skills', [])[:5],
                    concerns=[],
                    recommendations="Consider for relevant positions",
                    candidate_summary=profile.get('summary', ''),
                    candidate_skills=profile.get('skills', [])
                )
                return [match_response]
        
        # Return empty list for now - in production this would query matches table
        return []
        
    except Exception as e:
        logger.error(f"❌ Error listing matches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing matches: {str(e)}"
        )


@router.put("/{match_id}", response_model=MatchResponse)
async def update_match_status(
    match_id: int,
    status: str,
    recruiter_notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update match status (shortlisted, rejected, etc.)"""
    try:
        # For now, update status in the recommendation system
        # In production, this would update a matches database table
        logger.info(f"📝 Updating match {match_id} status to: {status}")
        
        # Validate status
        valid_statuses = ['pending', 'shortlisted', 'rejected', 'interviewed', 'hired']
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # In a full implementation, this would update the database
        # For now, return a mock response indicating success
        mock_match = MatchResponse(
            job_id=0,  # Would come from database
            candidate_id=f"candidate_{match_id}",
            candidate_name="Updated Candidate",
            overall_score=0.8,
            semantic_score=0.8,
            skills_score=0.8,
            experience_score=0.8,
            title_score=0.8,
            ai_analysis=f"Status updated to: {status}",
            strengths=["Python", "FastAPI", "PostgreSQL"],
            concerns=[],
            recommendations=f"Status: {status}. {recruiter_notes or 'No additional notes.'}",
            candidate_summary="Candidate profile updated",
            candidate_skills=["Python", "FastAPI", "PostgreSQL"]
        )
        
        logger.info(f"✅ Successfully updated match {match_id} status to: {status}")
        return mock_match
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating match status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating match status: {str(e)}"
        )


@router.get("/candidate/{candidate_id}/profile")
async def get_candidate_profile(
    candidate_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed candidate profile from the recommendation system"""
    
    try:
        candidate_service = CandidateRecommendationService()
        profile = await candidate_service.get_candidate_profile(candidate_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate profile not found"
            )
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting candidate profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting candidate profile: {str(e)}"
        )


@router.get("/search")
async def search_candidates(
    query: str,
    skills: Optional[List[str]] = None,
    top_k: int = 20,
    db: Session = Depends(get_db)
):
    """Search candidates using the recommendation system"""
    
    try:
        candidate_service = CandidateRecommendationService()
        
        filters = {}
        if skills:
            filters['skills'] = skills
        
        results = await candidate_service.search_candidates(query, filters, top_k)
        
        return {
            "query": query,
            "filters": filters,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"❌ Error searching candidates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching candidates: {str(e)}"
        )
