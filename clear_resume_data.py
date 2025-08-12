#!/usr/bin/env python3
"""
Script to clear all resume data for all users in the database.
This will reset resume-related fields to their default values.
"""

import sqlite3
import json
from pathlib import Path

# Database path
db_path = Path("/Users/poshan/Documents/hacknation-2025-talentai-challenge-10/data/talentai.db")

if not db_path.exists():
    print(f"❌ Database not found at {db_path}")
    exit(1)

print(f"📂 Using database: {db_path}")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check how many users have resume data
    cursor.execute("""
        SELECT COUNT(*) FROM candidates 
        WHERE phone IS NOT NULL 
        OR location IS NOT NULL 
        OR professional_title IS NOT NULL 
        OR resume_summary IS NOT NULL 
        OR skills IS NOT NULL 
        OR education IS NOT NULL 
        OR experience IS NOT NULL 
        OR resume_file_name IS NOT NULL
    """)
    count_before = cursor.fetchone()[0]
    print(f"📊 Found {count_before} users with resume data")
    
    # Clear resume data for all users
    cursor.execute("""
        UPDATE candidates 
        SET 
            phone = NULL,
            location = NULL,
            professional_title = NULL,
            resume_summary = NULL,
            skills = NULL,
            education = NULL,
            experience = NULL,
            resume_file_name = NULL,
            resume_parsed_at = NULL
        WHERE 1=1
    """)
    
    rows_affected = cursor.rowcount
    print(f"✅ Cleared resume data for {rows_affected} users")
    
    # Commit changes
    conn.commit()
    print("💾 Changes saved to database")
    
    # Verify the changes
    cursor.execute("""
        SELECT COUNT(*) FROM candidates 
        WHERE phone IS NOT NULL 
        OR location IS NOT NULL 
        OR professional_title IS NOT NULL 
        OR resume_summary IS NOT NULL 
        OR skills IS NOT NULL 
        OR education IS NOT NULL 
        OR experience IS NOT NULL 
        OR resume_file_name IS NOT NULL
    """)
    count_after = cursor.fetchone()[0]
    print(f"📊 Users with resume data after clearing: {count_after}")
    
    # Show some sample users to confirm
    cursor.execute("""
        SELECT user_id, display_name, email, professional_title, resume_file_name 
        FROM candidates 
        LIMIT 5
    """)
    
    print("\n📋 Sample users after clearing:")
    print("-" * 80)
    for row in cursor.fetchall():
        user_id, display_name, email, title, resume_file = row
        print(f"User: {display_name} ({user_id})")
        print(f"  Email: {email}")
        print(f"  Title: {title or 'None'}")
        print(f"  Resume: {resume_file or 'None'}")
        print("-" * 40)
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
    
finally:
    conn.close()
    print("\n✨ Done!")