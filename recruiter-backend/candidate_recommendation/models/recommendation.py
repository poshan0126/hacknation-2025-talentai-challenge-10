from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import uuid

class JobPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"
    URGENT = "urgent"

class JobStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    FILLED = "filled"
    CLOSED = "closed"

class JobDescription(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., description="Job title")
    company: str = Field(..., description="Company name")
    description: str = Field(..., description="Job description")
    requirements: List[str] = Field(default_factory=list, description="Required skills/qualifications")
    preferred_skills: List[str] = Field(default_factory=list, description="Preferred skills")
    location: Optional[str] = Field(None, description="Job location")
    salary_range: Optional[Dict[str, Any]] = Field(None, description="Salary range info")
    priority: JobPriority = Field(default=JobPriority.MEDIUM)
    status: JobStatus = Field(default=JobStatus.DRAFT)

class CandidateMatch(BaseModel):
    candidate_id: Optional[str] = Field(None, description="Anonymous candidate ID")
    name: Optional[str] = Field(None, description="Candidate name (anonymized)")
    filename: Optional[str] = Field(None, description="Source file reference")
    title: Optional[str] = Field(None, description="Current/desired role")
    match_score: float = Field(..., ge=0.0, le=1.0, description="Overall match score")
    skills_match: List[str] = Field(default_factory=list, description="Matching skills")
    skills_gap: List[str] = Field(default_factory=list, description="Missing skills")
    summary: Optional[str] = Field(None, description="Candidate summary")
    experience_years: Optional[int] = Field(None, description="Years of experience")
    location: Optional[str] = Field(None, description="Candidate location")

class RecommendationRequest(BaseModel):
    job: JobDescription
    top_n: int = Field(default=10, ge=1, le=50, description="Number of top candidates to return")
    include_summary: bool = Field(default=True, description="Include detailed summaries")
    
class RecommendationResponse(BaseModel):
    job_id: str
    candidates: List[CandidateMatch]
    total_candidates_searched: int
    search_metadata: Dict[str, Any] = Field(default_factory=dict)

class SearchFilters(BaseModel):
    min_experience: Optional[int] = Field(None, ge=0)
    max_experience: Optional[int] = Field(None, le=50)
    required_skills: List[str] = Field(default_factory=list)
    location: Optional[str] = Field(None)
    availability: Optional[str] = Field(None)

class AdvancedRecommendationRequest(BaseModel):
    job: JobDescription  
    filters: SearchFilters = Field(default_factory=SearchFilters)
    top_n: int = Field(default=10, ge=1, le=50)
    include_summary: bool = Field(default=True)
    boost_skills: List[str] = Field(default_factory=list, description="Skills to boost in scoring")
    penalty_skills: List[str] = Field(default_factory=list, description="Skills that reduce score")