from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime
import uuid

from ..database.connection import get_db
from ..database.models import SubmissionDB, ChallengeDB, CandidateDB, UserChallengeDB
from ..models.submission import (
    SubmissionCreate, SubmissionResponse, DetailedSubmissionResponse,
    SubmissionStatus, LeaderboardResponse, LeaderboardEntry
)
from ..models.challenge import Bug
from ..services.ai_evaluator import CommentEvaluator

router = APIRouter(prefix="/api/submissions", tags=["submissions"])

async def evaluate_submission_background(submission_id: str, expected_bugs_data: List[Dict] = None):
    # Create new database session for background task
    from ..database.connection import SessionLocal
    db_session = SessionLocal()
    
    print(f"Background task started for submission {submission_id}")
    print(f"Expected bugs data received: {expected_bugs_data}")
    
    try:
        submission = db_session.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()
        
        if not submission:
            print(f"No submission found for ID: {submission_id}")
            return
            
        # Get the user challenge that this submission belongs to
        user_challenge = db_session.query(UserChallengeDB).filter(
            UserChallengeDB.id == submission.user_challenge_id
        ).first()
        
        if not user_challenge:
            print(f"No user challenge found for submission {submission_id}")
            return
        
        # For stored challenges, get the original challenge
        challenge = None
        if user_challenge.challenge_id:
            challenge = db_session.query(ChallengeDB).filter(
                ChallengeDB.id == user_challenge.challenge_id
            ).first()
        
        print(f"Found submission for user challenge: {user_challenge.id}")
        print(f"Original challenge found: {challenge is not None}")
        
        submission.status = SubmissionStatus.EVALUATING.value
        db_session.commit()
        
        evaluator = CommentEvaluator()
        
        # Use expected bugs from user challenge
        if user_challenge.expected_bugs:
            print(f"Using user challenge expected bugs: {len(user_challenge.expected_bugs)} bugs")
            expected_bugs = [Bug(**bug_data) for bug_data in user_challenge.expected_bugs]
            language = user_challenge.language
        elif expected_bugs_data:
            print(f"Using provided expected bugs: {len(expected_bugs_data)} bugs")
            expected_bugs = [Bug(**bug_data) for bug_data in expected_bugs_data]
            language = "python"  # Default for random challenges
        elif challenge and challenge.expected_bugs:
            print(f"Using original challenge expected bugs: {len(challenge.expected_bugs)} bugs")
            expected_bugs = [Bug(**bug_data) for bug_data in challenge.expected_bugs]
            language = challenge.language
        else:
            print(f"Error: No expected bugs found for submission {submission_id}")
            # As a safety net, treat it as a no-bugs trick challenge
            from ..models.challenge import BugType
            expected_bugs = [Bug(line_number=0, bug_type=BugType.LOGIC_ERROR, description="No bugs found - this code is correct")]
            language = "python"
        
        # Use annotated_code field which contains the plain text analysis
        candidate_analysis = submission.annotated_code
        
        print(f"Evaluating submission {submission_id} with analysis: {candidate_analysis[:100]}...")
        
        evaluation_result = evaluator.evaluate_submission(
            candidate_analysis=candidate_analysis,
            expected_bugs=expected_bugs,
            language=language,
            buggy_code=""  # Not needed for evaluation
        )
        
        print(f"Evaluation result for {submission_id}: {evaluation_result}")
        
        submission.identified_bugs = [bug.dict() for bug in evaluation_result["identified_bugs"]]
        submission.score = evaluation_result["score"]
        submission.accuracy_rate = evaluation_result["accuracy_rate"]
        submission.bugs_found = evaluation_result["bugs_found"]
        submission.bugs_missed = evaluation_result["bugs_missed"]
        submission.false_positives = evaluation_result["false_positives"]
        submission.ai_feedback = evaluation_result["ai_feedback"]
        submission.evaluation_details = evaluation_result["evaluation_details"]
        
        # Store actual bugs for reference
        if "actual_bugs" not in submission.evaluation_details:
            submission.evaluation_details["actual_bugs"] = evaluation_result.get("actual_bugs", [])
        submission.status = SubmissionStatus.COMPLETED.value
        submission.evaluated_at = datetime.utcnow()
        
        # Update user challenge statistics
        user_challenge.attempts += 1
        if submission.score > user_challenge.best_score:
            user_challenge.best_score = submission.score
        # Mark as completed after first attempt (can retry for better score)
        if user_challenge.attempts >= 1:
            user_challenge.completed = True
            if not user_challenge.completed_at:
                user_challenge.completed_at = datetime.utcnow()
        user_challenge.last_attempted = datetime.utcnow()
        
        # Update candidate statistics
        candidate = db_session.query(CandidateDB).filter(
            CandidateDB.id == submission.candidate_id
        ).first()
        
        if candidate:
            # Update candidate statistics
            candidate.total_bugs_found += submission.bugs_found
            candidate.total_bugs_missed += submission.bugs_missed
            
            # Recalculate statistics based on all user challenges
            all_challenges = db_session.query(UserChallengeDB).filter(
                UserChallengeDB.candidate_id == candidate.id
            ).all()
            
            completed_challenges = [c for c in all_challenges if c.completed]
            attempted_challenges = [c for c in all_challenges if c.attempts > 0]
            
            candidate.challenges_completed = len(completed_challenges)
            candidate.challenges_attempted = len(attempted_challenges)
            
            if attempted_challenges:
                total_score = sum(c.best_score for c in attempted_challenges)
                candidate.total_score = total_score
                candidate.average_score = total_score / len(attempted_challenges)
                
                if all_challenges[0].attempts > 0:  # Update highest score if needed
                    highest = max(c.best_score for c in attempted_challenges)
                    if highest > candidate.highest_score:
                        candidate.highest_score = highest
            
            candidate.last_active = datetime.utcnow()
        
        db_session.commit()
        print(f"Submission {submission_id} evaluation completed successfully")
        
    except Exception as e:
        print(f"Error evaluating submission {submission_id}: {str(e)}")
        try:
            # Mark submission as failed if there's an error
            submission = db_session.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()
            if submission:
                submission.status = SubmissionStatus.COMPLETED.value  # Still mark as completed to avoid infinite polling
                submission.score = 0
                submission.ai_feedback = f"Evaluation failed: {str(e)}"
                db_session.commit()
        except Exception as inner_e:
            print(f"Failed to update submission status: {str(inner_e)}")
            pass
    finally:
        db_session.close()

@router.post("/", response_model=SubmissionResponse)
async def submit_solution(
    submission: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Get the candidate by user_id
    candidate = db.query(CandidateDB).filter(
        CandidateDB.user_id == submission.user_id
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail=f"User {submission.user_id} not found")
    
    # Find the user's challenge for this challenge_id
    user_challenge = db.query(UserChallengeDB).filter(
        UserChallengeDB.id == submission.challenge_id,
        UserChallengeDB.user_id == submission.user_id
    ).first()
    
    if not user_challenge:
        raise HTTPException(status_code=404, detail="Challenge not found for this user")
    
    # Use analysis field from frontend
    analysis_text = submission.analysis or submission.bug_analysis or submission.annotated_code
    
    if not analysis_text:
        raise HTTPException(status_code=400, detail="No analysis provided")
    
    # Create submission linked to user challenge
    db_submission = SubmissionDB(
        user_challenge_id=user_challenge.id,
        candidate_id=candidate.id,
        user_id=submission.user_id,
        annotated_code=analysis_text,
        status=SubmissionStatus.PENDING.value,
        submitted_at=datetime.utcnow()
    )
    
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Pass expected bugs if provided (for backward compatibility)
    expected_bugs = submission.expected_bugs
    print(f"Debug - user_challenge_id: {user_challenge.id}, expected_bugs: {expected_bugs}")
    background_tasks.add_task(evaluate_submission_background, db_submission.id, expected_bugs)
    
    return SubmissionResponse(
        id=db_submission.id,
        challenge_id=user_challenge.id,  # Return user challenge ID
        score=0,
        accuracy_rate=0,
        bugs_found=0,
        bugs_missed=0,
        false_positives=0,
        status=SubmissionStatus.PENDING,
        ai_feedback="Your submission is being evaluated...",
        submitted_at=db_submission.submitted_at
    )

@router.get("/{submission_id}", response_model=DetailedSubmissionResponse)
async def get_submission(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return DetailedSubmissionResponse(
        id=submission.id,
        challenge_id=submission.user_challenge_id,  # Return user challenge ID
        score=submission.score,
        accuracy_rate=submission.accuracy_rate,
        bugs_found=submission.bugs_found,
        bugs_missed=submission.bugs_missed,
        false_positives=submission.false_positives,
        status=submission.status,
        ai_feedback=submission.ai_feedback,
        submitted_at=submission.submitted_at,
        identified_bugs=submission.identified_bugs or [],
        evaluation_details=submission.evaluation_details
    )

@router.get("/candidate/{candidate_id}", response_model=List[SubmissionResponse])
async def get_candidate_submissions(
    candidate_id: str,
    db: Session = Depends(get_db)
):
    submissions = db.query(SubmissionDB).filter(
        SubmissionDB.candidate_id == candidate_id
    ).order_by(SubmissionDB.submitted_at.desc()).all()
    
    return [
        SubmissionResponse(
            id=s.id,
            challenge_id=s.challenge_id,
            score=s.score,
            accuracy_rate=s.accuracy_rate,
            bugs_found=s.bugs_found,
            bugs_missed=s.bugs_missed,
            false_positives=s.false_positives,
            status=s.status,
            ai_feedback=s.ai_feedback,
            submitted_at=s.submitted_at
        )
        for s in submissions
    ]

@router.get("/leaderboard/global", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    candidates = db.query(CandidateDB).order_by(
        CandidateDB.total_score.desc()
    ).limit(limit).all()
    
    entries = []
    for rank, candidate in enumerate(candidates, 1):
        entries.append(LeaderboardEntry(
            rank=rank,
            candidate_id=candidate.anonymous_id,
            display_name=candidate.display_name,
            total_score=candidate.total_score,
            challenges_completed=candidate.challenges_completed,
            average_accuracy=candidate.average_accuracy,
            total_bugs_found=candidate.total_bugs_found,
            last_submission=candidate.last_active
        ))
    
    return LeaderboardResponse(
        entries=entries,
        total_participants=db.query(CandidateDB).count()
    )