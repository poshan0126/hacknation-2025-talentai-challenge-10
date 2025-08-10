from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from ..database.connection import get_db
from ..database.models import ChallengeDB
from ..models.challenge import (
    Challenge, ChallengeCreate, ChallengeResponse, 
    ChallengeListResponse, DifficultyLevel, ProgrammingLanguage, BugType, Bug
)
from ..services.ai_generator import BugGenerator
import random
from pydantic import BaseModel

router = APIRouter(prefix="/api/challenges", tags=["challenges"])

@router.get("/", response_model=ChallengeListResponse)
async def get_challenges(
    difficulty: Optional[DifficultyLevel] = None,
    language: Optional[ProgrammingLanguage] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(ChallengeDB)
    
    if difficulty:
        query = query.filter(ChallengeDB.difficulty == difficulty.value)
    if language:
        query = query.filter(ChallengeDB.language == language.value)
    
    total = query.count()
    challenges = query.offset(skip).limit(limit).all()
    
    challenge_responses = []
    for ch in challenges:
        challenge_responses.append(ChallengeResponse(
            id=ch.id,
            title=ch.title,
            description=ch.description,
            buggy_code=ch.buggy_code,
            language=ch.language,
            difficulty=ch.difficulty,
            max_score=ch.max_score,
            time_limit_minutes=ch.time_limit_minutes,
            tags=ch.tags or [],
            expected_bugs=[]  # Don't expose expected bugs
        ))
    
    return ChallengeListResponse(
        challenges=challenge_responses,
        total=total
    )

@router.get("/{challenge_id}", response_model=ChallengeResponse)
async def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    challenge = db.query(ChallengeDB).filter(ChallengeDB.id == challenge_id).first()
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    return ChallengeResponse(
        id=challenge.id,
        title=challenge.title,
        description=challenge.description,
        buggy_code=challenge.buggy_code,
        language=challenge.language,
        difficulty=challenge.difficulty,
        max_score=challenge.max_score,
        time_limit_minutes=challenge.time_limit_minutes,
        tags=challenge.tags or [],
        expected_bugs=[]  # Don't expose expected bugs
    )

@router.post("/generate", response_model=ChallengeResponse)
async def generate_challenge(
    challenge_data: ChallengeCreate,
    db: Session = Depends(get_db)
):
    generator = BugGenerator()
    
    try:
        buggy_code, bugs = generator.generate_bugs(
            clean_code=challenge_data.clean_code,
            language=challenge_data.language.value,
            difficulty=challenge_data.difficulty,
            num_bugs=challenge_data.num_bugs,
            bug_types=challenge_data.bug_types
        )
        # Ensure at least one expected bug (or explicit no-bugs sentinel)
        if not bugs:
            # Create an explicit no-bugs sentinel so evaluation never fails
            bugs = [
                Bug(
                    line_number=0,
                    bug_type=BugType.LOGIC_ERROR,
                    description="No bugs found - this code is correct",
                    hint="This is a trick: there are no bugs."
                )
            ]
        
        bugs_dict = [bug.dict() for bug in bugs]
        
        challenge = ChallengeDB(
            title=challenge_data.title,
            description=challenge_data.description,
            buggy_code=buggy_code,
            clean_code=challenge_data.clean_code,
            language=challenge_data.language.value,
            difficulty=challenge_data.difficulty.value,
            bug_types=[bt.value for bt in challenge_data.bug_types],
            expected_bugs=bugs_dict,
            tags=challenge_data.tags
        )
        
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        
        return ChallengeResponse(
            id=challenge.id,
            title=challenge.title,
            description=challenge.description,
            buggy_code=challenge.buggy_code,
            language=challenge.language,
            difficulty=challenge.difficulty,
            max_score=challenge.max_score,
            time_limit_minutes=challenge.time_limit_minutes,
            tags=challenge.tags or [],
            expected_bugs=[]  # Don't expose expected bugs
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate challenge: {str(e)}")

@router.get("/{challenge_id}/hints")
async def get_hints(challenge_id: str, db: Session = Depends(get_db)):
    challenge = db.query(ChallengeDB).filter(ChallengeDB.id == challenge_id).first()
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    hints = []
    for bug in challenge.expected_bugs:
        if bug.get("hint"):
            hints.append({
                "line_range": f"Around line {bug['line_number']}",
                "hint": bug["hint"]
            })
    
    return {"hints": hints[:2]}

# REMOVED: No static code templates - everything must be AI-generated dynamically

class RandomChallengeRequest(BaseModel):
    difficulty: Optional[DifficultyLevel] = DifficultyLevel.EASY
    language: Optional[ProgrammingLanguage] = ProgrammingLanguage.PYTHON


@router.post("/take-challenge", response_model=ChallengeResponse)
async def take_random_challenge(
    request: Optional[RandomChallengeRequest] = None,
    difficulty: Optional[DifficultyLevel] = DifficultyLevel.EASY,
    language: Optional[ProgrammingLanguage] = ProgrammingLanguage.PYTHON,
):
    """Generate a random challenge dynamically"""
    
    generator = BugGenerator()
    
    try:
        selected_difficulty = (request.difficulty if request else None) or difficulty or DifficultyLevel.EASY
        selected_language = (request.language if request else None) or language or ProgrammingLanguage.PYTHON
        
        # Select random bug types based on difficulty
        all_bug_types = list(BugType)
        if selected_difficulty == DifficultyLevel.EASY:
            possible_bug_types = [BugType.LOGIC_ERROR, BugType.OFF_BY_ONE, BugType.SYNTAX_ERROR]
        elif selected_difficulty == DifficultyLevel.MEDIUM:
            possible_bug_types = [BugType.LOGIC_ERROR, BugType.RUNTIME_ERROR, BugType.TYPE_ERROR, BugType.OFF_BY_ONE]
        else:  # HARD
            possible_bug_types = all_bug_types
        
        # Randomly select 2-4 bug types
        num_bugs = random.randint(2, min(4, len(possible_bug_types)))
        selected_bug_types = random.sample(possible_bug_types, min(num_bugs, len(possible_bug_types)))
        
        # Generate buggy code directly (agent will create both code and bugs)
        print(f"Generating buggy code with {num_bugs} bugs...")
        
        buggy_code, bugs = generator.generate_bugs(
            clean_code=None,  # Let agent generate its own code
            language=selected_language.value.lower(),
            difficulty=selected_difficulty,
            num_bugs=num_bugs,
            bug_types=selected_bug_types
        )

        # Guarantee at least one expected bug (or explicit no-bugs sentinel)
        if not bugs:
            # Bug and BugType are already imported at the top
            bugs = [
                Bug(
                    line_number=0,
                    bug_type=BugType.LOGIC_ERROR,
                    description="No bugs found - this code is correct",
                    hint="This is a trick: there are no bugs."
                )
            ]
        
        print(f"Bug generation result: {len(bugs)} bugs created")
        for i, bug in enumerate(bugs):
            print(f"  Bug {i+1}: Line {bug.line_number} - {bug.description}")
        
        # Create challenge title based on content
        code_type = "Algorithm" if "binary_search" in buggy_code or "find_maximum" in buggy_code else \
                   "Function" if "function" in buggy_code or "def " in buggy_code else "Code"
        
        challenge_title = f"{selected_difficulty.value.title()} {selected_language.value} {code_type} Debugging"
        challenge_description = f"Find and identify all bugs in this {selected_language.value.lower()} code. Analyze the code carefully and describe each bug you find."
        
        # Store bugs info for grading (in a real app, you'd store this in session/cache)
        bugs_dict = [bug.dict() for bug in bugs]
        
        # Return challenge without storing in database (dynamic generation)
        return ChallengeResponse(
            id=f"random-{random.randint(1000, 9999)}",
            title=challenge_title,
            description=challenge_description,
            buggy_code=buggy_code,
            language=selected_language.value,
            difficulty=selected_difficulty.value,
            max_score=100,
            time_limit_minutes=30,
            tags=[f"{selected_difficulty.value}", f"{selected_language.value}", "random-challenge"],
            expected_bugs=bugs_dict  # Include for grading
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate random challenge: {str(e)}")