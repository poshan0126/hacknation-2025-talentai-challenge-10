from sqlalchemy import Column, Integer, String, Text, JSON, Float, DateTime, Boolean
from sqlalchemy.sql import func
from .connection import Base
import uuid

class JobDB(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True) 
    description = Column(Text)
    requirements = Column(JSON)
    preferred_skills = Column(JSON)
    location = Column(String)
    salary_range = Column(JSON)
    priority = Column(String, default="medium")
    status = Column(String, default="draft", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String)

class CandidateDB(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    anonymous_id = Column(String, unique=True, index=True)
    name_hash = Column(String)  # For anonymization
    title = Column(String)
    skills = Column(JSON)
    experience_years = Column(Integer)
    location = Column(String)
    summary = Column(Text)
    source_file = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)

class RecommendationHistoryDB(Base):
    __tablename__ = "recommendation_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, nullable=False, index=True)
    search_query = Column(JSON)
    results = Column(JSON)
    total_candidates = Column(Integer)
    search_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String)