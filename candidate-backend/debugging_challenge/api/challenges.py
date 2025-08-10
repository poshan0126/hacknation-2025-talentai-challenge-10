from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

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

class TakeChallengeRequest(BaseModel):
    user_id: str

@router.post("/take-challenge", response_model=ChallengeResponse)
async def take_challenge(
    request: TakeChallengeRequest,
    db: Session = Depends(get_db)
):
    """Generate a new challenge dynamically for a specific user based on their skills"""
    from ..services.user_service import UserService
    from ..database.models import UserChallengeDB
    
    # Verify user exists
    user = UserService.get_user_by_id(db, request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")
    
    # Get user's skills if available
    user_skills = user.skills if user.skills else {}
    
    # Let AI decide language and difficulty based on skills
    generator = BugGenerator()
    
    # If user has skills, let AI analyze them
    if user_skills:
        challenge_spec = generator.analyze_skills_for_challenge(user_skills)
        language = challenge_spec.get("language", ProgrammingLanguage.PYTHON.value)
        difficulty = DifficultyLevel(challenge_spec.get("difficulty", "medium"))
        num_bugs = challenge_spec.get("num_bugs", 3)
        selected_bug_types = challenge_spec.get("bug_types", [BugType.LOGIC_ERROR, BugType.SYNTAX_ERROR])
    else:
        # Default behavior for users without skills data
        difficulty = random.choice(list(DifficultyLevel))
        num_bugs = random.randint(2, 4) if difficulty != DifficultyLevel.EASY else random.randint(1, 2)
        available_bug_types = list(BugType)
        selected_bug_types = random.sample(available_bug_types, min(num_bugs, len(available_bug_types)))
        language = ProgrammingLanguage.PYTHON.value
    
    try:
        # Generate challenge with AI-determined parameters
        buggy_code, bugs = generator.generate_bugs(
            clean_code=None,  # Let AI generate code from scratch
            language=language,
            difficulty=difficulty,
            num_bugs=num_bugs,
            bug_types=selected_bug_types,
            user_skills=user_skills  # Pass skills to generator
        )
        
        # Create challenge object
        title = f"Debug Challenge - {difficulty.value.title()}"
        description = f"Find and fix {num_bugs} bugs in this {difficulty.value} level challenge"
        
        # Save expected bugs
        expected_bugs_json = [
            {
                "line_number": bug.line_number,
                "bug_type": bug.bug_type.value,
                "description": bug.description,
                "hint": bug.hint
            }
            for bug in bugs
        ]
        
        # Create user-specific challenge record
        user_challenge = UserChallengeDB(
            candidate_id=user.id,
            user_id=request.user_id,
            title=title,
            description=description,
            buggy_code=buggy_code,
            language=language,  # Use AI-determined language
            difficulty=difficulty.value,
            expected_bugs=expected_bugs_json,
            max_score=100,
            time_limit_minutes=30
        )
        db.add(user_challenge)
        db.commit()
        db.refresh(user_challenge)
        
        # Update user's attempted challenges count
        user.challenges_attempted = (user.challenges_attempted or 0) + 1
        user.last_active = datetime.utcnow()
        db.commit()
        
        return ChallengeResponse(
            id=user_challenge.id,
            title=user_challenge.title,
            description=user_challenge.description,
            buggy_code=user_challenge.buggy_code,
            language=user_challenge.language,
            difficulty=user_challenge.difficulty,
            max_score=user_challenge.max_score,
            time_limit_minutes=user_challenge.time_limit_minutes,
            tags=["generated", "dynamic", f"user:{request.user_id}"],
            expected_bugs=[]  # Don't expose expected bugs to frontend
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate challenge: {str(e)}")

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