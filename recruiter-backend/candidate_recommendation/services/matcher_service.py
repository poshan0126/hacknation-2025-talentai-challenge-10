from typing import List, Dict, Any, Optional
from pathlib import Path
from sqlalchemy.orm import Session

from ..models.recommendation import (
    JobDescription, CandidateMatch, RecommendationRequest, 
    RecommendationResponse, AdvancedRecommendationRequest, SearchFilters
)
from ..database.models import JobDB, CandidateDB, RecommendationHistoryDB
from ..semantic_matcher import SemanticMatcher
import os
import json
from datetime import datetime

class CandidateMatcherService:
    def __init__(self, resume_data_path: Optional[str] = None):
        self.matcher = SemanticMatcher()
        self.resume_data_path = resume_data_path or os.getenv(
            "RESUME_DATA_PATH", 
            "/Users/poshan/Documents/hacknation-2025-talentai-challenge-10/candidate-backend/resume_generator_parser/example_output/parsed"
        )

    def find_candidates(
        self, 
        request: RecommendationRequest, 
        db: Session
    ) -> RecommendationResponse:
        # Convert our Pydantic model to the legacy dataclass
        legacy_job = self._convert_to_legacy_job(request.job)
        
        # Use existing semantic matcher
        matches = self.matcher.match_candidates(
            job=legacy_job,
            parsed_resumes_dir=self.resume_data_path,
            top_n=request.top_n
        )
        
        # Convert back to our Pydantic models
        candidates = []
        for match in matches:
            candidates.append(CandidateMatch(
                name=match.name,
                filename=match.filename,
                title=match.title, 
                match_score=match.match_score,
                skills_match=match.skills_match,
                summary=match.summary if request.include_summary else None
            ))
        
        # Save job to database if not exists
        job_db = db.query(JobDB).filter(JobDB.id == request.job.id).first()
        if not job_db:
            job_db = JobDB(
                id=request.job.id,
                title=request.job.title,
                company=request.job.company,
                description=request.job.description,
                requirements=request.job.requirements,
                preferred_skills=request.job.preferred_skills,
                location=request.job.location,
                salary_range=request.job.salary_range,
                priority=request.job.priority.value,
                status=request.job.status.value
            )
            db.add(job_db)
            db.commit()
        
        # Log search history
        history = RecommendationHistoryDB(
            job_id=request.job.id,
            search_query=request.dict(),
            results=[c.dict() for c in candidates],
            total_candidates=len(candidates),
            search_metadata={
                "matcher_model": self.matcher.model_name,
                "blend_alpha": self.matcher.blend_alpha,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        db.add(history)
        db.commit()
        
        return RecommendationResponse(
            job_id=request.job.id,
            candidates=candidates,
            total_candidates_searched=len(matches),
            search_metadata={
                "model_used": self.matcher.model_name,
                "data_source": self.resume_data_path
            }
        )

    def find_candidates_advanced(
        self, 
        request: AdvancedRecommendationRequest, 
        db: Session
    ) -> RecommendationResponse:
        # For now, use the basic matching and then apply filters
        basic_request = RecommendationRequest(
            job=request.job,
            top_n=min(request.top_n * 2, 50),  # Get more candidates to filter
            include_summary=request.include_summary
        )
        
        basic_response = self.find_candidates(basic_request, db)
        
        # Apply filters
        filtered_candidates = self._apply_filters(
            basic_response.candidates, 
            request.filters,
            request.boost_skills,
            request.penalty_skills
        )
        
        # Limit to requested number
        filtered_candidates = filtered_candidates[:request.top_n]
        
        return RecommendationResponse(
            job_id=request.job.id,
            candidates=filtered_candidates,
            total_candidates_searched=basic_response.total_candidates_searched,
            search_metadata={
                **basic_response.search_metadata,
                "filters_applied": request.filters.dict(),
                "boost_skills": request.boost_skills,
                "penalty_skills": request.penalty_skills
            }
        )

    def _convert_to_legacy_job(self, job: JobDescription):
        from ..semantic_matcher import JobDescription as LegacyJob
        return LegacyJob(
            title=job.title,
            company=job.company,
            description=job.description,
            requirements=job.requirements,
            preferred_skills=job.preferred_skills
        )

    def _apply_filters(
        self, 
        candidates: List[CandidateMatch], 
        filters: SearchFilters,
        boost_skills: List[str] = None,
        penalty_skills: List[str] = None
    ) -> List[CandidateMatch]:
        filtered = []
        
        for candidate in candidates:
            # Apply experience filters
            if filters.min_experience is not None:
                if candidate.experience_years is None or candidate.experience_years < filters.min_experience:
                    continue
            
            if filters.max_experience is not None:
                if candidate.experience_years is None or candidate.experience_years > filters.max_experience:
                    continue
            
            # Apply required skills filter
            if filters.required_skills:
                candidate_skills_lower = [s.lower() for s in candidate.skills_match]
                required_skills_lower = [s.lower() for s in filters.required_skills]
                if not all(req in candidate_skills_lower for req in required_skills_lower):
                    continue
            
            # Apply location filter (basic string matching)
            if filters.location:
                if candidate.location and filters.location.lower() not in candidate.location.lower():
                    continue
            
            # Apply skill boosts and penalties
            adjusted_candidate = candidate.copy()
            if boost_skills or penalty_skills:
                adjusted_candidate.match_score = self._adjust_score(
                    candidate, boost_skills, penalty_skills
                )
            
            filtered.append(adjusted_candidate)
        
        # Re-sort by adjusted scores
        return sorted(filtered, key=lambda x: x.match_score, reverse=True)

    def _adjust_score(
        self, 
        candidate: CandidateMatch, 
        boost_skills: List[str] = None, 
        penalty_skills: List[str] = None
    ) -> float:
        score = candidate.match_score
        candidate_skills_lower = [s.lower() for s in candidate.skills_match]
        
        if boost_skills:
            boost_count = sum(1 for skill in boost_skills if skill.lower() in candidate_skills_lower)
            score += boost_count * 0.1  # 10% boost per matching boost skill
        
        if penalty_skills:
            penalty_count = sum(1 for skill in penalty_skills if skill.lower() in candidate_skills_lower)
            score -= penalty_count * 0.05  # 5% penalty per matching penalty skill
        
        return max(0.0, min(1.0, score))  # Keep score between 0 and 1