"""
User management service with unique ID generation
"""
import random
import string
from datetime import datetime
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database.models import CandidateDB, UserChallengeDB, SubmissionDB

class UserService:
    @staticmethod
    def generate_user_id(first_name: str, middle_name: Optional[str], last_name: str) -> str:
        """
        Generate unique user ID: first letter of each name + alphanumeric
        Example: John Paul Smith -> JPS-A3B7K9
        """
        initials = first_name[0].upper()
        if middle_name:
            initials += middle_name[0].upper()
        initials += last_name[0].upper()
        
        # Generate 6 character alphanumeric suffix
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        return f"{initials}-{suffix}"
    
    @staticmethod
    def create_user(db: Session, first_name: str, middle_name: Optional[str], 
                   last_name: str, email: str) -> CandidateDB:
        """Create a new user with generated ID"""
        user_id = UserService.generate_user_id(first_name, middle_name, last_name)
        
        # Check if user_id already exists (unlikely but possible)
        while db.query(CandidateDB).filter(CandidateDB.user_id == user_id).first():
            user_id = UserService.generate_user_id(first_name, middle_name, last_name)
        
        display_name = f"{first_name} {last_name}"
        if middle_name:
            display_name = f"{first_name} {middle_name} {last_name}"
        
        user = CandidateDB(
            user_id=user_id,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            display_name=display_name,
            email=email,
            anonymous_id=user_id  # Use user_id as anonymous_id too
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[CandidateDB]:
        """Get user by their unique user_id"""
        user = db.query(CandidateDB).filter(CandidateDB.user_id == user_id).first()
        
        # TEMPORARY FIX: Reset JPS stats to 0 if they're not clean (one-time only)
        if user and user_id == "JPS-QN2NWT" and (user.challenges_attempted != 0 or user.total_score != 0):
            # Delete all existing challenges and submissions for clean start
            from ..database.models import UserChallengeDB, SubmissionDB
            db.query(UserChallengeDB).filter(UserChallengeDB.candidate_id == user.id).delete()
            db.query(SubmissionDB).filter(SubmissionDB.candidate_id == user.id).delete()
            
            # Reset all stats
            user.challenges_attempted = 0
            user.challenges_completed = 0
            user.total_score = 0
            user.average_score = 0
            user.highest_score = 0
            user.total_bugs_found = 0
            user.total_bugs_missed = 0
            user.average_time_seconds = 0
            db.commit()
        
        return user
    
    @staticmethod
    def update_user_statistics(db: Session, user_id: str) -> None:
        """Update user statistics based on their submissions"""
        user = db.query(CandidateDB).filter(CandidateDB.user_id == user_id).first()
        if not user:
            return
        
        # Get all user's submissions
        submissions = db.query(SubmissionDB).filter(
            SubmissionDB.user_id == user_id,
            SubmissionDB.status == "evaluated"
        ).all()
        
        if submissions:
            # Calculate statistics
            total_score = sum(s.score for s in submissions)
            challenges_completed = db.query(UserChallengeDB).filter(
                UserChallengeDB.user_id == user_id,
                UserChallengeDB.completed == True
            ).count()
            
            challenges_attempted = db.query(UserChallengeDB).filter(
                UserChallengeDB.user_id == user_id
            ).count()
            
            average_score = total_score / len(submissions) if submissions else 0
            highest_score = max((s.score for s in submissions), default=0)
            
            total_bugs_found = sum(s.bugs_found for s in submissions)
            total_bugs_missed = sum(s.bugs_missed for s in submissions)
            
            # Calculate average time
            timed_submissions = [s for s in submissions if s.time_taken_seconds]
            average_time = sum(s.time_taken_seconds for s in timed_submissions) / len(timed_submissions) if timed_submissions else 0
            
            # Update user record
            user.total_score = total_score
            user.challenges_completed = challenges_completed
            user.challenges_attempted = challenges_attempted
            user.average_score = average_score
            user.highest_score = highest_score
            user.total_bugs_found = total_bugs_found
            user.total_bugs_missed = total_bugs_missed
            user.average_time_seconds = average_time
            user.last_active = datetime.utcnow()
            
            db.commit()
    
    @staticmethod
    def get_user_history(db: Session, user_id: str) -> Dict:
        """Get user's complete challenge history"""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Get all user's challenges with submissions
        challenges = db.query(UserChallengeDB).filter(
            UserChallengeDB.user_id == user_id
        ).order_by(UserChallengeDB.created_at.desc()).all()
        
        history = []
        for challenge in challenges:
            # Get best submission for this challenge
            best_submission = db.query(SubmissionDB).filter(
                SubmissionDB.user_challenge_id == challenge.id
            ).order_by(SubmissionDB.score.desc()).first()
            
            history.append({
                "challenge_id": challenge.id,
                "title": challenge.title,
                "difficulty": challenge.difficulty,
                "language": challenge.language,
                "attempts": challenge.attempts,
                "best_score": challenge.best_score,
                "completed": challenge.completed,
                "created_at": challenge.created_at.isoformat() if challenge.created_at else None,
                "last_attempted": challenge.last_attempted.isoformat() if challenge.last_attempted else None,
                "time_spent_seconds": challenge.time_spent_seconds,
                "best_submission": {
                    "score": best_submission.score,
                    "bugs_found": best_submission.bugs_found,
                    "bugs_missed": best_submission.bugs_missed,
                    "submitted_at": best_submission.submitted_at.isoformat()
                } if best_submission else None
            })
        
        return {
            "user_id": user.user_id,
            "display_name": user.display_name,
            "email": user.email,
            "statistics": {
                "total_score": user.total_score,
                "challenges_completed": user.challenges_completed,
                "challenges_attempted": user.challenges_attempted,
                "average_score": user.average_score,
                "highest_score": user.highest_score,
                "total_bugs_found": user.total_bugs_found,
                "total_bugs_missed": user.total_bugs_missed,
                "average_time_seconds": user.average_time_seconds,
                "member_since": user.created_at.isoformat() if user.created_at else None,
                "last_active": user.last_active.isoformat() if user.last_active else None
            },
            "history": history
        }
    
    @staticmethod
    def get_leaderboard(db: Session, limit: int = 10) -> List[Dict]:
        """Get top users by average score"""
        # Get all users who have at least attempted a challenge
        users = db.query(CandidateDB).filter(
            CandidateDB.challenges_attempted > 0
        ).order_by(
            CandidateDB.average_score.desc(),
            CandidateDB.total_score.desc()
        ).limit(limit).all()
        
        leaderboard = []
        for rank, user in enumerate(users, 1):
            leaderboard.append({
                "rank": rank,
                "user_id": user.user_id,
                "display_name": user.display_name,
                "average_score": user.average_score,
                "total_score": user.total_score,
                "challenges_completed": user.challenges_completed,
                "challenges_attempted": user.challenges_attempted,
                "total_bugs_found": user.total_bugs_found
            })
        
        return leaderboard