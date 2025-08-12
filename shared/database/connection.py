from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from typing import Generator
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from project root
project_root = Path(__file__).parent.parent.parent
env_path = project_root / '.env'
load_dotenv(env_path)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./talentai.db")

# Ensure absolute path for SQLite
if DATABASE_URL.startswith("sqlite"):
    db_path = DATABASE_URL.replace("sqlite:///./", "")
    db_full_path = project_root / db_path
    DATABASE_URL = f"sqlite:///{db_full_path}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False  # Set to True for SQL debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    from .models import Base
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def get_session() -> Session:
    """Get a database session for scripts and testing"""
    return SessionLocal()