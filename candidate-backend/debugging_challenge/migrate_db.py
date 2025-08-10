#!/usr/bin/env python3
"""
Database migration script to add resume-related columns to candidates table.
"""
import sqlite3
import sys
from pathlib import Path

def migrate_database(db_path: str):
    """Add resume-related columns to candidates table if they don't exist."""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(candidates)")
    existing_columns = {row[1] for row in cursor.fetchall()}
    
    # Define columns to add
    columns_to_add = [
        ("phone", "TEXT"),
        ("location", "TEXT"),
        ("professional_title", "TEXT"),
        ("resume_summary", "TEXT"),
        ("education", "TEXT"),  # JSON stored as TEXT in SQLite
        ("experience", "TEXT"),  # JSON stored as TEXT in SQLite
        ("skills", "TEXT"),  # JSON stored as TEXT in SQLite
        ("resume_parsed_at", "DATETIME"),
        ("resume_file_name", "TEXT"),
    ]
    
    # Add missing columns
    for column_name, column_type in columns_to_add:
        if column_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE candidates ADD COLUMN {column_name} {column_type}")
                print(f"✅ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                print(f"⚠️  Could not add column {column_name}: {e}")
        else:
            print(f"ℹ️  Column already exists: {column_name}")
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print("\n✅ Database migration completed!")

if __name__ == "__main__":
    # Database path - use the shared data directory
    db_path = "/app/data/talentai.db"
    
    # Check if running in Docker
    if not Path(db_path).exists():
        # Try local path
        db_path = "data/talentai.db"
    
    if not Path(db_path).exists():
        print(f"❌ Database not found at {db_path}")
        sys.exit(1)
    
    print(f"🔧 Migrating database: {db_path}")
    migrate_database(db_path)