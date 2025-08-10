from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime
import uuid

from ..database.connection import get_db
from ..database.models import SubmissionDB, ChallengeDB, CandidateDB
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
        challenge = db_session.query(ChallengeDB).filter(ChallengeDB.id == submission.challenge_id).first()
        
        if not submission:
            print(f"No submission found for ID: {submission_id}")
            return
        
        print(f"Found submission with challenge_id: {submission.challenge_id}")
        print(f"Challenge found: {challenge is not None}")
        
        submission.status = SubmissionStatus.EVALUATING.value
        db_session.commit()
        
        evaluator = CommentEvaluator()
        
        # Use provided expected bugs (for random challenges) or challenge bugs (for stored challenges)
        if expected_bugs_data:
            print(f"Using provided expected bugs: {len(expected_bugs_data)} bugs")
            expected_bugs = [Bug(**bug_data) for bug_data in expected_bugs_data]
            language = "python"  # Default for random challenges
        elif challenge:
            print(f"Using challenge expected bugs: {len(challenge.expected_bugs)} bugs")
            expected_bugs = [Bug(**bug_data) for bug_data in challenge.expected_bugs]
            language = challenge.language
        else:
            print(f"Error: No expected bugs found for submission {submission_id}")
            print(f"expected_bugs_data: {expected_bugs_data}")
            print(f"challenge: {challenge}")

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
        
        candidate = db_session.query(CandidateDB).filter(
            CandidateDB.anonymous_id == submission.candidate_id
        ).first()
        
        if candidate:
            candidate.total_score += submission.score
            candidate.challenges_completed += 1
            candidate.total_bugs_found += submission.bugs_found
            
            all_submissions = db_session.query(SubmissionDB).filter(
                SubmissionDB.candidate_id == submission.candidate_id,
                SubmissionDB.status == SubmissionStatus.COMPLETED.value
            ).all()
            
            if all_submissions:
                avg_accuracy = sum(s.accuracy_rate for s in all_submissions) / len(all_submissions)
                candidate.average_accuracy = avg_accuracy
            
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
    # For random challenges, challenge might not exist in database
    challenge = db.query(ChallengeDB).filter(ChallengeDB.id == submission.challenge_id).first()
    is_random_challenge = submission.challenge_id.startswith("random-")
    
    if not challenge and not is_random_challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    candidate_id = submission.candidate_id or f"anon_{uuid.uuid4().hex[:8]}"
    
    candidate = db.query(CandidateDB).filter(CandidateDB.anonymous_id == candidate_id).first()
    if not candidate:
        candidate = CandidateDB(
            anonymous_id=candidate_id,
            display_name=f"Debugger_{candidate_id[-4:]}"
        )
        db.add(candidate)
        db.commit()
    
    # Use bug_analysis (new format) or annotated_code (old format)
    analysis_text = submission.bug_analysis or submission.annotated_code
    
    db_submission = SubmissionDB(
        challenge_id=submission.challenge_id,
        candidate_id=candidate_id,
        annotated_code=analysis_text,
        status=SubmissionStatus.PENDING.value
    )
    
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Pass expected bugs for random challenges
    expected_bugs = submission.expected_bugs if is_random_challenge else None
    print(f"Debug - is_random_challenge: {is_random_challenge}, expected_bugs: {expected_bugs}")
    background_tasks.add_task(evaluate_submission_background, db_submission.id, expected_bugs)
    
    return SubmissionResponse(
        id=db_submission.id,
        challenge_id=db_submission.challenge_id,
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
        challenge_id=submission.challenge_id,
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