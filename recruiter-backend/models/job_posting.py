"""
Job Posting model for storing job information
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
    sys.path.append(str(Path(__file__).parent.parent))
    from config.database import Base


class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Job details
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    preferred_skills = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    
    # Job metadata
    job_type = Column(String(50), nullable=True)  # Full-time, Part-time, Contract, Internship
    experience_level = Column(String(50), nullable=True)  # Entry, Mid, Senior, Lead
    location_type = Column(String(50), nullable=True)  # On-site, Remote, Hybrid
    
    # Location and salary
    location = Column(String(255), nullable=True)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(10), default="USD")
    
    # Requirements
    min_experience_years = Column(Integer, nullable=True)
    education_level = Column(String(100), nullable=True)
    
    # Skills and requirements (structured)
    required_skills = Column(JSON, nullable=True)  # List of skills
    nice_to_have_skills = Column(JSON, nullable=True)  # List of skills
    certifications = Column(JSON, nullable=True)  # List of certifications
    
    # Status and visibility
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_urgent = Column(Boolean, default=False)
    
    # Application details
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    max_applications = Column(Integer, nullable=True)
    current_applications = Column(Integer, default=0)
    
    # AI-generated metadata
    ai_summary = Column(Text, nullable=True)
    skill_embeddings = Column(JSON, nullable=True)  # Vector embeddings for skills
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="job_postings")
    candidate_matches = relationship("CandidateMatch", back_populates="job_posting")
    
    def __repr__(self):
        return f"<JobPosting(title='{self.title}', company_id={self.company_id})>"
