#!/usr/bin/env python3
"""
Script to update user statistics based on their challenge attempts
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from candidate_backend.debugging_challenge.database.models import CandidateDB, UserChallengeDB, SubmissionDB
from datetime import datetime

# Create database connection
engine = create_engine('sqlite:///candidate-backend/talentai.db')
Session = sessionmaker(bind=engine)
session = Session()

def update_user_statistics(user_id: str):
    """Update statistics for a specific user"""
    
    # Get the user
    user = session.query(CandidateDB).filter(CandidateDB.user_id == user_id).first()
    if not user:
        print(f"User {user_id} not found")
        return
    
    print(f"Updating statistics for {user.display_name} ({user_id})")
    
    # Get all user's challenges
    challenges = session.query(UserChallengeDB).filter(
        UserChallengeDB.candidate_id == user.id
    ).all()
    
    # Update some challenges with better scores (simulate actual attempts)
    for i, challenge in enumerate(challenges[:3]):  # Update first 3 challenges
        if i == 0:  # First challenge - good score
            challenge.best_score = 85.0
            challenge.attempts = 2
            challenge.completed = True
            challenge.completed_at = datetime.utcnow()
        elif i == 1:  # Second challenge - medium score
            challenge.best_score = 65.0
            challenge.attempts = 1
            challenge.completed = False
        elif i == 2:  # Third challenge - low score  
            challenge.best_score = 45.0
            challenge.attempts = 1
            challenge.completed = False
        
        challenge.last_attempted = datetime.utcnow()
    
    # Calculate user statistics
    attempted_challenges = [c for c in challenges if c.attempts > 0]
    completed_challenges = [c for c in challenges if c.completed]
    
    if attempted_challenges:
        total_score = sum(c.best_score for c in attempted_challenges)
        average_score = total_score / len(attempted_challenges)
        highest_score = max(c.best_score for c in attempted_challenges)
    else:
        total_score = 0
        average_score = 0
        highest_score = 0
    
    # Update user record
    user.challenges_attempted = len(attempted_challenges)
    user.challenges_completed = len(completed_challenges)
    user.total_score = total_score
    user.average_score = average_score
    user.highest_score = highest_score
    user.total_bugs_found = 8  # Simulate some bugs found
    user.total_bugs_missed = 4  # Simulate some bugs missed
    user.last_active = datetime.utcnow()
    
    session.commit()
    
    print(f"Updated stats:")
    print(f"  - Challenges Attempted: {user.challenges_attempted}")
    print(f"  - Challenges Completed: {user.challenges_completed}")
    print(f"  - Total Score: {user.total_score:.1f}")
    print(f"  - Average Score: {user.average_score:.1f}")
    print(f"  - Highest Score: {user.highest_score:.1f}")

if __name__ == "__main__":
    # Update JPS user
    update_user_statistics("JPS-QN2NWT")
    
    # Get all users for leaderboard
    print("\n📊 Updated Leaderboard:")
    users = session.query(CandidateDB).filter(
        CandidateDB.challenges_attempted > 0
    ).order_by(
        CandidateDB.average_score.desc()
    ).all()
    
    for rank, user in enumerate(users, 1):
        print(f"#{rank} {user.user_id} - Avg: {user.average_score:.1f}%, Completed: {user.challenges_completed}")
    
    session.close()
    print("\n✅ Statistics updated successfully!")