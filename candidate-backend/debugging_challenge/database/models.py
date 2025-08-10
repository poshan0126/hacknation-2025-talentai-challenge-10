from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class ChallengeDB(Base):
    __tablename__ = "challenges"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    buggy_code = Column(Text, nullable=False)
    clean_code = Column(Text)
    language = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    bug_types = Column(JSON, nullable=False)
    expected_bugs = Column(JSON, nullable=False)
    max_score = Column(Integer, default=100)
    time_limit_minutes = Column(Integer, default=30)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    submissions = relationship("SubmissionDB", back_populates="challenge")

class SubmissionDB(Base):
    __tablename__ = "submissions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    candidate_id = Column(String, nullable=False)
    annotated_code = Column(Text, nullable=False)
    identified_bugs = Column(JSON, default=list)
    score = Column(Float, default=0.0)
    accuracy_rate = Column(Float, default=0.0)
    bugs_found = Column(Integer, default=0)
    bugs_missed = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    status = Column(String, default="pending")
    ai_feedback = Column(Text)
    evaluation_details = Column(JSON)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    evaluated_at = Column(DateTime)
    time_taken_seconds = Column(Integer)
    
    challenge = relationship("ChallengeDB", back_populates="submissions")

class CandidateDB(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    anonymous_id = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    email = Column(String, unique=True)
    total_score = Column(Float, default=0.0)
    challenges_completed = Column(Integer, default=0)
    average_accuracy = Column(Float, default=0.0)
    total_bugs_found = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)