import asyncio
import aiohttp
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os

logger = logging.getLogger(__name__)

class CandidateProfile(BaseModel):
    user_id: str
    display_name: str
    email: str
    skills: Optional[Dict[str, Any]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None
    statistics: Optional[Dict[str, Any]] = None

class CandidateBackendClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("CANDIDATE_BACKEND_URL", "http://localhost:8001")
        self.timeout = aiohttp.ClientTimeout(total=30)
        
    async def get_all_candidates(self) -> List[CandidateProfile]:
        """Fetch all candidates from the debugging challenge users API."""
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            try:
                # Get all users from the debugging challenge API
                async with session.get(f"{self.base_url}/debug/api/users/all") as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch users: {response.status}")
                        return []
                    
                    users_data = await response.json()
                    logger.info(f"Fetched {len(users_data)} users from candidate backend")
                    
                    candidates = []
                    for user in users_data:
                        # Get detailed profile for each user
                        detailed_profile = await self._get_user_profile(session, user["user_id"])
                        if detailed_profile:
                            candidates.append(detailed_profile)
                    
                    return candidates
                    
            except Exception as e:
                logger.error(f"Error fetching candidates: {e}")
                return []

    async def _get_user_profile(self, session: aiohttp.ClientSession, user_id: str) -> Optional[CandidateProfile]:
        """Get detailed user profile including skills and resume data."""
        try:
            # Get user profile
            async with session.get(f"{self.base_url}/debug/api/users/{user_id}/profile") as response:
                if response.status != 200:
                    logger.warning(f"Could not fetch profile for user {user_id}: {response.status}")
                    return None
                
                profile_data = await response.json()
                
                # Try to get resume data if available
                resume_data = await self._get_user_resume_data(session, user_id)
                
                # Extract skills from resume data or create mock skills based on user activity
                skills = self._extract_skills_from_data(profile_data, resume_data)
                
                return CandidateProfile(
                    user_id=user_id,
                    display_name=profile_data.get("display_name", ""),
                    email=profile_data.get("email", ""),
                    title=self._infer_title_from_data(profile_data, resume_data),
                    summary=self._generate_summary_from_data(profile_data, resume_data),
                    skills=skills,
                    resume_data=resume_data,
                    statistics=profile_data.get("statistics", {})
                )
                
        except Exception as e:
            logger.error(f"Error fetching profile for user {user_id}: {e}")
            return None

    async def _get_user_resume_data(self, session: aiohttp.ClientSession, user_id: str) -> Optional[Dict[str, Any]]:
        """Try to get resume data for a user from the resume parser service."""
        try:
            # This is a fallback - in a real scenario, you'd have a user-resume mapping
            # For now, we'll return None and rely on challenge data
            return None
        except Exception as e:
            logger.debug(f"No resume data found for user {user_id}: {e}")
            return None

    def _extract_skills_from_data(self, profile_data: Dict[str, Any], resume_data: Optional[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Extract or infer skills from available data."""
        skills = {"technical": [], "programming": [], "general": []}
        
        # If we have resume data, extract skills from there
        if resume_data and "skills" in resume_data:
            resume_skills = resume_data["skills"]
            if isinstance(resume_skills, dict):
                for category, skill_list in resume_skills.items():
                    if isinstance(skill_list, list):
                        skills[category.lower()] = skill_list
            elif isinstance(resume_skills, list):
                skills["technical"] = resume_skills
        
        # Infer skills from challenge statistics (debugging implies programming skills)
        stats = profile_data.get("statistics", {})
        challenges_completed = stats.get("challenges_completed", 0)
        
        if challenges_completed > 0:
            # Infer programming skills based on challenge activity
            inferred_skills = []
            
            # High completion rate suggests strong debugging skills
            if challenges_completed >= 5:
                inferred_skills.extend(["Debugging", "Problem Solving", "Code Analysis"])
            
            # Add general programming skills
            if challenges_completed >= 3:
                inferred_skills.extend(["Python", "JavaScript", "Programming"])
            
            # Merge with existing skills
            if not skills["programming"]:
                skills["programming"] = inferred_skills
            else:
                skills["programming"].extend(inferred_skills)
                skills["programming"] = list(set(skills["programming"]))  # Remove duplicates
        
        # Ensure we have some default skills
        if not any(skills.values()):
            skills["general"] = ["Software Development", "Programming", "Problem Solving"]
        
        return skills

    def _infer_title_from_data(self, profile_data: Dict[str, Any], resume_data: Optional[Dict[str, Any]]) -> str:
        """Infer job title from available data."""
        
        # First check resume data
        if resume_data and "title" in resume_data:
            return resume_data["title"]
        
        # Infer from challenge performance
        stats = profile_data.get("statistics", {})
        challenges_completed = stats.get("challenges_completed", 0)
        avg_score = stats.get("average_score", 0)
        
        if challenges_completed >= 10 and avg_score >= 80:
            return "Senior Software Engineer"
        elif challenges_completed >= 5 and avg_score >= 70:
            return "Software Engineer" 
        elif challenges_completed >= 3:
            return "Junior Software Developer"
        else:
            return "Software Developer"

    def _generate_summary_from_data(self, profile_data: Dict[str, Any], resume_data: Optional[Dict[str, Any]]) -> str:
        """Generate a professional summary from available data."""
        
        # Use resume summary if available
        if resume_data and "summary" in resume_data:
            return resume_data["summary"]
        
        # Generate summary from challenge statistics
        display_name = profile_data.get("display_name", "Candidate")
        stats = profile_data.get("statistics", {})
        challenges_completed = stats.get("challenges_completed", 0)
        avg_score = stats.get("average_score", 0)
        total_bugs_found = stats.get("total_bugs_found", 0)
        
        if challenges_completed > 0:
            summary_parts = [
                f"Experienced developer with strong problem-solving skills.",
                f"Completed {challenges_completed} debugging challenges",
                f"with an average score of {avg_score:.0f}%."
            ]
            
            if total_bugs_found > 0:
                summary_parts.append(f"Successfully identified {total_bugs_found} bugs across various challenges.")
            
            summary_parts.append("Demonstrated ability to analyze code and identify issues efficiently.")
            
            return " ".join(summary_parts)
        else:
            return f"Software developer with interest in debugging and code quality. Active participant in coding challenges."

# Global client instance
_client_instance = None

def get_candidate_client() -> CandidateBackendClient:
    """Get singleton candidate backend client."""
    global _client_instance
    if _client_instance is None:
        _client_instance = CandidateBackendClient()
    return _client_instance