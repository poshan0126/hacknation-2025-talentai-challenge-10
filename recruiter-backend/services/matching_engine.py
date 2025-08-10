"""
AI-powered candidate matching engine
Integrates with existing candidate_recommendation system
"""
from typing import List, Dict, Any, Optional
import numpy as np
import logging
from sentence_transformers import SentenceTransformer

# Use absolute imports to avoid relative import issues
try:
    from config.settings import settings
    from services.candidate_recommendation import CandidateRecommendationService
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
        from services.candidate_recommendation import CandidateRecommendationService
    except ImportError:
        # If still failing, try importing from the config package directly
        try:
            from config import settings
            from services.candidate_recommendation import CandidateRecommendationService
        except ImportError:
            # Last resort: try to import the settings class and create instance
            try:
                from config.settings import RecruiterSettings
                settings = RecruiterSettings()
                from services.candidate_recommendation import CandidateRecommendationService
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
                
                # Try to import the service again
                try:
                    from services.candidate_recommendation import CandidateRecommendationService
                except ImportError:
                    CandidateRecommendationService = None

# Configure logging
logger = logging.getLogger(__name__)


class MatchingEngine:
    """AI-powered candidate matching engine using semantic similarity"""
    
    def __init__(self):
        try:
            self.embedding_model = SentenceTransformer(settings.embedding_model)
            logger.info(f"✅ Embedding model initialized: {settings.embedding_model}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize embedding model: {e}")
            self.embedding_model = None
            
        self.semantic_weight = settings.semantic_weight
        self.skills_weight = settings.skills_weight
        self.experience_weight = settings.experience_weight
        
        # Initialize the candidate recommendation service
        try:
            self.candidate_service = CandidateRecommendationService()
            logger.info("✅ Candidate recommendation service initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize candidate recommendation service: {e}")
            self.candidate_service = None
    
    async def find_candidates_for_job(
        self, 
        job_data: Dict[str, Any], 
        candidates: List[Dict[str, Any]] = None, 
        top_k: int = 10,
        use_recommendation_system: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Find the best candidates for a job using AI matching
        
        Args:
            job_data: Job posting information
            candidates: List of candidate profiles (optional if using recommendation system)
            top_k: Number of top candidates to return
            use_recommendation_system: Whether to use your candidate recommendation system
            
        Returns:
            List of ranked candidates with matching scores
        """
        
        # If using your recommendation system, get candidates from there
        if use_recommendation_system and self.candidate_service:
            try:
                logger.info("🔍 Using candidate recommendation system for job matching...")
                recommendations = await self.candidate_service.get_candidate_recommendations(
                    job_data, top_k
                )
                
                if recommendations:
                    logger.info(f"✅ Found {len(recommendations)} candidates from recommendation system")
                    return recommendations
                else:
                    logger.warning("⚠️ No candidates found from recommendation system, falling back to manual matching")
            except Exception as e:
                logger.error(f"❌ Error using recommendation system: {e}, falling back to manual matching")
        
        # Fallback to manual matching if no recommendation system or error
        if not candidates:
            logger.warning("⚠️ No candidates provided and recommendation system unavailable")
            return []
        
        # Check if embedding model is available
        if not self.embedding_model:
            logger.error("❌ Embedding model not available for manual matching")
            return []
        
        try:
            # Prepare job text for embedding
            job_text = self._prepare_job_text(job_data)
            job_embedding = self.embedding_model.encode(job_text)
            
            # Calculate scores for each candidate
            candidate_scores = []
            for candidate in candidates:
                score_info = await self._calculate_candidate_score(
                    candidate, job_data, job_embedding
                )
                candidate_scores.append(score_info)
            
            # Sort by overall score and return top_k
            candidate_scores.sort(key=lambda x: x['overall_score'], reverse=True)
            logger.info(f"✅ Manual matching completed, found {len(candidate_scores)} candidates")
            return candidate_scores[:top_k]
            
        except Exception as e:
            logger.error(f"❌ Error in manual matching: {e}")
            return []
    
    def _prepare_job_text(self, job_data: Dict[str, Any]) -> str:
        """Prepare job text for embedding"""
        def safe_join(value):
            """Safely join values, handling both strings and lists"""
            if isinstance(value, list):
                return ' '.join(str(item) for item in value)
            elif isinstance(value, str):
                return value
            else:
                return str(value) if value is not None else ''
        
        text_parts = [
            safe_join(job_data.get('title', '')),
            safe_join(job_data.get('description', '')),
            safe_join(job_data.get('requirements', '')),
            safe_join(job_data.get('preferred_skills', '')),
            safe_join(job_data.get('responsibilities', ''))
        ]
        return ' '.join(filter(None, text_parts))
    
    async def _calculate_candidate_score(
        self, 
        candidate: Dict[str, Any], 
        job_data: Dict[str, Any], 
        job_embedding: np.ndarray
    ) -> Dict[str, Any]:
        """Calculate comprehensive matching score for a candidate"""
        
        try:
            # Prepare candidate text
            candidate_text = self._prepare_candidate_text(candidate)
            candidate_embedding = self.embedding_model.encode(candidate_text)
            
            # Calculate semantic similarity
            semantic_score = self._cosine_similarity(job_embedding, candidate_embedding)
            
            # Calculate skills overlap
            skills_score = self._calculate_skills_score(candidate, job_data)
            
            # Calculate experience relevance
            experience_score = self._calculate_experience_score(candidate, job_data)
            
            # Calculate title alignment
            title_score = self._calculate_title_score(candidate, job_data)
            
            # Calculate weighted overall score
            overall_score = (
                self.semantic_weight * semantic_score +
                self.skills_weight * skills_score +
                self.experience_weight * experience_score +
                (1 - self.semantic_weight - self.skills_weight - self.experience_weight) * title_score
            )
            
            return {
                'candidate_id': candidate.get('id'),
                'candidate_name': candidate.get('name'),
                'overall_score': round(overall_score, 3),
                'semantic_score': round(semantic_score, 3),
                'skills_score': round(skills_score, 3),
                'experience_score': round(experience_score, 3),
                'title_score': round(title_score, 3),
                'ai_analysis': self._generate_ai_analysis(
                    semantic_score, skills_score, experience_score, title_score
                ),
                'strengths': self._identify_strengths(candidate, job_data),
                'concerns': self._identify_concerns(candidate, job_data),
                'recommendations': self._generate_recommendations(
                    semantic_score, skills_score, experience_score
                )
            }
            
        except Exception as e:
            logger.error(f"❌ Error calculating candidate score: {e}")
            # Return default scores on error
            return {
                'candidate_id': candidate.get('id'),
                'candidate_name': candidate.get('name'),
                'overall_score': 0.0,
                'semantic_score': 0.0,
                'skills_score': 0.0,
                'experience_score': 0.0,
                'title_score': 0.0,
                'ai_analysis': "Error calculating scores",
                'strengths': [],
                'concerns': ["Error in score calculation"],
                'recommendations': "Unable to provide recommendations due to calculation error"
            }
    
    def _prepare_candidate_text(self, candidate: Dict[str, Any]) -> str:
        """Prepare candidate text for embedding"""
        text_parts = [
            candidate.get('summary', ''),
            ' '.join(candidate.get('skills', [])),
            ' '.join([str(exp) for exp in candidate.get('experience', [])]),
            ' '.join([str(edu) for edu in candidate.get('education', [])])
        ]
        return ' '.join(filter(None, text_parts))
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        try:
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            if norm1 == 0 or norm2 == 0:
                return 0.0
            return dot_product / (norm1 * norm2)
        except Exception as e:
            logger.error(f"❌ Error calculating cosine similarity: {e}")
            return 0.0
    
    def _calculate_skills_score(self, candidate: Dict[str, Any], job_data: Dict[str, Any]) -> float:
        """Calculate skills overlap score"""
        try:
            candidate_skills = set(candidate.get('skills', []))
            job_skills = set()
            
            # Extract skills from job requirements and preferred skills
            if job_data.get('required_skills'):
                job_skills.update(job_data['required_skills'])
            if job_data.get('nice_to_have_skills'):
                job_skills.update(job_data['nice_to_have_skills'])
            if job_data.get('preferred_skills'):
                job_skills.update(job_data['preferred_skills'])
            
            if candidate_skills and job_skills:
                intersection = len(candidate_skills.intersection(job_skills))
                union = len(candidate_skills.union(job_skills))
                return intersection / union if union > 0 else 0.0
            
            return 0.5  # Default score if skills can't be compared
            
        except Exception as e:
            logger.error(f"❌ Error calculating skills score: {e}")
            return 0.5
    
    def _calculate_experience_score(self, candidate: Dict[str, Any], job_data: Dict[str, Any]) -> float:
        """Calculate experience relevance score"""
        try:
            candidate_experience = candidate.get('experience', [])
            required_years = job_data.get('min_experience_years', 0)
            
            if not candidate_experience:
                return 0.3  # Low score for no experience
            
            # Calculate total years of experience more accurately
            total_years = 0
            for exp in candidate_experience:
                duration = exp.get('duration', '')
                if isinstance(duration, str):
                    # Parse duration strings like "2 years", "6 months", etc.
                    if 'year' in duration.lower():
                        try:
                            years = float(duration.split()[0])
                            total_years += years
                        except (ValueError, IndexError):
                            continue
                    elif 'month' in duration.lower():
                        try:
                            months = float(duration.split()[0])
                            total_years += months / 12
                        except (ValueError, IndexError):
                            continue
                elif isinstance(duration, (int, float)):
                    total_years += duration
            
            # More sophisticated scoring logic
            if total_years >= required_years * 1.5:
                # Overqualified - slightly penalize but still good
                score = min(1.0, 0.9 + (total_years - required_years * 1.5) * 0.05)
            elif total_years >= required_years:
                # Meets or exceeds requirements
                score = min(1.0, 0.8 + (total_years - required_years) * 0.1)
            elif total_years >= required_years * 0.7:
                # Close to requirements
                score = 0.6 + (total_years - required_years * 0.7) / (required_years * 0.3) * 0.2
            else:
                # Below requirements
                score = max(0.1, total_years / required_years * 0.6)
            
            # Bonus for relevant industry experience
            job_industry = job_data.get('industry', '').lower()
            if job_industry:
                for exp in candidate_experience:
                    company = exp.get('company', '').lower()
                    if job_industry in company or any(industry in company for industry in ['tech', 'software', 'it']):
                        score = min(1.0, score + 0.1)
                        break
            
            return round(score, 3)
                
        except Exception as e:
            logger.error(f"❌ Error calculating experience score: {e}")
            return 0.7  # Default score
    
    def _calculate_title_score(self, candidate: Dict[str, Any], job_data: Dict[str, Any]) -> float:
        """Calculate title alignment score"""
        try:
            candidate_title = candidate.get('title', '').lower()
            job_title = job_data.get('title', '').lower()
            
            if not candidate_title or not job_title:
                return 0.5
            
            # Simple token overlap scoring
            candidate_tokens = set(candidate_title.split())
            job_tokens = set(job_title.split())
            
            if not candidate_tokens or not job_tokens:
                return 0.5
            
            intersection = len(candidate_tokens.intersection(job_tokens))
            union = len(candidate_tokens.union(job_tokens))
            
            return intersection / union if union > 0 else 0.5
            
        except Exception as e:
            logger.error(f"❌ Error calculating title score: {e}")
            return 0.6  # Default score
    
    def _generate_ai_analysis(
        self, 
        semantic_score: float, 
        skills_score: float, 
        experience_score: float, 
        title_score: float
    ) -> str:
        """Generate AI analysis of the match"""
        try:
            if semantic_score > 0.8:
                return "Excellent semantic match with strong alignment to job requirements"
            elif semantic_score > 0.6:
                return "Good semantic match with some areas for consideration"
            else:
                return "Limited semantic match, may require additional evaluation"
        except Exception as e:
            logger.error(f"❌ Error generating AI analysis: {e}")
            return "Unable to generate analysis"
    
    def _identify_strengths(self, candidate: Dict[str, Any], job_data: Dict[str, Any]) -> List[str]:
        """Identify candidate strengths for the job"""
        try:
            strengths = []
            if candidate.get('skills'):
                strengths.extend(candidate['skills'][:3])  # Top 3 skills
            return strengths
        except Exception as e:
            logger.error(f"❌ Error identifying strengths: {e}")
            return []
    
    def _identify_concerns(self, candidate: Dict[str, Any], job_data: Dict[str, Any]) -> List[str]:
        """Identify potential concerns about the candidate"""
        try:
            concerns = []
            
            # Check for experience gaps
            candidate_experience = candidate.get('experience', [])
            required_years = job_data.get('min_experience_years', 0)
            
            if candidate_experience:
                # Calculate total experience
                total_years = 0
                for exp in candidate_experience:
                    duration = exp.get('duration', '')
                    if isinstance(duration, str):
                        if 'year' in duration.lower():
                            try:
                                years = float(duration.split()[0])
                                total_years += years
                            except (ValueError, IndexError):
                                continue
                        elif 'month' in duration.lower():
                            try:
                                months = float(duration.split()[0])
                                total_years += months / 12
                            except (ValueError, IndexError):
                                continue
                    elif isinstance(duration, (int, float)):
                        total_years += duration
                
                if total_years < required_years:
                    concerns.append(f"Below required experience ({total_years:.1f} years vs {required_years} required)")
                elif total_years > required_years * 2:
                    concerns.append("May be overqualified for the position")
            
            # Check for skill gaps
            candidate_skills = set(skill.lower() for skill in candidate.get('skills', []))
            required_skills = set(skill.lower() for skill in job_data.get('required_skills', []))
            
            if required_skills:
                missing_skills = required_skills - candidate_skills
                if missing_skills:
                    concerns.append(f"Missing key skills: {', '.join(list(missing_skills)[:3])}")
            
            # Check for job hopping (frequent job changes)
            if len(candidate_experience) > 3:
                avg_duration = sum(len(str(exp.get('duration', ''))) for exp in candidate_experience) / len(candidate_experience)
                if avg_duration < 10:  # Short average duration might indicate job hopping
                    concerns.append("Frequent job changes may indicate instability")
            
            # Check for education requirements
            education_level = job_data.get('education_level', '').lower()
            candidate_education = candidate.get('education', [])
            
            if education_level and candidate_education:
                candidate_degrees = [edu.get('degree', '').lower() for edu in candidate_education]
                if education_level in ['bachelor', 'masters', 'phd']:
                    if not any(level in degree for degree in candidate_degrees for level in [education_level, 'bachelor', 'masters', 'phd']):
                        concerns.append(f"May not meet education requirement: {education_level}")
            
            return concerns
            
        except Exception as e:
            logger.error(f"❌ Error identifying concerns: {e}")
            return []
    
    def _generate_recommendations(
        self, 
        semantic_score: float, 
        skills_score: float, 
        experience_score: float
    ) -> str:
        """Generate recommendations based on scores"""
        try:
            if semantic_score > 0.8 and skills_score > 0.7:
                return "Strong candidate match. Consider for immediate interview."
            elif semantic_score > 0.6:
                return "Moderate match. Review additional qualifications before proceeding."
            else:
                return "Limited match. May not be suitable for this position."
        except Exception as e:
            logger.error(f"❌ Error generating recommendations: {e}")
            return "Unable to generate recommendations"
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get the status of the matching engine"""
        return {
            "embedding_model_loaded": self.embedding_model is not None,
            "candidate_service_loaded": self.candidate_service is not None,
            "weights": {
                "semantic": self.semantic_weight,
                "skills": self.skills_weight,
                "experience": self.experience_weight
            }
        }
