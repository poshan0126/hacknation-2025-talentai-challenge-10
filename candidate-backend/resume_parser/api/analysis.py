"""
Resume analysis and utility API endpoints.
"""
import logging
from typing import List, Optional
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from resume_parser.services.summarizer import get_summarizer
from resume_parser.services.generator import generate_resumes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/resume-analysis",
    tags=["analysis"],
    responses={404: {"description": "Not found"}},
)

# Initialize services
summarizer = get_summarizer()

class ProviderInfo(BaseModel):
    provider: str
    available: bool
    model: Optional[str] = None

class GenerateRequest(BaseModel):
    count: int = 10
    output_dir: str = "/tmp/synthetic_resumes"
    make_pdf: bool = False

@router.get("/providers", response_model=List[ProviderInfo])
async def get_providers():
    """Get available LLM providers and their status."""
    available = summarizer.get_available_providers()
    providers = []
    
    for name, status in available.items():
        provider_info = ProviderInfo(
            provider=name,
            available=status,
            model=summarizer.get_model_for_provider(name) if status else None
        )
        providers.append(provider_info)
    
    return providers

@router.post("/set-provider")
async def set_llm_provider(provider: str):
    """Set the LLM provider for summarization."""
    try:
        summarizer.set_provider(provider)
        return {
            "success": True,
            "provider": provider,
            "message": f"LLM provider set to {provider}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate")
async def generate_synthetic_resumes(request: GenerateRequest):
    """Generate synthetic resumes for testing."""
    try:
        output_dir = Path(request.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate resumes
        resumes = generate_resumes(output_dir, request.count, request.make_pdf)
        
        return {
            "success": True,
            "count": request.count,
            "output_directory": str(output_dir),
            "formats": ["markdown", "text"] + (["pdf"] if request.make_pdf else []),
            "message": f"Generated {len(resumes)} synthetic resumes"
        }
        
    except Exception as e:
        logger.error(f"Error generating resumes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint for resume parser service."""
    from datetime import datetime
    
    # Check if summarizer is available
    providers = summarizer.get_available_providers()
    any_available = any(providers.values())
    
    return {
        "status": "healthy" if any_available else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "resume_parser",
        "providers": providers
    }