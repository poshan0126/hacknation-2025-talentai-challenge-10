"""
User resume upload and profile update API endpoints.
"""
import logging
from datetime import datetime
from typing import Optional
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json

from resume_parser.services.parser import get_parser
from resume_parser.services.summarizer import get_summarizer
from debugging_challenge.database.connection import get_db
from debugging_challenge.database.models import CandidateDB

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/user-resume",
    tags=["user-resume"],
    responses={404: {"description": "Not found"}},
)

# Initialize services
parser = get_parser()
summarizer = get_summarizer()

@router.post("/upload/{user_id}")
async def upload_and_parse_resume(
    user_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a resume file, parse it, and update the user's profile.
    """
    try:
        # Find the user in the database
        candidate = db.query(CandidateDB).filter(CandidateDB.user_id == user_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        # Check file type and parse accordingly
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext == '.pdf':
            # Save PDF temporarily and parse it
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_path = Path(tmp_file.name)
            
            try:
                # Parse PDF file
                resume_data = parser.parse_pdf(tmp_path)
            finally:
                # Clean up temp file
                tmp_path.unlink(missing_ok=True)
        else:
            # For text/markdown files, read directly
            content = await file.read()
            text_content = content.decode('utf-8')
            resume_data = parser.parse_markdown(text_content)
        
        # Generate summary
        summary = summarizer.summarize_resume(
            resume_data,
            max_length=300,
            tone="professional",
            focus_areas=["skills", "experience"]
        )
        
        # Update the candidate profile with parsed resume data
        candidate.phone = resume_data.phone
        candidate.location = resume_data.location
        candidate.professional_title = resume_data.title
        candidate.resume_summary = summary
        
        # Convert education to JSON-serializable format
        education_list = []
        for edu in resume_data.education:
            education_list.append({
                "institution": edu.institution,
                "degree": edu.degree,
                "field_of_study": edu.field_of_study,
                "year": edu.year,
                "gpa": edu.gpa,
                "location": edu.location
            })
        candidate.education = education_list
        
        # Convert experience to JSON-serializable format
        experience_list = []
        for exp in resume_data.experience:
            experience_list.append({
                "company": exp.company,
                "title": exp.title,
                "start": exp.start,
                "end": exp.end,
                "location": exp.location,
                "highlights": exp.highlights
            })
        candidate.experience = experience_list
        
        # Store skills directly (already a dict)
        candidate.skills = resume_data.skills
        
        # Update metadata
        candidate.resume_parsed_at = datetime.utcnow()
        candidate.resume_file_name = file.filename
        
        # Commit changes to database
        db.commit()
        db.refresh(candidate)
        
        # Return properly encoded JSON response
        response_data = {
            "success": True,
            "message": f"Resume successfully parsed and profile updated for user {user_id}",
            "data": {
                "user_id": user_id,
                "name": resume_data.name,
                "title": resume_data.title,
                "email": resume_data.email,
                "phone": resume_data.phone,
                "location": resume_data.location,
                "summary": summary.replace('\x00', '').replace('\r', '').replace('\n', ' '),  # Clean control characters
                "skills": resume_data.skills,
                "education_count": len(resume_data.education),
                "experience_count": len(resume_data.experience),
                "resume_file": file.filename,
                "parsed_at": candidate.resume_parsed_at.isoformat() if candidate.resume_parsed_at else None
            }
        }
        
        return JSONResponse(content=response_data)
        
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Please upload a UTF-8 encoded text or markdown file.")
    except Exception as e:
        logger.error(f"Error processing resume for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{user_id}")
async def get_user_resume_data(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get the parsed resume data from a user's profile.
    """
    try:
        # Find the user in the database
        candidate = db.query(CandidateDB).filter(CandidateDB.user_id == user_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        # Check if user has resume data
        if not candidate.resume_parsed_at:
            return {
                "success": True,
                "has_resume": False,
                "message": "No resume data found for this user"
            }
        
        return {
            "success": True,
            "has_resume": True,
            "data": {
                "user_id": user_id,
                "name": candidate.display_name,
                "email": candidate.email,
                "phone": candidate.phone,
                "location": candidate.location,
                "professional_title": candidate.professional_title,
                "summary": candidate.resume_summary,
                "skills": candidate.skills,
                "education": candidate.education,
                "experience": candidate.experience,
                "resume_file": candidate.resume_file_name,
                "parsed_at": candidate.resume_parsed_at.isoformat() if candidate.resume_parsed_at else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching resume data for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/profile/{user_id}")
async def delete_user_resume_data(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete the parsed resume data from a user's profile.
    """
    try:
        # Find the user in the database
        candidate = db.query(CandidateDB).filter(CandidateDB.user_id == user_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        # Clear resume data
        candidate.phone = None
        candidate.location = None
        candidate.professional_title = None
        candidate.resume_summary = None
        candidate.education = None
        candidate.experience = None
        candidate.skills = None
        candidate.resume_parsed_at = None
        candidate.resume_file_name = None
        
        # Commit changes
        db.commit()
        
        return {
            "success": True,
            "message": f"Resume data successfully deleted for user {user_id}"
        }
        
    except Exception as e:
        logger.error(f"Error deleting resume data for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))