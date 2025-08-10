#!/usr/bin/env python3
"""
Database initialization script for Debugging Challenge
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import inspect
from debugging_challenge.database import engine, init_db, SessionLocal
from debugging_challenge.database.models import Base, ChallengeDB, SubmissionDB, CandidateDB
from debugging_challenge.models.challenge import DifficultyLevel, BugType
import json
from datetime import datetime
import uuid

def check_database_exists():
    """Check if database and tables exist"""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    required_tables = ['challenges', 'submissions', 'candidates']
    missing_tables = [table for table in required_tables if table not in existing_tables]
    
    return len(missing_tables) == 0, missing_tables

def create_database():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    
    # Verify tables were created
    inspector = inspect(engine)
    created_tables = inspector.get_table_names()
    print(f"✓ Created tables: {', '.join(created_tables)}")

def drop_all_tables():
    """Drop all existing tables (use with caution!)"""
    print("⚠️  Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ All tables dropped")

def get_table_info():
    """Get information about database tables"""
    inspector = inspect(engine)
    
    print("\n📊 Database Table Information:")
    print("-" * 50)
    
    for table_name in inspector.get_table_names():
        print(f"\n📋 Table: {table_name}")
        columns = inspector.get_columns(table_name)
        for col in columns:
            nullable = "NULL" if col['nullable'] else "NOT NULL"
            print(f"  - {col['name']}: {col['type']} {nullable}")
        
        # Get row count
        session = SessionLocal()
        try:
            if table_name == 'challenges':
                count = session.query(ChallengeDB).count()
            elif table_name == 'submissions':
                count = session.query(SubmissionDB).count()
            elif table_name == 'candidates':
                count = session.query(CandidateDB).count()
            else:
                count = 0
            print(f"  📊 Row count: {count}")
        finally:
            session.close()

def create_sample_data():
    """Create sample data for testing"""
    session = SessionLocal()
    try:
        # Check if data already exists
        existing_challenges = session.query(ChallengeDB).count()
        if existing_challenges > 0:
            print(f"ℹ️  Database already contains {existing_challenges} challenges")
            return
        
        print("Creating sample data...")
        
        # Create sample challenges
        sample_challenges = [
            {
                "title": "Fix the Sum Function",
                "description": "This function should calculate the sum of all numbers in the array, but it has bugs.",
                "buggy_code": """def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers) - 1):  # Bug: off-by-one error
        total = numbers[i]  # Bug: assignment instead of addition
    return total""",
                "clean_code": """def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total""",
                "language": "python",
                "difficulty": DifficultyLevel.EASY.value,
                "bug_types": [BugType.OFF_BY_ONE.value, BugType.LOGIC_ERROR.value],
                "expected_bugs": [
                    {
                        "line_number": 3,
                        "bug_type": BugType.OFF_BY_ONE.value,
                        "description": "Loop misses the last element due to range(len(numbers) - 1)",
                        "hint": "Check the loop bounds"
                    },
                    {
                        "line_number": 4,
                        "bug_type": BugType.LOGIC_ERROR.value,
                        "description": "Using assignment (=) instead of addition (+=)",
                        "hint": "Check the accumulation operator"
                    }
                ],
                "max_score": 100,
                "time_limit_minutes": 15,
                "tags": ["arrays", "loops", "basic"]
            },
            {
                "title": "Debug the Factorial Function",
                "description": "Find and fix the bugs in this factorial implementation.",
                "buggy_code": """def factorial(n):
    if n == 1:  # Bug: doesn't handle n=0
        return 1
    result = 1
    for i in range(2, n):  # Bug: should be range(2, n+1)
        result *= i
    return result""",
                "clean_code": """def factorial(n):
    if n <= 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result""",
                "language": "python",
                "difficulty": DifficultyLevel.MEDIUM.value,
                "bug_types": [BugType.LOGIC_ERROR.value, BugType.OFF_BY_ONE.value],
                "expected_bugs": [
                    {
                        "line_number": 2,
                        "bug_type": BugType.LOGIC_ERROR.value,
                        "description": "Doesn't handle factorial(0) which should return 1",
                        "hint": "Consider edge cases for factorial"
                    },
                    {
                        "line_number": 5,
                        "bug_type": BugType.OFF_BY_ONE.value,
                        "description": "Loop doesn't include n itself, range should be (2, n+1)",
                        "hint": "Check if the loop includes all necessary values"
                    }
                ],
                "max_score": 100,
                "time_limit_minutes": 20,
                "tags": ["math", "loops", "edge-cases"]
            },
            {
                "title": "Array Index Bug Hunt",
                "description": "This function finds the maximum element but has subtle bugs.",
                "buggy_code": """def find_max(arr):
    if len(arr) == 0:  # Bug: should check if arr is None too
        return None
    max_val = arr[0]
    for i in range(0, len(arr)):  # Bug: redundant iteration over first element
        if arr[i] > max_val:
            max_val = arr[i+1]  # Bug: wrong index, should be arr[i]
    return max_val""",
                "clean_code": """def find_max(arr):
    if not arr:
        return None
    max_val = arr[0]
    for i in range(1, len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val""",
                "language": "python",
                "difficulty": DifficultyLevel.MEDIUM.value,
                "bug_types": [BugType.LOGIC_ERROR.value, BugType.RUNTIME_ERROR.value],
                "expected_bugs": [
                    {
                        "line_number": 2,
                        "bug_type": BugType.LOGIC_ERROR.value,
                        "description": "Doesn't check if arr is None, only checks empty list",
                        "hint": "Consider all edge cases for input validation"
                    },
                    {
                        "line_number": 7,
                        "bug_type": BugType.RUNTIME_ERROR.value,
                        "description": "Index out of bounds: arr[i+1] when i is at last element",
                        "hint": "Check array indexing"
                    }
                ],
                "max_score": 100,
                "time_limit_minutes": 20,
                "tags": ["arrays", "algorithms", "edge-cases"]
            }
        ]
        
        # Add challenges to database
        for challenge_data in sample_challenges:
            challenge = ChallengeDB(**challenge_data)
            session.add(challenge)
        
        session.commit()
        print(f"✓ Created {len(sample_challenges)} sample challenges")
        
        # Create sample candidates with proper user IDs
        from debugging_challenge.services.user_service import UserService
        
        candidates_data = [
            {
                "first_name": "John",
                "middle_name": "Paul",
                "last_name": "Smith",
                "email": "john.smith@example.com"
            },
            {
                "first_name": "Emma",
                "middle_name": None,
                "last_name": "Johnson",
                "email": "emma.j@example.com"
            },
            {
                "first_name": "Michael",
                "middle_name": "Alexander",
                "last_name": "Brown",
                "email": "m.brown@example.com"
            }
        ]
        
        created_users = []
        for data in candidates_data:
            user = UserService.create_user(
                db=session,
                first_name=data["first_name"],
                middle_name=data["middle_name"],
                last_name=data["last_name"],
                email=data["email"]
            )
            created_users.append(user)
            print(f"✓ Created user: {user.display_name} (ID: {user.user_id})")
        
        print(f"✓ Created {len(created_users)} sample users")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error creating sample data: {e}")
        raise
    finally:
        session.close()

def main():
    """Main function to initialize database"""
    print("🚀 Debugging Challenge Database Initialization")
    print("=" * 50)
    
    # Check current database status
    exists, missing_tables = check_database_exists()
    
    if exists:
        print("✅ Database already exists with all required tables")
        get_table_info()
        
        response = input("\nDo you want to recreate the database? (yes/no): ").lower()
        if response == 'yes':
            confirm = input("⚠️  This will DELETE all existing data. Are you sure? (yes/no): ").lower()
            if confirm == 'yes':
                drop_all_tables()
                create_database()
                create_sample_data()
            else:
                print("❌ Database recreation cancelled")
                return
        else:
            # Just add sample data if needed
            response = input("Do you want to add sample data? (yes/no): ").lower()
            if response == 'yes':
                create_sample_data()
    else:
        if missing_tables:
            print(f"⚠️  Missing tables: {', '.join(missing_tables)}")
        else:
            print("ℹ️  No database tables found")
        
        create_database()
        create_sample_data()
    
    print("\n✅ Database initialization complete!")
    get_table_info()

if __name__ == "__main__":
    main()