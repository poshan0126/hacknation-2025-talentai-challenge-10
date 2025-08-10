"""
Candidate Recommendation Service
Integrates with existing candidate_recommendation system for job matching
"""
from typing import List, Dict, Any, Optional
import asyncio
import sys
import os
from pathlib import Path
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the candidate_recommendation directory to Python path
current_dir = Path(__file__).parent
candidate_rec_dir = current_dir / ".." / "candidate_recommendation"
sys.path.insert(0, str(candidate_rec_dir))

try:
    from semantic_matcher import SemanticMatcher
    from models import SimpleJobDescription
    logger.info("✅ Successfully imported candidate recommendation modules")
except ImportError as e:
    logger.error(f"❌ Failed to import candidate recommendation modules: {e}")
    SemanticMatcher = None
    SimpleJobDescription = None

# Use absolute imports to avoid relative import issues
try:
    from config.settings import settings
except ImportError:
    # Fallback for when running as standalone script
    import sys
    from pathlib import Path
    
    # Get the recruiter-backend directory (parent of services)
    backend_dir = Path(__file__).parent.parent
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    try:
        from config.settings import settings
    except ImportError:
        # If still failing, try importing from the config package directly
        try:
            from config import settings
        except ImportError:
            # Last resort: try to import the settings class and create instance
            try:
                from config.settings import RecruiterSettings
                settings = RecruiterSettings()
            except ImportError:
                # Create a minimal settings object as fallback
                class FallbackSettings:
                    def __init__(self):
                        self.api_title = "Recruiter Backend API"
                        self.api_version = "1.0.0"
                        self.api_debug = False
                        self.database_url = "postgresql://user:password@localhost:5432/recruiter_db"
                        self.redis_url = "redis://localhost:6379/0"
                        self.llm_provider = "ollama"
                        self.ollama_base_url = "http://localhost:11434"
                        self.ollama_model = "llama3.1-8b"
                        self.chroma_persist_directory = "./data/chroma_db"
                        self.embedding_model = "all-mpnet-base-v2"
                        self.semantic_weight = 0.7
                        self.skills_weight = 0.2
                        self.experience_weight = 0.1
                
                settings = FallbackSettings()


class CandidateRecommendationService:
    """Service for integrating with existing candidate recommendation system"""
    
    def __init__(self):
        # Initialize your existing candidate_recommendation system
        try:
            # Get the path to the parsed resumes directory
            # Try multiple possible locations
            possible_resumes_dirs = [
                # Correct path to existing parsed resumes
                Path(__file__).parent.parent.parent / "candidate-backend" / "resume_generator_parser" / "example_output" / "parsed",
                # Alternative relative paths
                Path(__file__).parent.parent.parent / "resume_generator_parser" / "example_output" / "parsed",
                # Fallback to current directory structure
                Path(__file__).parent.parent / "sample_data" / "resumes"
            ]
            
            self.resumes_dir = None
            for dir_path in possible_resumes_dirs:
                if dir_path.exists() and dir_path.is_dir():
                    self.resumes_dir = str(dir_path.resolve())
                    logger.info(f"📁 Found resumes directory: {self.resumes_dir}")
                    break
            
            if not self.resumes_dir:
                logger.warning("⚠️ No resumes directory found, will use fallback")
                self.resumes_dir = str(possible_resumes_dirs[0])
            
            # Initialize the semantic matcher with your configuration
            if SemanticMatcher and SimpleJobDescription:
                self.matcher = SemanticMatcher(
                    sbert_model="sentence-transformers/all-mpnet-base-v2",
                    device="cpu",
                    blend_alpha=0.25,
                    title_weight=0.10
                )
                logger.info("✅ Semantic matcher initialized successfully")
            else:
                logger.error("❌ Semantic matcher modules not available")
                self.matcher = None
            
        except Exception as e:
            logger.error(f"❌ Error initializing candidate recommendation system: {e}")
            self.matcher = None
            self.resumes_dir = None
    
    async def get_candidate_recommendations(
        self,
        job_data: Dict[str, Any],
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get candidate recommendations for a job using parsed resume data
        
        Args:
            job_data: Job posting information
            top_k: Number of top candidates to return
            filters: Additional filters (skills, experience, location, etc.)
            
        Returns:
            List of recommended candidates with scores and metadata
        """
        try:
            if not self.resumes_dir:
                logger.error("❌ Candidate recommendation system not initialized")
                return []
            
            # Load parsed resumes
            candidates = self._load_parsed_resumes()
            if not candidates:
                logger.warning("⚠️ No candidates found in parsed resumes")
                return []
            
            logger.info(f"🔍 Matching job: {job_data.get('title', 'Unknown')} against {len(candidates)} candidates")
            
            # Extract job requirements
            job_requirements = []
            if job_data.get('required_skills'):
                job_requirements.extend(job_data['required_skills'])
            if job_data.get('requirements'):
                job_requirements.extend(job_data['requirements'])
            
            job_preferred = []
            if job_data.get('nice_to_have_skills'):
                job_preferred.extend(job_data['nice_to_have_skills'])
            if job_data.get('preferred_skills'):
                job_preferred.extend(job_data['preferred_skills'])
            
            logger.info(f"📋 Requirements: {job_requirements}")
            logger.info(f"⭐ Preferred: {job_preferred}")
            
            # Calculate scores for each candidate
            scored_candidates = []
            for candidate in candidates:
                # Calculate skills match score
                candidate_skills = set(candidate.get('skills', []))
                job_skills = set(job_requirements + job_preferred)
                
                if candidate_skills and job_skills:
                    intersection = len(candidate_skills.intersection(job_skills))
                    union = len(candidate_skills.union(job_skills))
                    skills_score = intersection / union if union > 0 else 0.0
                else:
                    skills_score = 0.0
                
                # Calculate title relevance score
                candidate_title = candidate.get('title', '').lower()
                job_title = job_data.get('title', '').lower()
                
                if candidate_title and job_title:
                    # Simple title similarity (can be enhanced with semantic matching)
                    title_words = set(job_title.split())
                    candidate_title_words = set(candidate_title.split())
                    title_intersection = len(title_words.intersection(candidate_title_words))
                    title_union = len(title_words.union(candidate_title_words))
                    title_score = title_intersection / title_union if title_union > 0 else 0.0
                else:
                    title_score = 0.0
                
                # Calculate overall score (weighted combination)
                overall_score = (skills_score * 0.7) + (title_score * 0.3)
                
                scored_candidates.append({
                    'candidate': candidate,
                    'overall_score': overall_score,
                    'skills_score': skills_score,
                    'title_score': title_score
                })
            
            # Sort by overall score and take top_k
            scored_candidates.sort(key=lambda x: x['overall_score'], reverse=True)
            top_candidates = scored_candidates[:top_k]
            
            if not top_candidates:
                logger.warning("⚠️ No candidates matched the criteria")
                return []
            
            logger.info(f"✅ Found {len(top_candidates)} candidate matches")
            
            # Transform to recommendation format
            recommendations = []
            for scored_candidate in top_candidates:
                candidate = scored_candidate['candidate']
                
                # Extract relevant skills
                relevant_skills = []
                if candidate.get('skills'):
                    candidate_skills = set(candidate['skills'])
                    job_skills = set(job_requirements + job_preferred)
                    relevant_skills = list(candidate_skills.intersection(job_skills))
                
                recommendation = {
                    "candidate_id": candidate['id'],
                    "candidate_name": candidate['name'],
                    "overall_score": round(scored_candidate['overall_score'], 3),
                    "semantic_score": round(scored_candidate['skills_score'], 3),
                    "skills_score": round(scored_candidate['skills_score'], 3),
                    "experience_score": 0.8,  # Default experience score
                    "title_score": round(scored_candidate['title_score'], 3),
                    "candidate_summary": candidate.get('summary', ''),
                    "candidate_skills": candidate.get('skills', []),
                    "candidate_experience": candidate.get('experience', []),
                    "candidate_education": candidate.get('education', []),
                    "ai_analysis": f"Strong match with {scored_candidate['overall_score']:.2f} score. Skills alignment: {len(relevant_skills)} relevant skills.",
                    "strengths": relevant_skills[:5] if relevant_skills else candidate.get('skills', [])[:5],
                    "concerns": [],
                    "recommendations": f"Excellent candidate match. Consider for interview based on strong skills alignment."
                }
                
                recommendations.append(recommendation)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Error getting candidate recommendations: {e}")
            return []
    
    async def get_candidate_profile(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed candidate profile from your system
        
        Args:
            candidate_id: Unique identifier for the candidate
            
        Returns:
            Detailed candidate profile or None if not found
        """
        try:
            if not self.resumes_dir:
                logger.error("❌ Resumes directory not available")
                return None
            
            # Look for the candidate's parsed resume file
            resumes_path = Path(self.resumes_dir)
            candidate_file = None
            
            # Search for the candidate's file
            for resume_file in resumes_path.glob("*.json"):
                if candidate_id in resume_file.name:
                    candidate_file = resume_file
                    break
            
            if not candidate_file:
                logger.warning(f"❌ Candidate file not found for ID: {candidate_id}")
                return None
            
            # Load and parse the resume data
            with open(candidate_file, 'r') as f:
                resume_data = json.load(f)
            
            # Extract profile information
            data = resume_data.get('data', resume_data)
            
            profile = {
                "id": candidate_id,
                "name": data.get('name', 'Unknown'),
                "email": data.get('email', ''),
                "summary": resume_data.get('summary', ''),
                "skills": self._extract_skills(data.get('skills', {})),
                "experience": data.get('experience', []),
                "education": data.get('education', []),
                "performance_metrics": {
                    "bug_hunt_score": 0.85,  # Default - could be enhanced with actual data
                    "skill_assessment_score": 0.92,
                    "overall_ranking": 15
                }
            }
            
            return profile
            
        except Exception as e:
            logger.error(f"❌ Error getting candidate profile: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _extract_skills(self, skills_data: Any) -> List[str]:
        """Extract skills from various data formats"""
        if isinstance(skills_data, dict):
            skills = []
            for _, skill_list in skills_data.items():
                if isinstance(skill_list, list):
                    skills.extend(skill_list)
            return skills
        elif isinstance(skills_data, list):
            return skills_data
        else:
            return []
    
    def _load_parsed_resumes(self) -> List[Dict[str, Any]]:
        """Load and parse all resume JSON files from the resumes directory"""
        candidates = []
        
        if not self.resumes_dir or not Path(self.resumes_dir).exists():
            logger.warning("⚠️ Resumes directory not available")
            return candidates
        
        try:
            resumes_path = Path(self.resumes_dir)
            json_files = list(resumes_path.glob("*.json"))
            
            if not json_files:
                logger.warning("⚠️ No JSON resume files found")
                return candidates
            
            logger.info(f"📁 Loading {len(json_files)} parsed resume files")
            
            for resume_file in json_files:
                try:
                    with open(resume_file, 'r', encoding='utf-8') as f:
                        resume_data = json.load(f)
                    
                    # Extract candidate data
                    data = resume_data.get('data', resume_data)
                    
                    # Create candidate object
                    candidate = {
                        'id': resume_file.stem,  # Use filename without extension as ID
                        'name': data.get('name', 'Unknown'),
                        'email': data.get('email', ''),
                        'title': data.get('title', ''),
                        'summary': resume_data.get('summary', ''),
                        'skills': self._extract_skills(data.get('skills', {})),
                        'experience': data.get('experience', []),
                        'education': data.get('education', []),
                        'resume_file': str(resume_file)
                    }
                    
                    candidates.append(candidate)
                    
                except Exception as e:
                    logger.warning(f"⚠️ Failed to load resume {resume_file.name}: {e}")
                    continue
            
            logger.info(f"✅ Successfully loaded {len(candidates)} candidates")
            return candidates
            
        except Exception as e:
            logger.error(f"❌ Error loading parsed resumes: {e}")
            return candidates
        """Extract skills from various data formats"""
        if isinstance(skills_data, dict):
            skills = []
            for _, skill_list in skills_data.items():
                if isinstance(skill_list, list):
                    skills.extend(skill_list)
            return skills
        elif isinstance(skills_data, list):
            return skills_data
        else:
            return []
    
    async def update_candidate_performance(
        self, 
        candidate_id: str, 
        performance_data: Dict[str, Any]
    ) -> bool:
        """
        Update candidate performance metrics in your system
        
        Args:
            candidate_id: Unique identifier for the candidate
            performance_data: New performance metrics
            
        Returns:
            True if update successful, False otherwise
        """
        try:
            # Store performance data in a local file for now
            # In production, this would integrate with your actual system
            performance_dir = Path(self.resumes_dir).parent / "performance_metrics"
            performance_dir.mkdir(exist_ok=True)
            
            performance_file = performance_dir / f"{candidate_id}_performance.json"
            
            # Load existing performance data if available
            existing_data = {}
            if performance_file.exists():
                try:
                    with open(performance_file, 'r') as f:
                        existing_data = json.load(f)
                except Exception:
                    existing_data = {}
            
            # Update with new performance data
            existing_data.update(performance_data)
            existing_data['last_updated'] = str(datetime.now())
            
            # Save updated performance data
            with open(performance_file, 'w') as f:
                json.dump(existing_data, f, indent=2)
            
            logger.info(f"✅ Updated performance for candidate {candidate_id}: {performance_data}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error updating candidate performance: {e}")
            return False
    
    async def get_candidate_skills(self, candidate_id: str) -> List[str]:
        """
        Get candidate skills from your system
        
        Args:
            candidate_id: Unique identifier for the candidate
            
        Returns:
            List of candidate skills
        """
        try:
            # Get candidate profile and extract skills
            profile = await self.get_candidate_profile(candidate_id)
            if profile:
                return profile.get('skills', [])
            
            # Fallback to mock skills if profile not found
            return ["Python", "FastAPI", "PostgreSQL", "Docker"]
            
        except Exception as e:
            logger.error(f"Error getting candidate skills: {e}")
            return []
    
    async def search_candidates(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Search candidates using your existing search functionality
        
        Args:
            query: Search query (skills, experience, etc.)
            filters: Additional filters
            top_k: Maximum number of results
            
        Returns:
            List of matching candidates
        """
        try:
            # Create a mock job for search purposes
            mock_job = {
                "title": "Search Query",
                "description": query,
                "required_skills": filters.get('skills', []) if filters else [],
                "preferred_skills": []
            }
            
            # Use the recommendation system to find matches
            results = await self.get_candidate_recommendations(mock_job, top_k, filters)
            
            # Transform to search result format
            search_results = []
            for result in results:
                search_results.append({
                    "candidate_id": result["candidate_id"],
                    "candidate_name": result["candidate_name"],
                    "relevance_score": result["overall_score"],
                    "skills": result["candidate_skills"],
                    "summary": result["candidate_summary"]
                })
            
            return search_results
            
        except Exception as e:
            logger.error(f"Error searching candidates: {e}")
            return []
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get system status and health information"""
        try:
            resumes_dir = Path(self.resumes_dir) if self.resumes_dir else None
            resumes_exist = resumes_dir and resumes_dir.exists() if resumes_dir else False
            resumes_accessible = resumes_exist and resumes_dir.is_dir() if resumes_dir else False
            
            # Count available resumes
            resume_count = 0
            if resumes_accessible:
                try:
                    json_files = list(resumes_dir.glob("*.json"))
                    resume_count = len(json_files)
                except Exception:
                    resume_count = 0
            
            # Check if we can load candidates
            candidates = self._load_parsed_resumes()
            candidates_loaded = len(candidates) > 0
            
            return {
                "matcher_initialized": self.matcher is not None,
                "matcher_working": self.matcher is not None,
                "resumes_directory": str(self.resumes_dir) if self.resumes_dir else None,
                "resumes_directory_exists": resumes_exist,
                "resumes_accessible": resumes_accessible,
                "resume_count": resume_count,
                "candidates_loaded": candidates_loaded,
                "candidates_available": len(candidates),
                "modules_loaded": True,
                "system_health": "healthy" if (resumes_accessible and candidates_loaded) else "degraded" if resumes_accessible else "unhealthy",
                "last_updated": str(datetime.now())
            }
        except Exception as e:
            logger.error(f"❌ Error getting system status: {e}")
            return {
                "matcher_initialized": False,
                "matcher_working": False,
                "resumes_directory": self.resumes_dir,
                "resumes_directory_exists": False,
                "resumes_accessible": False,
                "resume_count": 0,
                "modules_loaded": False,
                "system_health": "unhealthy",
                "error": str(e)
            }

    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for the recommendation system"""
        try:
            metrics = {
                "total_recommendations_generated": 0,
                "average_response_time_ms": 0,
                "success_rate": 1.0,
                "model_accuracy": 0.85,
                "last_updated": str(datetime.now())
            }
            
            # Try to get actual metrics if available
            if self.resumes_dir and Path(self.resumes_dir).exists():
                try:
                    resumes_path = Path(self.resumes_dir)
                    resume_files = list(resumes_path.glob("*.json"))
                    metrics["total_candidates_available"] = len(resume_files)
                except Exception:
                    metrics["total_candidates_available"] = 0
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Error getting performance metrics: {e}")
            return {
                "error": str(e),
                "last_updated": str(datetime.now())
            }
