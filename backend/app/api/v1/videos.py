"""
Video generation and management API routes
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.schemas.video import (
    VideoGenerateRequest,
    VideoResponse,
    VideoListResponse,
    VideoStatusResponse,
    ModelListResponse,
    ModelInfo,
)
from app.models.user import User
from app.models.video import VideoStatus
from app.services import video_service
from app.core.exceptions import (
    InsufficientCreditsException,
    NotFoundException,
    SubscriptionRequiredException,
    SubscriptionExpiredException,
)

router = APIRouter()


@router.post("/generate", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
def generate_video(
    video_request: VideoGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new video generation task

    Requires authentication and sufficient credits

    This endpoint:
    1. Creates a video record in database
    2. Deducts credits from user account
    3. Triggers async Celery task for video generation
    4. Returns immediately with pending status
    """
    try:
        # Create video record and deduct credits
        video = video_service.create_video_generation_task(db, current_user, video_request)

        # Trigger async video generation task
        from app.tasks.video_generation import generate_video_task
        generate_video_task.delay(video.id)

        print(f"✅ Video generation task queued for video_id: {video.id}")

        return video
    except SubscriptionRequiredException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except SubscriptionExpiredException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except InsufficientCreditsException as e:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=str(e),
        )


@router.get("", response_model=VideoListResponse)
def get_videos(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[VideoStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's video generation history
    """
    skip = (page - 1) * page_size
    videos, total = video_service.get_user_videos(
        db,
        current_user.id,
        skip=skip,
        limit=page_size,
        status=status_filter,
    )

    return VideoListResponse(
        videos=videos,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get specific video details
    """
    try:
        video = video_service.get_video_by_id(db, video_id, current_user.id)
        return video
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a video
    """
    try:
        video_service.delete_video(db, video_id, current_user.id)
        return None
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/{video_id}/retry", response_model=VideoResponse)
def retry_video_generation(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retry failed video generation
    """
    try:
        video = video_service.get_video_by_id(db, video_id, current_user.id)

        if video.status != VideoStatus.FAILED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only retry failed videos",
            )

        # Reset status to pending
        video = video_service.update_video_status(
            db,
            video_id,
            VideoStatus.PENDING,
            error_message=None,
        )

        return video

    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/models/list", response_model=ModelListResponse)
def get_available_models():
    """
    Get list of available AI models for video generation
    """
    models = video_service.get_available_models()
    return ModelListResponse(
        models=[ModelInfo(**model) for model in models]
    )
