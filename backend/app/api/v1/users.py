"""
User management API routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.schemas.user import UserResponse, UserUpdate, UserCreditsResponse
from app.models.user import User

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user profile
    """
    return current_user


@router.patch("/profile", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update current user profile
    """
    if user_update.name is not None:
        current_user.name = user_update.name

    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url

    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/credits", response_model=UserCreditsResponse)
def get_user_credits(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's remaining credits
    """
    return UserCreditsResponse(
        credits=current_user.credits,
        user_id=current_user.id,
    )
