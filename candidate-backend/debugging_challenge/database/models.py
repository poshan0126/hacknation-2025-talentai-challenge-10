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
    
    # Remove direct relationship with submissions since they now link through user_challenges

class SubmissionDB(Base):
    __tablename__ = "submissions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_challenge_id = Column(String, ForeignKey("user_challenges.id"), nullable=False)
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=False)
    user_id = Column(String, nullable=False)  # Store user_id for quick access
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
    
    # Relationships
    user_challenge = relationship("UserChallengeDB", back_populates="submissions")
    candidate = relationship("CandidateDB", back_populates="submissions")

class CandidateDB(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, unique=True, nullable=False)  # Format: initials + alphanumeric
    anonymous_id = Column(String, unique=True, nullable=False)  # Same as user_id for now
    first_name = Column(String, nullable=False)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    email = Column(String, unique=True)
    
    # Resume data fields
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    professional_title = Column(String, nullable=True)
    resume_summary = Column(Text, nullable=True)
    education = Column(JSON, nullable=True)  # List of education entries
    experience = Column(JSON, nullable=True)  # List of experience entries
    skills = Column(JSON, nullable=True)  # Dict of skill categories
    resume_parsed_at = Column(DateTime, nullable=True)
    resume_file_name = Column(String, nullable=True)
    
    # Challenge statistics
    total_score = Column(Float, default=0.0)
    challenges_completed = Column(Integer, default=0)
    challenges_attempted = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    highest_score = Column(Float, default=0.0)
    total_bugs_found = Column(Integer, default=0)
    total_bugs_missed = Column(Integer, default=0)
    average_time_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    submissions = relationship("SubmissionDB", back_populates="candidate", order_by="desc(SubmissionDB.submitted_at)")
    user_challenges = relationship("UserChallengeDB", back_populates="candidate", order_by="desc(UserChallengeDB.created_at)")

class UserChallengeDB(Base):
    __tablename__ = "user_challenges"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=False)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=True)  # Null for dynamically generated
    user_id = Column(String, nullable=False)  # User's unique ID
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    buggy_code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    expected_bugs = Column(JSON, nullable=False)
    max_score = Column(Integer, default=100)
    time_limit_minutes = Column(Integer, default=30)
    
    # User's performance on this challenge
    best_score = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    time_spent_seconds = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_attempted = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    candidate = relationship("CandidateDB", back_populates="user_challenges")
    challenge = relationship("ChallengeDB")
    submissions = relationship("SubmissionDB", back_populates="user_challenge", order_by="desc(SubmissionDB.submitted_at)")