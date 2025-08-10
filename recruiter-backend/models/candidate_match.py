"""
Candidate Match model for storing matching results
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

# Use absolute imports to avoid relative import issues
try:
    from config.database import Base
except ImportError:
    # Fallback for when running as standalone script
    import sys
    from pathlib import Path
    
    # Get the recruiter-backend directory (parent of models)
    backend_dir = Path(__file__).parent.parent
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    try:
        from config.database import Base
    except ImportError:
        # If still failing, try adding the parent directory
        parent_dir = backend_dir.parent
        if str(parent_dir) not in sys.path:
            sys.path.insert(0, str(parent_dir))
        from config.database import Base


class CandidateMatch(Base):
    __tablename__ = "candidate_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False)
    candidate_id = Column(String(255), nullable=False, index=True)  # External candidate ID
    
    # Candidate information
    candidate_name = Column(String(255), nullable=True)
    candidate_email = Column(String(255), nullable=True)
    candidate_summary = Column(Text, nullable=True)
    
    # Matching scores
    overall_score = Column(Float, nullable=False, index=True)
    semantic_score = Column(Float, nullable=True)  # AI semantic similarity
    skills_score = Column(Float, nullable=True)    # Skills overlap
    experience_score = Column(Float, nullable=True) # Experience relevance
    title_score = Column(Float, nullable=True)     # Title alignment
    
    # Detailed scoring breakdown
    score_breakdown = Column(JSON, nullable=True)  # Detailed scoring components
    
    # Candidate skills and experience
    candidate_skills = Column(JSON, nullable=True)  # List of skills
    candidate_experience = Column(JSON, nullable=True)  # Experience details
    candidate_education = Column(JSON, nullable=True)   # Education details
    
    # AI-generated insights
    ai_analysis = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)  # List of candidate strengths
    concerns = Column(JSON, nullable=True)   # List of potential concerns
    recommendations = Column(Text, nullable=True)
    
    # Match status
    status = Column(String(50), default="pending")  # pending, reviewed, shortlisted, rejected
    is_shortlisted = Column(Boolean, default=False)
    is_rejected = Column(Boolean, default=False)
    
    # Recruiter actions
    recruiter_notes = Column(Text, nullable=True)
    interview_scheduled = Column(DateTime(timezone=True), nullable=True)
    feedback = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    job_posting = relationship("JobPosting", back_populates="candidate_matches")
    
    def __repr__(self):
        return f"<CandidateMatch(job_id={self.job_posting_id}, candidate_id={self.candidate_id}, score={self.overall_score})>"
