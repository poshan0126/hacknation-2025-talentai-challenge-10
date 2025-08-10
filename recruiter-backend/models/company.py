"""
Company model for storing company information
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func

# Use absolute imports to avoid relative import issues
try:
    from config.database import Base
except ImportError:
    # Fallback for when running as standalone script
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    from config.database import Base


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    industry = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)  # Small, Medium, Large, Enterprise
    location = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # Company culture and values
    culture_description = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    
    # Contact information
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job_postings = relationship("JobPosting", back_populates="company")
    
    def __repr__(self):
        return f"<Company(name='{self.name}', industry='{self.industry}')>"
