from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class SubmissionStatus(str, Enum):
    PENDING = "pending"
    EVALUATING = "evaluating"
    COMPLETED = "completed"
    FAILED = "failed"

class BugIdentification(BaseModel):
    line_number: int
    comment: str
    bug_type_identified: Optional[str] = None
    is_correct: Optional[bool] = None
    feedback: Optional[str] = None

class SubmissionCreate(BaseModel):
    challenge_id: str
    annotated_code: Optional[str] = None  # For old format
    bug_analysis: Optional[str] = None    # For new plain text analysis format
    candidate_id: Optional[str] = None
    expected_bugs: Optional[List[Dict]] = None  # Pass expected bugs for grading

class Submission(BaseModel):
    id: Optional[str] = None
    challenge_id: str
    candidate_id: str
    annotated_code: str
    identified_bugs: List[BugIdentification] = []
    score: float = 0.0
    accuracy_rate: float = 0.0
    bugs_found: int = 0
    bugs_missed: int = 0
    false_positives: int = 0
    status: SubmissionStatus = SubmissionStatus.PENDING
    ai_feedback: Optional[str] = None
    evaluation_details: Optional[Dict] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    evaluated_at: Optional[datetime] = None
    time_taken_seconds: Optional[int] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SubmissionResponse(BaseModel):
    id: str
    challenge_id: str
    score: float
    accuracy_rate: float
    bugs_found: int
    bugs_missed: int
    false_positives: int
    status: SubmissionStatus
    ai_feedback: Optional[str]
    submitted_at: datetime
    
class DetailedSubmissionResponse(SubmissionResponse):
    identified_bugs: List[BugIdentification]
    evaluation_details: Optional[Dict]

class LeaderboardEntry(BaseModel):
    rank: int
    candidate_id: str
    display_name: str
    total_score: float
    challenges_completed: int
    average_accuracy: float
    total_bugs_found: int
    last_submission: datetime
    
class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total_participants: int
    your_rank: Optional[int] = None