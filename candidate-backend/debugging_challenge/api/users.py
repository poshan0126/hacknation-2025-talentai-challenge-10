from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from ..database.connection import get_db
from ..services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])

class CreateUserRequest(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: str

class UserResponse(BaseModel):
    user_id: str
    display_name: str
    email: str
    statistics: dict

@router.post("/create", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db)
):
    """Create a new user with auto-generated ID"""
    user = UserService.create_user(
        db=db,
        first_name=request.first_name,
        middle_name=request.middle_name,
        last_name=request.last_name,
        email=request.email
    )
    
    return UserResponse(
        user_id=user.user_id,
        display_name=user.display_name,
        email=user.email,
        statistics={
            "challenges_completed": 0,
            "challenges_attempted": 0,
            "average_score": 0,
            "total_bugs_found": 0
        }
    )

@router.get("/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user profile with statistics"""
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.user_id,
        "display_name": user.display_name,
        "email": user.email,
        "statistics": {
            "total_score": user.total_score,
            "challenges_completed": user.challenges_completed,
            "challenges_attempted": user.challenges_attempted,
            "average_score": user.average_score,
            "highest_score": user.highest_score,
            "total_bugs_found": user.total_bugs_found,
            "total_bugs_missed": user.total_bugs_missed,
            "average_time_seconds": user.average_time_seconds,
            "member_since": user.created_at.isoformat() if user.created_at else None,
            "last_active": user.last_active.isoformat() if user.last_active else None
        }
    }

@router.get("/{user_id}/history")
async def get_user_history(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user's complete challenge history"""
    history = UserService.get_user_history(db, user_id)
    if not history:
        raise HTTPException(status_code=404, detail="User not found")
    
    return history

@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get top users by average score"""
    return UserService.get_leaderboard(db, limit)

@router.get("/all")
async def get_all_users(db: Session = Depends(get_db)):
    """Get all users for dropdown selection"""
    try:
        from sqlalchemy import text
        # Use raw SQL to avoid SQLAlchemy model issues
        result = db.execute(text("SELECT user_id, display_name, email FROM candidates WHERE user_id IS NOT NULL ORDER BY display_name"))
        users = result.fetchall()
        
        return [
            {
                "user_id": user[0],
                "display_name": user[1], 
                "email": user[2] or ""
            }
            for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.post("/{user_id}/update-stats")
async def update_user_statistics(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Recalculate user statistics based on submissions"""
    UserService.update_user_statistics(db, user_id)
    return {"message": f"Statistics updated for user {user_id}"}