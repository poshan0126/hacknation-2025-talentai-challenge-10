from fastapi import FastAPI
from contextlib import asynccontextmanager

from .api import challenges, submissions
from .database.connection import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Debugging Challenge Arena",
    description="AI-powered debugging challenge platform",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(challenges.router)
app.include_router(submissions.router)

@app.get("/")
async def debug_root():
    return {
        "message": "Debugging Challenge Arena",
        "status": "operational",
        "endpoints": [
            "/api/challenges",
            "/api/submissions"
        ]
    }