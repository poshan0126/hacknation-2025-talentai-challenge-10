from fastapi import FastAPI
from contextlib import asynccontextmanager

from candidate_recommendation.api import recommendations
from candidate_recommendation.database.connection import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="TalentAI Recruiter Backend",
    description="AI-powered talent matching platform for recruiters",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(recommendations.router)

@app.get("/")
async def root():
    return {
        "message": "TalentAI Recruiter Backend",
        "status": "operational",
        "endpoints": [
            "/api/recommendations",
            "/api/jobs"
        ]
    }