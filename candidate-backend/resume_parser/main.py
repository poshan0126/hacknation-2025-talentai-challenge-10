"""
Resume Parser FastAPI application.
Following the debugging_challenge architecture pattern.
"""
from fastapi import FastAPI
from contextlib import asynccontextmanager

from resume_parser.api import resumes, analysis, user_resume

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize any required resources on startup
    print("Resume Parser Service Starting...")
    yield
    # Clean up resources on shutdown
    print("Resume Parser Service Shutting Down...")

app = FastAPI(
    title="Resume Parser Service",
    description="AI-powered resume parsing and analysis platform",
    version="1.0.0",
    lifespan=lifespan
)

# Include routers
app.include_router(resumes.router)
app.include_router(analysis.router)
app.include_router(user_resume.router)

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Resume Parser",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "/api/resumes/parse": "Parse resume from text content",
            "/api/resumes/parse-file": "Parse resume from file upload",
            "/api/resumes/parse-batch": "Parse multiple resume files",
            "/api/resume-analysis/providers": "Get available LLM providers",
            "/api/resume-analysis/generate": "Generate synthetic resumes",
            "/api/resume-analysis/health": "Service health check"
        }
    }

@app.get("/health")
async def health_check():
    """Quick health check endpoint."""
    return {"status": "healthy", "service": "resume_parser"}