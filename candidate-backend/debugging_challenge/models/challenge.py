from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class ProgrammingLanguage(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    CPP = "cpp"

class BugType(str, Enum):
    SYNTAX_ERROR = "syntax_error"
    LOGIC_ERROR = "logic_error"
    RUNTIME_ERROR = "runtime_error"
    TYPE_ERROR = "type_error"
    NULL_POINTER = "null_pointer"
    OFF_BY_ONE = "off_by_one"
    INFINITE_LOOP = "infinite_loop"
    MEMORY_LEAK = "memory_leak"
    RACE_CONDITION = "race_condition"
    SECURITY_VULNERABILITY = "security_vulnerability"

class Bug(BaseModel):
    line_number: int
    bug_type: BugType
    description: str
    hint: Optional[str] = None

class Challenge(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    buggy_code: str
    clean_code: Optional[str] = None
    language: ProgrammingLanguage
    difficulty: DifficultyLevel
    bug_types: List[BugType]
    expected_bugs: List[Bug]
    max_score: int = 100
    time_limit_minutes: int = 30
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    tags: List[str] = []
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChallengeCreate(BaseModel):
    title: str
    description: str
    clean_code: str
    language: ProgrammingLanguage
    difficulty: DifficultyLevel
    bug_types: List[BugType]
    num_bugs: int = Field(ge=1, le=10)
    tags: List[str] = []

class ChallengeResponse(BaseModel):
    id: str
    title: str
    description: str
    buggy_code: str
    language: ProgrammingLanguage
    difficulty: DifficultyLevel
    max_score: int
    time_limit_minutes: int
    tags: List[str]
    expected_bugs: Optional[List[Dict]] = []
    
class ChallengeListResponse(BaseModel):
    challenges: List[ChallengeResponse]
    total: int