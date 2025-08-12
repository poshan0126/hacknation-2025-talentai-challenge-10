#!/bin/bash

echo "🧹 Clearing History for JPS-QN2NWT"
echo "===================================="

USER_ID="JPS-QN2NWT"

# Use Python to clear the user's data
cd /Users/poshan/Documents/hacknation-2025-talentai-challenge-10/candidate-backend

python3 -c "
import sys
sys.path.insert(0, '/Users/poshan/Documents/hacknation-2025-talentai-challenge-10/candidate-backend')

from debugging_challenge.database.connection import SessionLocal
from debugging_challenge.database.models import CandidateDB, UserChallengeDB, SubmissionDB

session = SessionLocal()

# Get the user
user = session.query(CandidateDB).filter(CandidateDB.user_id == '$USER_ID').first()

if user:
    print(f'Found user: {user.display_name} (ID: {user.id})')
    
    # Delete all submissions for this user
    submissions = session.query(SubmissionDB).filter(SubmissionDB.candidate_id == user.id).all()
    for submission in submissions:
        session.delete(submission)
    print(f'  Deleted {len(submissions)} submissions')
    
    # Delete all user challenges
    challenges = session.query(UserChallengeDB).filter(UserChallengeDB.candidate_id == user.id).all()
    for challenge in challenges:
        session.delete(challenge)
    print(f'  Deleted {len(challenges)} challenges')
    
    # Reset user statistics
    user.total_score = 0.0
    user.challenges_completed = 0
    user.challenges_attempted = 0
    user.average_score = 0.0
    user.highest_score = 0.0
    user.total_bugs_found = 0
    user.total_bugs_missed = 0
    user.average_time_seconds = 0.0
    
    session.commit()
    print('  Reset all user statistics to 0')
    print('')
    print('✅ User history cleared successfully!')
else:
    print('❌ User not found')

session.close()
"

# Verify the cleanup
echo ""
echo "📊 Verifying Clean State:"
echo "-------------------------"
curl -s "http://localhost:8001/debug/api/users/$USER_ID/profile" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    stats = data['statistics']
    print(f'  User: {data[\"display_name\"]} ({data[\"user_id\"]})')
    print(f'  Challenges Attempted: {stats[\"challenges_attempted\"]}')
    print(f'  Challenges Completed: {stats[\"challenges_completed\"]}')
    print(f'  Total Score: {stats[\"total_score\"]}')
    print(f'  Average Score: {stats[\"average_score\"]}')
    print(f'  Highest Score: {stats[\"highest_score\"]}')
    print(f'  Bugs Found: {stats[\"total_bugs_found\"]}')
    print(f'  Bugs Missed: {stats[\"total_bugs_missed\"]}')
except:
    print('  Could not fetch profile - user may need to be recreated')
"

echo ""
echo "🎯 User JPS-QN2NWT is ready for fresh testing!"