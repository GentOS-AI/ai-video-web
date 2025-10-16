"""
User management API routes
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db
from app.api.deps import get_current_user
from app.schemas.user import UserResponse, UserUpdate, UserCreditsResponse, RecentUsersResponse
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


@router.get("/recent", response_model=RecentUsersResponse)
def get_recent_users(
    db: Session = Depends(get_db),
):
    """
    Get recent 5 users and total user count (public endpoint)

    Returns:
        - recent_users: List of 5 most recent users with avatar
        - total_count: Total number of users
        - display_count: 7500 + total_count for display
    """
    # Get total user count
    total_count = db.query(func.count(User.id)).scalar() or 0

    # Get 5 most recent users with avatars
    recent_users = (
        db.query(User)
        .filter(User.avatar_url.isnot(None))
        .order_by(desc(User.created_at))
        .limit(5)
        .all()
    )

    # Calculate display count (7500 + real users)
    display_count = 7500 + total_count

    return RecentUsersResponse(
        recent_users=recent_users,
        total_count=total_count,
        display_count=display_count,
    )
