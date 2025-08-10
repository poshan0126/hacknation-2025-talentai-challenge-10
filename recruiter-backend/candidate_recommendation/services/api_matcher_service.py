from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import logging
import asyncio
import numpy as np
from sentence_transformers import SentenceTransformer

from ..models.recommendation import (
    JobDescription, CandidateMatch, RecommendationRequest, 
    RecommendationResponse, AdvancedRecommendationRequest, SearchFilters
)
from ..database.models import JobDB, CandidateDB, RecommendationHistoryDB
from .candidate_client import get_candidate_client, CandidateProfile
from datetime import datetime

logger = logging.getLogger(__name__)

class APICandidateMatcherService:
    """
    Enhanced matcher service that fetches candidates from the candidate backend API
    instead of local files, then performs semantic matching.
    """
    
    def __init__(self, sbert_model: str = "sentence-transformers/all-mpnet-base-v2"):
        self.model = SentenceTransformer(sbert_model)
        self.model_name = sbert_model
        self.candidate_client = get_candidate_client()
        self.blend_alpha = 0.25  # Weight for skills vs semantic similarity
        self.title_weight = 0.10  # Weight for title alignment

    async def find_candidates(
        self, 
        request: RecommendationRequest, 
        db: Session
    ) -> RecommendationResponse:
        """Find candidates by fetching from candidate backend API and performing semantic matching."""
        
        # Step 1: Fetch all candidates from candidate backend
        logger.info("Fetching candidates from candidate backend API...")
        candidates = await self.candidate_client.get_all_candidates()
        logger.info(f"Retrieved {len(candidates)} candidates from API")
        
        if not candidates:
            logger.warning("No candidates found from API")
            return RecommendationResponse(
                job_id=request.job.id,
                candidates=[],
                total_candidates_searched=0,
                search_metadata={"error": "No candidates available from API"}
            )
        
        # Step 2: Perform semantic matching
        matches = await self._perform_semantic_matching(
            job=request.job,
            candidates=candidates,
            top_n=request.top_n,
            include_summary=request.include_summary
        )
        
        # Step 3: Save job to database if not exists
        await self._save_job_to_db(request.job, db)
        
        # Step 4: Log search history
        await self._log_search_history(request, matches, db)
        
        return RecommendationResponse(
            job_id=request.job.id,
            candidates=matches,
            total_candidates_searched=len(candidates),
            search_metadata={
                "model_used": self.model_name,
                "data_source": "candidate_backend_api",
                "api_candidates_count": len(candidates)
            }
        )

    async def find_candidates_advanced(
        self, 
        request: AdvancedRecommendationRequest, 
        db: Session
    ) -> RecommendationResponse:
        """Advanced candidate search with filters and skill adjustments."""
        
        # Get more candidates initially to allow for filtering
        basic_request = RecommendationRequest(
            job=request.job,
            top_n=min(request.top_n * 3, 100),  # Get more to filter
            include_summary=request.include_summary
        )
        
        basic_response = await self.find_candidates(basic_request, db)
        
        # Apply advanced filters
        filtered_candidates = self._apply_advanced_filters(
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
                "penalty_skills": request.penalty_skills,
                "filtered_count": len(filtered_candidates)
            }
        )

    async def _perform_semantic_matching(
        self,
        job: JobDescription,
        candidates: List[CandidateProfile],
        top_n: int,
        include_summary: bool
    ) -> List[CandidateMatch]:
        """Perform semantic matching between job and candidates."""
        
        # Build job description text
        jd_text = self._build_job_text(job)
        jd_skills = self._extract_job_skills(job)
        
        # Build candidate texts and extract metadata
        candidate_texts = []
        candidate_metadata = []
        
        for candidate in candidates:
            text = self._build_candidate_text(candidate)
            candidate_texts.append(text)
            candidate_metadata.append(candidate)
        
        if not candidate_texts:
            return []
        
        # Generate embeddings
        logger.info(f"Generating embeddings for job and {len(candidate_texts)} candidates...")
        jd_embedding = self.model.encode([jd_text], show_progress_bar=False)
        candidate_embeddings = self.model.encode(candidate_texts, batch_size=32, show_progress_bar=False)
        
        # Calculate semantic similarity
        semantic_scores = self._calculate_cosine_similarity(candidate_embeddings, jd_embedding)
        
        # Calculate skills similarity
        skills_scores = []
        title_scores = []
        
        for candidate in candidate_metadata:
            candidate_skills = self._extract_candidate_skills(candidate)
            skills_score = self._calculate_jaccard_similarity(jd_skills, candidate_skills)
            skills_scores.append(skills_score)
            
            title_score = self._calculate_title_alignment(job.title, candidate.title or "")
            title_scores.append(title_score)
        
        # Combine scores
        final_scores = []
        for i in range(len(candidates)):
            combined_score = (
                (1.0 - self.blend_alpha) * semantic_scores[i] + 
                self.blend_alpha * skills_scores[i] +
                self.title_weight * title_scores[i]
            )
            final_scores.append(combined_score)
        
        # Sort and create matches
        sorted_indices = np.argsort(final_scores)[::-1]  # Descending order
        
        matches = []
        for idx in sorted_indices[:top_n]:
            candidate = candidate_metadata[idx]
            candidate_skills = self._extract_candidate_skills(candidate)
            
            match = CandidateMatch(
                candidate_id=candidate.user_id,
                name=candidate.display_name,
                filename=f"api_user_{candidate.user_id}",
                title=candidate.title,
                match_score=float(final_scores[idx]),
                skills_match=candidate_skills[:15],  # Top 15 skills
                summary=candidate.summary if include_summary else None,
                experience_years=self._infer_experience_years(candidate),
                location=self._infer_location(candidate)
            )
            matches.append(match)
        
        return matches

    def _build_job_text(self, job: JobDescription) -> str:
        """Build searchable text from job description."""
        parts = [
            job.title or "",
            job.company or "",
            job.description or "",
            "Requirements: " + " ".join(job.requirements or []),
            "Preferred: " + " ".join(job.preferred_skills or [])
        ]
        return "\n".join([p for p in parts if p]).strip()

    def _build_candidate_text(self, candidate: CandidateProfile) -> str:
        """Build searchable text from candidate profile."""
        parts = [
            candidate.title or "",
            candidate.summary or "",
            f"Skills: {self._format_skills_text(candidate.skills or {})}"
        ]
        return "\n".join([p for p in parts if p]).strip()

    def _format_skills_text(self, skills: Dict[str, List[str]]) -> str:
        """Format skills dictionary into readable text."""
        skill_parts = []
        for category, skill_list in skills.items():
            if skill_list:
                skill_parts.extend(skill_list)
        return ", ".join(skill_parts[:20])  # Top 20 skills

    def _extract_job_skills(self, job: JobDescription) -> List[str]:
        """Extract normalized skills from job description."""
        skills = set()
        
        # Extract from requirements
        for req in (job.requirements or []):
            skills.update(self._normalize_text(req).split())
        
        # Extract from preferred skills
        for skill in (job.preferred_skills or []):
            skills.update(self._normalize_text(skill).split())
        
        # Extract from title
        skills.update(self._normalize_text(job.title or "").split())
        
        return [s for s in skills if len(s) > 2]  # Filter short words

    def _extract_candidate_skills(self, candidate: CandidateProfile) -> List[str]:
        """Extract normalized skills from candidate profile."""
        skills = set()
        
        if candidate.skills:
            for category, skill_list in candidate.skills.items():
                for skill in skill_list:
                    skills.add(self._normalize_text(skill))
        
        return list(skills)

    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison."""
        if not text:
            return ""
        return text.lower().strip()

    def _calculate_cosine_similarity(self, candidate_embeddings, job_embedding):
        """Calculate cosine similarity between embeddings."""
        # Normalize embeddings
        job_norm = job_embedding / (np.linalg.norm(job_embedding, axis=1, keepdims=True) + 1e-9)
        candidate_norms = candidate_embeddings / (np.linalg.norm(candidate_embeddings, axis=1, keepdims=True) + 1e-9)
        
        # Calculate similarity
        similarities = np.dot(candidate_norms, job_norm.T).flatten()
        return similarities

    def _calculate_jaccard_similarity(self, set_a: List[str], set_b: List[str]) -> float:
        """Calculate Jaccard similarity between two skill sets."""
        set_a_norm = set(self._normalize_text(s) for s in set_a)
        set_b_norm = set(self._normalize_text(s) for s in set_b)
        
        if not set_a_norm and not set_b_norm:
            return 0.0
        
        intersection = len(set_a_norm & set_b_norm)
        union = len(set_a_norm | set_b_norm)
        
        return intersection / max(1, union)

    def _calculate_title_alignment(self, job_title: str, candidate_title: str) -> float:
        """Calculate title alignment score."""
        if not job_title or not candidate_title:
            return 0.0
        
        job_words = set(self._normalize_text(job_title).split())
        candidate_words = set(self._normalize_text(candidate_title).split())
        
        if not job_words:
            return 0.0
        
        intersection = len(job_words & candidate_words)
        return intersection / max(3, len(job_words))  # Normalize by job title length

    def _infer_experience_years(self, candidate: CandidateProfile) -> Optional[int]:
        """Infer years of experience from candidate data."""
        stats = candidate.statistics or {}
        challenges_completed = stats.get("challenges_completed", 0)
        
        # Simple heuristic based on challenge activity
        if challenges_completed >= 15:
            return 7  # Senior level
        elif challenges_completed >= 10:
            return 5  # Mid level
        elif challenges_completed >= 5:
            return 3  # Junior+ level
        else:
            return 1  # Entry level

    def _infer_location(self, candidate: CandidateProfile) -> Optional[str]:
        """Infer location from candidate data (placeholder for future enhancement)."""
        # This could be enhanced to extract location from resume data
        return None

    def _apply_advanced_filters(
        self,
        candidates: List[CandidateMatch],
        filters: SearchFilters,
        boost_skills: List[str],
        penalty_skills: List[str]
    ) -> List[CandidateMatch]:
        """Apply advanced filters to candidate list."""
        
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
            
            # Apply skill boosts and penalties
            adjusted_candidate = candidate.copy()
            if boost_skills or penalty_skills:
                adjusted_candidate.match_score = self._adjust_score_with_skills(
                    candidate, boost_skills, penalty_skills
                )
            
            filtered.append(adjusted_candidate)
        
        # Re-sort by adjusted scores
        return sorted(filtered, key=lambda x: x.match_score, reverse=True)

    def _adjust_score_with_skills(
        self,
        candidate: CandidateMatch,
        boost_skills: List[str] = None,
        penalty_skills: List[str] = None
    ) -> float:
        """Adjust candidate score based on skill boosts and penalties."""
        score = candidate.match_score
        candidate_skills_lower = [s.lower() for s in candidate.skills_match]
        
        if boost_skills:
            boost_count = sum(1 for skill in boost_skills if skill.lower() in candidate_skills_lower)
            score += boost_count * 0.1  # 10% boost per matching boost skill
        
        if penalty_skills:
            penalty_count = sum(1 for skill in penalty_skills if skill.lower() in candidate_skills_lower)
            score -= penalty_count * 0.05  # 5% penalty per matching penalty skill
        
        return max(0.0, min(1.0, score))  # Keep score between 0 and 1

    async def _save_job_to_db(self, job: JobDescription, db: Session):
        """Save job to database if it doesn't exist."""
        job_db = db.query(JobDB).filter(JobDB.id == job.id).first()
        if not job_db:
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

    async def _log_search_history(
        self, 
        request: RecommendationRequest, 
        matches: List[CandidateMatch], 
        db: Session
    ):
        """Log search history to database."""
        history = RecommendationHistoryDB(
            job_id=request.job.id,
            search_query=request.dict(),
            results=[m.dict() for m in matches],
            total_candidates=len(matches),
            search_metadata={
                "matcher_model": self.model_name,
                "blend_alpha": self.blend_alpha,
                "title_weight": self.title_weight,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        db.add(history)
        db.commit()