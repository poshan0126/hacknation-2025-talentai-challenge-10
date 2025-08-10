from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Import debugging challenge routes
import sys
sys.path.insert(0, '/app/candidate-backend')
try:
    from debugging_challenge.main import app as debug_app
    print("Successfully imported debugging_challenge module")
except ImportError as e:
    # Fallback if debugging_challenge isn't available
    print(f"Failed to import debugging_challenge: {e}")
    from fastapi import FastAPI
    debug_app = FastAPI(title="Debug Challenge (Not Available)")

# Import resume parser routes
try:
    sys.path.insert(0, '/app/candidate-backend')
    from resume_parser.main import app as resume_app
    print("Successfully imported resume_parser module")
except ImportError as e:
    # Fallback if resume_parser isn't available
    print(f"Failed to import resume_parser: {e}")
    from fastapi import FastAPI
    resume_app = FastAPI(title="Resume Parser (Not Available)")

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize any shared services here
    yield

app = FastAPI(
    title="TalentAI Candidate Backend",
    description="Backend API for the TalentAI platform - all candidate features",
    version="1.0.0",
    lifespan=lifespan
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the debugging challenge app
app.mount("/debug", debug_app)

# Mount the resume parser app
app.mount("/resume", resume_app)

@app.get("/")
async def root():
    return {
        "message": "TalentAI Candidate Backend",
        "status": "operational",
        "features": [
            "/debug - Debugging Challenge Arena",
            "/resume - Resume Parser Service",
            "/docs - API Documentation"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}