"""
Showcase and homepage content API routes
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.showcase import (
    ShowcaseVideoListResponse,
    HeroVideoListResponse,
    TrialImageListResponse,
)
from app.services import showcase_service

router = APIRouter()


@router.get("/videos", response_model=ShowcaseVideoListResponse)
def get_showcase_videos(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(6, ge=1, le=50, description="Maximum number of records"),
    category: Optional[str] = Query(None, description="Filter by category"),
    featured: bool = Query(False, description="Only featured videos"),
    db: Session = Depends(get_db),
):
    """
    Get showcase videos for homepage display
    """
    videos, total = showcase_service.get_showcase_videos(
        db,
        skip=skip,
        limit=limit,
        category=category,
        featured_only=featured,
    )

    return ShowcaseVideoListResponse(
        videos=videos,
        total=total,
    )


@router.get("/featured", response_model=ShowcaseVideoListResponse)
def get_featured_videos(
    limit: int = Query(6, ge=1, le=20, description="Maximum number of videos"),
    db: Session = Depends(get_db),
):
    """
    Get featured showcase videos
    """
    videos, total = showcase_service.get_showcase_videos(
        db,
        limit=limit,
        featured_only=True,
    )

    return ShowcaseVideoListResponse(
        videos=videos,
        total=total,
    )


@router.get("/hero-videos", response_model=HeroVideoListResponse)
def get_hero_videos(
    limit: int = Query(3, ge=1, le=10, description="Maximum number of videos"),
    db: Session = Depends(get_db),
):
    """
    Get videos for hero carousel section
    """
    videos = showcase_service.get_hero_videos(db, limit=limit)

    return HeroVideoListResponse(
        videos=videos,
    )


@router.get("/trial-images", response_model=TrialImageListResponse)
def get_trial_images(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(8, ge=1, le=20, description="Maximum number of records"),
    db: Session = Depends(get_db),
):
    """
    Get trial images for user selection
    """
    images, total = showcase_service.get_trial_images(
        db,
        skip=skip,
        limit=limit,
    )

    return TrialImageListResponse(
        images=images,
        total=total,
    )
