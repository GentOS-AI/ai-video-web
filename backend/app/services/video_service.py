"""
Video service - Video generation and management
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.video import Video, VideoStatus, AIModel
from app.models.user import User
from app.core.config import settings
from app.core.exceptions import (
    InsufficientCreditsException,
    NotFoundException,
    SubscriptionRequiredException,
    SubscriptionExpiredException,
)
from app.schemas.video import VideoGenerateRequest


def create_video_generation_task(
    db: Session,
    user: User,
    video_request: VideoGenerateRequest,
) -> Video:
    """
    Create a new video generation task

    Args:
        db: Database session
        user: User requesting the video
        video_request: Video generation request data

    Returns:
        Created video instance

    Raises:
        SubscriptionRequiredException: If user doesn't have a subscription
        SubscriptionExpiredException: If user's subscription has expired
        InsufficientCreditsException: If user doesn't have enough credits
    """
    # Check if user has a subscription
    if user.subscription_plan == "free":
        raise SubscriptionRequiredException(
            "Subscription required. Please upgrade to generate videos."
        )

    # Check if subscription is active
    if user.subscription_status != "active":
        raise SubscriptionExpiredException(
            "Your subscription is not active. Please renew your subscription."
        )

    # Check subscription expiry date
    if user.subscription_end_date and user.subscription_end_date < datetime.utcnow():
        raise SubscriptionExpiredException(
            "Your subscription has expired. Please renew to continue."
        )

    # Calculate credits cost based on model
    model_id = video_request.model
    if model_id == "sora-2-pro":
        credits_cost = settings.SORA_2_PRO_COST
    else:  # Default to sora-2
        credits_cost = settings.SORA_2_COST

    # Check if user has enough credits
    if user.credits < credits_cost:
        raise InsufficientCreditsException(
            f"Insufficient credits. Required: {credits_cost}, Available: {user.credits}"
        )

    # Create video record
    video = Video(
        user_id=user.id,
        prompt=video_request.prompt,
        model=video_request.model,
        reference_image_url=video_request.reference_image_url,
        status=VideoStatus.PENDING,
    )

    db.add(video)

    # Deduct credits based on model
    user.credits -= credits_cost

    print(f"💰 Credits deducted: {credits_cost} for model {model_id}")
    print(f"   Remaining credits: {user.credits}")

    db.commit()
    db.refresh(video)

    # TODO: Trigger async video generation task here
    # For now, we'll simulate by setting to processing status
    # In production, this would trigger a background job (Celery, etc.)

    return video


def get_user_videos(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    status: Optional[VideoStatus] = None,
) -> tuple[List[Video], int]:
    """
    Get videos for a specific user

    Args:
        db: Database session
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Optional status filter

    Returns:
        Tuple of (videos list, total count)
    """
    query = db.query(Video).filter(Video.user_id == user_id)

    if status:
        query = query.filter(Video.status == status)

    total = query.count()
    videos = query.order_by(desc(Video.created_at)).offset(skip).limit(limit).all()

    return videos, total


def get_video_by_id(db: Session, video_id: int, user_id: Optional[int] = None) -> Optional[Video]:
    """
    Get a video by ID

    Args:
        db: Database session
        video_id: Video ID
        user_id: Optional user ID to verify ownership

    Returns:
        Video instance or None

    Raises:
        NotFoundException: If video not found or doesn't belong to user
    """
    video = db.query(Video).filter(Video.id == video_id).first()

    if not video:
        raise NotFoundException(f"Video with id {video_id} not found")

    if user_id and video.user_id != user_id:
        raise NotFoundException(f"Video with id {video_id} not found")

    return video


def delete_video(db: Session, video_id: int, user_id: int) -> bool:
    """
    Delete a video

    Args:
        db: Database session
        video_id: Video ID
        user_id: User ID

    Returns:
        True if deleted successfully

    Raises:
        NotFoundException: If video not found or doesn't belong to user
    """
    video = get_video_by_id(db, video_id, user_id)

    if not video:
        return False

    db.delete(video)
    db.commit()

    return True


def update_video_status(
    db: Session,
    video_id: int,
    status: VideoStatus,
    video_url: Optional[str] = None,
    poster_url: Optional[str] = None,
    error_message: Optional[str] = None,
) -> Video:
    """
    Update video status and metadata

    Args:
        db: Database session
        video_id: Video ID
        status: New status
        video_url: Optional video URL
        poster_url: Optional poster URL
        error_message: Optional error message

    Returns:
        Updated video instance
    """
    video = get_video_by_id(db, video_id)

    if not video:
        raise NotFoundException(f"Video with id {video_id} not found")

    video.status = status

    if video_url:
        video.video_url = video_url

    if poster_url:
        video.poster_url = poster_url

    if error_message:
        video.error_message = error_message

    db.commit()
    db.refresh(video)

    return video


# AI model information
AI_MODELS_INFO = [
    {
        "id": "sora-2",
        "name": "Sora-2",
        "version": "Standard",
        "description": "Advanced AI video generation model with high-quality results (100 credits)",
        "credits_cost": 100,
    },
    {
        "id": "sora-2-pro",
        "name": "Sora-2 Pro",
        "version": "Premium",
        "description": "Professional-grade AI video generation with enhanced quality and features (300 credits)",
        "credits_cost": 300,
    },
]


def get_available_models() -> List[dict]:
    """
    Get list of available AI models

    Returns:
        List of model information
    """
    return AI_MODELS_INFO
