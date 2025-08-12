"""
Resume parsing API endpoints.
"""
import json
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import tempfile
import shutil
from pydantic import BaseModel

from resume_parser.models.resume import ResumeStruct, ParsedResume, ParseRequest, ParseResponse
from resume_parser.services.parser import get_parser
from resume_parser.services.summarizer import get_summarizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/resumes",
    tags=["resumes"],
    responses={404: {"description": "Not found"}},
)

# Initialize services
parser = get_parser()
summarizer = get_summarizer()

@router.post("/parse", response_model=ParseResponse)
async def parse_resume(request: ParseRequest):
    """Parse a resume from text content and generate summary."""
    start_time = datetime.utcnow()
    
    try:
        # Set LLM provider if specified
        if hasattr(request, 'llm_provider') and request.llm_provider:
            summarizer.set_provider(request.llm_provider)
        
        # Parse the resume content
        resume_data = parser.parse_markdown(request.content)
        
        # Generate summary
        summary = summarizer.summarize_resume(
            resume_data,
            max_length=request.max_length,
            tone=request.tone,
            focus_areas=request.focus_areas
        )
        
        # Get provider info
        llm_provider = summarizer.get_current_provider_name()
        llm_model = summarizer.get_current_model_name()
        
        # Create response
        parsed_resume = ParsedResume(
            filename=request.filename or "uploaded_resume",
            parsed_at=datetime.utcnow(),
            data=resume_data,
            summary=summary,
            llm_provider=llm_provider,
            llm_model=llm_model
        )
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        return ParseResponse(
            success=True,
            data=parsed_resume,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error parsing resume: {e}")
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        return ParseResponse(
            success=False,
            error=str(e),
            processing_time=processing_time
        )

@router.post("/parse-file", response_model=ParseResponse)
async def parse_resume_file(
    file: UploadFile = File(...),
    max_length: int = Form(200),
    tone: str = Form("professional"),
    focus_areas: Optional[str] = Form(None),
    llm_provider: Optional[str] = Form(None)
):
    """Parse a resume from uploaded file (PDF, MD, or TXT) and generate summary."""
    start_time = datetime.utcnow()
    
    try:
        # Check file extension
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
        
        # Parse focus areas if provided
        focus_list = None
        if focus_areas:
            focus_list = [area.strip() for area in focus_areas.split(',') if area.strip()]
        
        # Set LLM provider if specified
        if llm_provider:
            summarizer.set_provider(llm_provider)
        
        # Generate summary
        summary = summarizer.summarize_resume(
            resume_data,
            max_length=max_length,
            tone=tone,
            focus_areas=focus_list
        )
        
        # Get provider info
        llm_provider_name = summarizer.get_current_provider_name()
        llm_model = summarizer.get_current_model_name()
        
        # Create response
        parsed_resume = ParsedResume(
            filename=file.filename,
            parsed_at=datetime.utcnow(),
            data=resume_data,
            summary=summary,
            llm_provider=llm_provider_name,
            llm_model=llm_model
        )
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        return ParseResponse(
            success=True,
            data=parsed_resume,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error parsing file: {e}")
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        return ParseResponse(
            success=False,
            error=str(e),
            processing_time=processing_time
        )

class BatchParseRequest(BaseModel):
    input_dir: str
    output_dir: str
    max_length: int = 200
    tone: str = "professional"
    focus_areas: Optional[List[str]] = None
    llm_provider: Optional[str] = None

@router.post("/parse-batch")
async def parse_batch(request: BatchParseRequest):
    """Parse multiple resume files from a directory."""
    try:
        input_path = Path(request.input_dir)
        output_path = Path(request.output_dir)
        
        if not input_path.exists():
            raise HTTPException(status_code=400, detail=f"Input directory does not exist: {request.input_dir}")
        
        # Set LLM provider if specified
        if request.llm_provider:
            summarizer.set_provider(request.llm_provider)
        
        # Find markdown files
        files = list(input_path.glob("*.md"))
        if not files:
            raise HTTPException(status_code=400, detail=f"No markdown files found in {request.input_dir}")
        
        results = []
        for file_path in files:
            try:
                # Parse file
                resume_data = parser.parse_file(file_path)
                
                # Generate summary
                summary = summarizer.summarize_resume(
                    resume_data,
                    max_length=request.max_length,
                    tone=request.tone,
                    focus_areas=request.focus_areas
                )
                
                # Get provider info
                llm_provider = summarizer.get_current_provider_name()
                llm_model = summarizer.get_current_model_name()
                
                # Create result
                parsed_resume = ParsedResume(
                    filename=file_path.name,
                    parsed_at=datetime.utcnow(),
                    data=resume_data,
                    summary=summary,
                    llm_provider=llm_provider,
                    llm_model=llm_model
                )
                
                results.append(parsed_resume)
                
            except Exception as e:
                logger.error(f"Failed to process {file_path.name}: {e}")
        
        # Save results
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save individual results
        for result in results:
            output_file = output_path / f"{Path(result.filename).stem}.json"
            output_file.write_text(result.to_json(), encoding="utf-8")
        
        # Save combined results
        combined_file = output_path / "combined_results.json"
        combined_data = {
            "processed_at": datetime.utcnow().isoformat() + "Z",
            "total_files": len(files),
            "successful_parses": len(results),
            "llm_provider": results[0].llm_provider if results else "unknown",
            "llm_model": results[0].llm_model if results else "unknown",
            "results": [r.to_dict() for r in results]
        }
        combined_file.write_text(json.dumps(combined_data, indent=2), encoding="utf-8")
        
        return {
            "success": True,
            "total_files": len(files),
            "successful_parses": len(results),
            "output_directory": str(output_path),
            "message": f"Processed {len(results)} out of {len(files)} files"
        }
        
    except Exception as e:
        logger.error(f"Error in batch processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))