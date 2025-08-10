"""
Hiring Analytics model for storing recruitment metrics
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON
from sqlalchemy.sql import func

# Use absolute imports to avoid relative import issues
try:
    from config.database import Base
except ImportError:
    # Fallback for when running as standalone script
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    from config.database import Base


class HiringAnalytics(Base):
    __tablename__ = "hiring_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=True)
    
    # Time period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    period_type = Column(String(50), nullable=False)  # daily, weekly, monthly, quarterly
    
    # Application metrics
    total_applications = Column(Integer, default=0)
    qualified_applications = Column(Integer, default=0)
    shortlisted_candidates = Column(Integer, default=0)
    interviews_scheduled = Column(Integer, default=0)
    offers_made = Column(Integer, default=0)
    offers_accepted = Column(Integer, default=0)
    
    # Time metrics
    avg_time_to_shortlist = Column(Float, nullable=True)  # in hours
    avg_time_to_interview = Column(Float, nullable=True)  # in hours
    avg_time_to_offer = Column(Float, nullable=True)      # in hours
    avg_time_to_hire = Column(Float, nullable=True)       # in hours
    
    # Quality metrics
    avg_candidate_score = Column(Float, nullable=True)
    top_candidate_score = Column(Float, nullable=True)
    candidate_score_distribution = Column(JSON, nullable=True)  # Score ranges and counts
    
    # Source metrics
    application_sources = Column(JSON, nullable=True)  # Source breakdown
    top_performing_sources = Column(JSON, nullable=True)
    
    # Cost metrics
    cost_per_hire = Column(Float, nullable=True)
    advertising_costs = Column(Float, nullable=True)
    recruiter_time_costs = Column(Float, nullable=True)
    
    # AI insights
    ai_recommendations = Column(Text, nullable=True)
    bias_detection_results = Column(JSON, nullable=True)
    skill_gap_analysis = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<HiringAnalytics(company_id={self.company_id}, period={self.period_start} to {self.period_end})>"
