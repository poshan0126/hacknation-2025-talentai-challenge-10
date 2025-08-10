import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from database.connection import SessionLocal, init_db
from database.models import ChallengeDB
from models.challenge import BugType

def seed_challenges():
    init_db()
    db = SessionLocal()
    
    try:
        with open("challenges/sample_challenges.json", "r") as f:
            challenges = json.load(f)
        
        for challenge_data in challenges:
            existing = db.query(ChallengeDB).filter(
                ChallengeDB.title == challenge_data["title"]
            ).first()
            
            if existing:
                print(f"Challenge '{challenge_data['title']}' already exists, skipping...")
                continue
            
            challenge = ChallengeDB(
                title=challenge_data["title"],
                description=challenge_data["description"],
                buggy_code=challenge_data["buggy_code"],
                clean_code=challenge_data["clean_code"],
                language=challenge_data["language"],
                difficulty=challenge_data["difficulty"],
                bug_types=[bug["bug_type"] for bug in challenge_data["expected_bugs"]],
                expected_bugs=challenge_data["expected_bugs"],
                tags=challenge_data.get("tags", [])
            )
            
            db.add(challenge)
            print(f"Added challenge: {challenge_data['title']}")
        
        db.commit()
        print(f"\nSuccessfully seeded {len(challenges)} challenges!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_challenges()